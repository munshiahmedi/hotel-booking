import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all system metrics
router.get('/', async (req, res) => {
  try {
    const metrics = await prisma.systemMetric.findMany({
      orderBy: { recorded_at: 'desc' },
      take: 100 // Limit to last 100 entries
    });

    return res.json({
      success: true,
      data: metrics,
      count: metrics.length
    });
  } catch (error) {
    console.error('Get system metrics error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch system metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create system metric
router.post('/', async (req, res) => {
  try {
    const { metric_key, metric_value, recorded_at } = req.body;
    
    if (!metric_key || !metric_value) {
      return res.status(400).json({ 
        error: 'Missing required fields: metric_key, metric_value' 
      });
    }

    const newMetric = await prisma.systemMetric.create({
      data: {
        metric_key,
        metric_value: metric_value.toString(),
        recorded_at: recorded_at ? new Date(recorded_at) : new Date()
      }
    });

    return res.status(201).json({
      success: true,
      data: newMetric
    });
  } catch (error) {
    console.error('Create system metric error:', error);
    return res.status(500).json({ 
      error: 'Failed to create system metric',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get metrics by name
router.get('/name/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    
    if (!metricName) {
      return res.status(400).json({ error: 'Metric name is required' });
    }

    const metrics = await prisma.systemMetric.findMany({
      where: { metric_key: metricName },
      orderBy: { recorded_at: 'desc' },
      take: 50 // Limit to last 50 entries for this metric
    });

    return res.json({
      success: true,
      metric_name: metricName,
      data: metrics,
      count: metrics.length
    });
  } catch (error) {
    console.error('Get metrics by name error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch metrics by name',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get metrics by date range
router.get('/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: start, end' 
      });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use ISO date format (YYYY-MM-DD)' 
      });
    }

    const metrics = await prisma.systemMetric.findMany({
      where: {
        recorded_at: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { recorded_at: 'desc' }
    });

    return res.json({
      success: true,
      date_range: { start: startDate, end: endDate },
      data: metrics,
      count: metrics.length
    });
  } catch (error) {
    console.error('Get metrics by range error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch metrics by date range',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
