import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Mock user ID (replace with actual auth later)
const MOCK_USER_ID = 'user-1';

/**
 * Create environment
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, baseUrl, variables, headers, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.environment.updateMany({
        where: { userId: MOCK_USER_ID, isDefault: true },
        data: { isDefault: false },
      });
    }

    const environment = await prisma.environment.create({
      data: {
        name,
        description,
        baseUrl,
        variables,
        headers,
        isDefault: isDefault || false,
        userId: MOCK_USER_ID,
      },
    });

    res.json(environment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all environments
 */
router.get('/', async (req, res) => {
  try {
    const environments = await prisma.environment.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { name: 'asc' },
    });

    res.json(environments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single environment
 */
router.get('/:id', async (req, res) => {
  try {
    const environment = await prisma.environment.findUnique({
      where: { id: req.params.id },
    });

    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json(environment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update environment
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, baseUrl, variables, headers, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.environment.updateMany({
        where: {
          userId: MOCK_USER_ID,
          isDefault: true,
          id: { not: req.params.id },
        },
        data: { isDefault: false },
      });
    }

    const environment = await prisma.environment.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        baseUrl,
        variables,
        headers,
        isDefault,
      },
    });

    res.json(environment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete environment
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.environment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Environment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
