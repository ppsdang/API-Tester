import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AIAgent } from '../ai/agent';
import { ApiEndpoint, FlowStepConfig } from '../types';

const router = express.Router();
const prisma = new PrismaClient();
const aiAgent = new AIAgent();

// Mock user ID (replace with actual auth later)
const MOCK_USER_ID = 'user-1';

/**
 * Generate flow from natural language prompt
 */
router.post('/generate-flow', async (req, res) => {
  try {
    const { prompt, apiCollectionIds, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get available APIs
    let apis: ApiEndpoint[] = [];

    if (apiCollectionIds && apiCollectionIds.length > 0) {
      const dbApis = await prisma.api.findMany({
        where: {
          collectionId: { in: apiCollectionIds },
        },
      });
      apis = dbApis as any[];
    } else {
      // Get all user's APIs
      const dbApis = await prisma.api.findMany({
        where: { userId: MOCK_USER_ID },
      });
      apis = dbApis as any[];
    }

    // Generate flow using AI
    const result = await aiAgent.generateFlow(
      { prompt, context },
      apis
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze flow execution failure
 */
router.post('/analyze-failure', async (req, res) => {
  try {
    const { executionId } = req.body;

    if (!executionId) {
      return res.status(400).json({ error: 'Execution ID is required' });
    }

    // Get execution with logs
    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
      include: {
        flow: {
          include: {
            steps: {
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
        logs: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Analyze failure using AI
    const analysis = await aiAgent.analyzeFailure(
      execution.flow.name,
      execution.logs,
      execution.flow.steps as any[]
    );

    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Suggest assertions for a flow step
 */
router.post('/suggest-assertions', async (req, res) => {
  try {
    const { stepConfig, apiId } = req.body;

    if (!stepConfig) {
      return res.status(400).json({ error: 'Step configuration is required' });
    }

    // Get API if ID provided
    let api = null;
    if (apiId) {
      api = await prisma.api.findUnique({
        where: { id: apiId },
      });
    }

    // Suggest assertions using AI
    const assertions = await aiAgent.suggestAssertions(
      stepConfig as FlowStepConfig,
      api as any
    );

    res.json({ assertions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate test data for an API
 */
router.post('/generate-test-data', async (req, res) => {
  try {
    const { apiId, scenario } = req.body;

    if (!apiId) {
      return res.status(400).json({ error: 'API ID is required' });
    }

    const api = await prisma.api.findUnique({
      where: { id: apiId },
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    // Generate test data using AI
    const testData = await aiAgent.generateTestData(
      api as any,
      scenario || 'positive'
    );

    res.json({ testData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
