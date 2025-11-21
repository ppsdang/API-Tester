import express from 'express';
import { SwaggerApiParser } from '../parsers/swaggerParser';
import { PostmanApiParser } from '../parsers/postmanParser';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Mock user ID (replace with actual auth later)
const MOCK_USER_ID = 'user-1';

/**
 * Import APIs from Swagger/OpenAPI URL
 */
router.post('/import/swagger', async (req, res) => {
  try {
    const { url, json } = req.body;

    let collection;
    if (url) {
      collection = await SwaggerApiParser.parseFromUrl(url);
    } else if (json) {
      collection = await SwaggerApiParser.parseFromJson(json);
    } else {
      return res.status(400).json({ error: 'URL or JSON required' });
    }

    // Save to database
    const apiCollection = await prisma.apiCollection.create({
      data: {
        name: collection.name,
        description: collection.description,
        source: 'swagger',
        sourceUrl: url,
        rawData: json,
        userId: MOCK_USER_ID,
        apis: {
          create: collection.endpoints.map((endpoint) => ({
            ...endpoint,
            userId: MOCK_USER_ID,
          })),
        },
      },
      include: { apis: true },
    });

    res.json(apiCollection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Import APIs from Postman collection URL
 */
router.post('/import/postman', async (req, res) => {
  try {
    const { url, json } = req.body;

    let collection;
    if (url) {
      collection = await PostmanApiParser.parseFromUrl(url);
    } else if (json) {
      collection = PostmanApiParser.parseFromJson(json);
    } else {
      return res.status(400).json({ error: 'URL or JSON required' });
    }

    // Save to database
    const apiCollection = await prisma.apiCollection.create({
      data: {
        name: collection.name,
        description: collection.description,
        source: 'postman',
        sourceUrl: url,
        rawData: json,
        userId: MOCK_USER_ID,
        apis: {
          create: collection.endpoints.map((endpoint) => ({
            ...endpoint,
            userId: MOCK_USER_ID,
          })),
        },
      },
      include: { apis: true },
    });

    res.json(apiCollection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create manual API
 */
router.post('/', async (req, res) => {
  try {
    const api = await prisma.api.create({
      data: {
        ...req.body,
        userId: MOCK_USER_ID,
      },
    });

    res.json(api);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all API collections
 */
router.get('/collections', async (req, res) => {
  try {
    const collections = await prisma.apiCollection.findMany({
      where: { userId: MOCK_USER_ID },
      include: {
        apis: true,
        _count: { select: { apis: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all APIs
 */
router.get('/', async (req, res) => {
  try {
    const apis = await prisma.api.findMany({
      where: { userId: MOCK_USER_ID },
      include: { collection: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(apis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single API
 */
router.get('/:id', async (req, res) => {
  try {
    const api = await prisma.api.findUnique({
      where: { id: req.params.id },
      include: { collection: true },
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    res.json(api);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update API
 */
router.put('/:id', async (req, res) => {
  try {
    const api = await prisma.api.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(api);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete API
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.api.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'API deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete API collection
 */
router.delete('/collections/:id', async (req, res) => {
  try {
    await prisma.apiCollection.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Collection deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
