/**
 * GENI Unified Monitoring Route
 * Exposes monitoring endpoints for manual triggers and status checks
 */

import { Router, Request, Response } from 'express';
import { unifiedMonitoring } from '../services/unified-monitoring';

const router = Router();

/**
 * Trigger manual monitoring cycle
 */
router.post('/monitor/cycle', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Manual monitoring cycle triggered');
    
    const result = await unifiedMonitoring.performMonitoringCycle();
    
    res.json({
      success: true,
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('❌ Monitoring cycle error:', error);
    res.status(500).json({ error: 'Failed to run monitoring cycle' });
  }
});

/**
 * Get monitoring status
 */
router.get('/monitor/status', (req: Request, res: Response) => {
  try {
    const status = unifiedMonitoring.getStatus();
    const events = unifiedMonitoring.getRecentEvents(20);
    
    res.json({
      status,
      events,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('❌ Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * Get recent monitoring events
 */
router.get('/monitor/events', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const events = unifiedMonitoring.getRecentEvents(limit);
    
    res.json({
      events,
      count: events.length,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('❌ Events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

export default router;
