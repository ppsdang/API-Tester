import express from 'express';
import { PrismaClient } from '@prisma/client';
import { FlowExecutionEngine } from '../execution/engine';
import { FlowStepConfig, ExecutionContext } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Mock user ID (replace with actual auth later)
const MOCK_USER_ID = 'user-1';

/**
 * Execute a flow
 */
router.post('/run/:flowId', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { environmentId } = req.body;

    // Get flow with steps
    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      include: {
        steps: {
          include: { api: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Get environment if specified
    let environment = null;
    if (environmentId) {
      environment = await prisma.environment.findUnique({
        where: { id: environmentId },
      });
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        flowId,
        userId: MOCK_USER_ID,
        environmentId,
        status: 'running',
        totalSteps: flow.steps.length,
      },
    });

    // Execute flow in background (don't await)
    executeFlowAsync(execution.id, flow, environment).catch((error) => {
      console.error('Flow execution error:', error);
    });

    res.json({
      executionId: execution.id,
      status: 'running',
      message: 'Flow execution started',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get execution status and results
 */
router.get('/:id', async (req, res) => {
  try {
    const execution = await prisma.execution.findUnique({
      where: { id: req.params.id },
      include: {
        flow: true,
        environment: true,
        logs: {
          orderBy: { stepOrder: 'asc' },
        },
        variables: true,
      },
    });

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all executions for a flow
 */
router.get('/flow/:flowId', async (req, res) => {
  try {
    const executions = await prisma.execution.findMany({
      where: { flowId: req.params.flowId },
      include: {
        environment: true,
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    res.json(executions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get execution logs
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await prisma.executionLog.findMany({
      where: { executionId: req.params.id },
      include: { step: true },
      orderBy: { stepOrder: 'asc' },
    });

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete execution
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.execution.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Execution deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute flow asynchronously
 */
async function executeFlowAsync(
  executionId: string,
  flow: any,
  environment: any
) {
  try {
    const context: ExecutionContext = {
      variables: {},
      environment: environment ? {
        baseUrl: environment.baseUrl,
        variables: environment.variables,
        headers: environment.headers,
      } : undefined,
    };

    let passedSteps = 0;
    let failedSteps = 0;

    // Execute each step
    for (const step of flow.steps) {
      const stepConfig: FlowStepConfig = {
        stepOrder: step.stepOrder,
        name: step.name,
        description: step.description,
        apiId: step.apiId,
        method: step.method || step.api?.method,
        url: step.url || step.api?.path,
        headers: step.headers || step.api?.headers,
        queryParams: step.queryParams || step.api?.queryParams,
        pathParams: step.pathParams || step.api?.pathParams,
        requestBody: step.requestBody || step.api?.requestBody,
        extractVariables: step.extractVariables,
        assertions: step.assertions,
        condition: step.condition,
      };

      const result = await FlowExecutionEngine.executeStep(stepConfig, context);

      // Save execution log
      await prisma.executionLog.create({
        data: {
          executionId,
          stepId: step.id,
          stepOrder: result.stepOrder,
          stepName: result.stepName,
          status: result.status,
          requestMethod: result.request.method,
          requestUrl: result.request.url,
          requestHeaders: result.request.headers,
          requestBody: result.request.body,
          responseStatus: result.response?.status,
          responseHeaders: result.response?.headers,
          responseBody: result.response?.body,
          responseTime: result.response?.time,
          assertionResults: result.assertionResults,
          errorMessage: result.error?.message,
          errorStack: result.error?.stack,
        },
      });

      // Save extracted variables
      if (result.extractedVariables) {
        for (const [name, value] of Object.entries(result.extractedVariables)) {
          await prisma.executionVariable.upsert({
            where: {
              executionId_name: {
                executionId,
                name,
              },
            },
            create: {
              executionId,
              name,
              value: String(value),
            },
            update: {
              value: String(value),
            },
          });
        }
      }

      // Update counters
      if (result.status === 'passed') {
        passedSteps++;
      } else if (result.status === 'failed' || result.status === 'error') {
        failedSteps++;
      }

      // Stop execution if step failed (unless configured to continue)
      if (result.status === 'error') {
        break;
      }
    }

    // Update execution record
    const finalStatus = failedSteps > 0 ? 'failed' : 'passed';
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        passedSteps,
        failedSteps,
      },
    });
  } catch (error: any) {
    console.error('Flow execution failed:', error);

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'error',
        completedAt: new Date(),
        errorMessage: error.message,
      },
    });
  }
}

export default router;
