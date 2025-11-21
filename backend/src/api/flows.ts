import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Mock user ID (replace with actual auth later)
const MOCK_USER_ID = 'user-1';

/**
 * Create flow
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, steps } = req.body;

    const flow = await prisma.flow.create({
      data: {
        name,
        description,
        userId: MOCK_USER_ID,
        steps: {
          create: steps.map((step: any) => ({
            ...step,
          })),
        },
      },
      include: {
        steps: {
          include: { api: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    res.json(flow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all flows
 */
router.get('/', async (req, res) => {
  try {
    const flows = await prisma.flow.findMany({
      where: { userId: MOCK_USER_ID },
      include: {
        steps: {
          include: { api: true },
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: { steps: true, executions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(flows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single flow
 */
router.get('/:id', async (req, res) => {
  try {
    const flow = await prisma.flow.findUnique({
      where: { id: req.params.id },
      include: {
        steps: {
          include: { api: true },
          orderBy: { stepOrder: 'asc' },
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    res.json(flow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update flow
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, isActive, steps } = req.body;

    // Delete existing steps if new steps provided
    if (steps) {
      await prisma.flowStep.deleteMany({
        where: { flowId: req.params.id },
      });
    }

    const flow = await prisma.flow.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        isActive,
        ...(steps && {
          steps: {
            create: steps.map((step: any) => ({
              ...step,
            })),
          },
        }),
      },
      include: {
        steps: {
          include: { api: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    res.json(flow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete flow
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.flow.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Flow deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clone flow
 */
router.post('/:id/clone', async (req, res) => {
  try {
    const original = await prisma.flow.findUnique({
      where: { id: req.params.id },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    const cloned = await prisma.flow.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        userId: MOCK_USER_ID,
        steps: {
          create: original.steps.map((step) => ({
            stepOrder: step.stepOrder,
            name: step.name,
            description: step.description,
            apiId: step.apiId,
            method: step.method,
            url: step.url,
            headers: step.headers,
            queryParams: step.queryParams,
            pathParams: step.pathParams,
            requestBody: step.requestBody,
            extractVariables: step.extractVariables,
            assertions: step.assertions,
            condition: step.condition,
          })),
        },
      },
      include: {
        steps: {
          include: { api: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    res.json(cloned);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
