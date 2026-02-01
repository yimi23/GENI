import { Router, Request, Response } from 'express';
import { generateDailyReport, sendDailyReportToCaregiver } from '../services/reporting';
import { sendWeeklySummaryToCaregiver } from '../services/proactive';
import { generateContextualAlert, sendAlertToCaregiver, sendReassuranceMessage } from '../services/alerts';
import { testScheduler } from '../services/scheduler';

const router = Router();

/**
 * GET /api/reports/daily - Preview daily report
 */
router.get('/reports/daily', (req: Request, res: Response) => {
  try {
    const report = generateDailyReport();
    res.json({
      success: true,
      report,
      note: 'This is a preview. Use POST to send via WhatsApp.'
    });
  } catch (error) {
    console.error('❌ Daily report preview error:', error);
    res.status(500).json({ error: 'Failed to generate daily report' });
  }
});

/**
 * POST /api/reports/daily - Send daily report now
 */
router.post('/reports/daily', async (req: Request, res: Response) => {
  try {
    const success = await sendDailyReportToCaregiver();
    
    if (success) {
      res.json({
        success: true,
        message: 'Daily report sent to caregiver'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send daily report'
      });
    }
  } catch (error) {
    console.error('❌ Send daily report error:', error);
    res.status(500).json({ error: 'Failed to send daily report' });
  }
});

/**
 * POST /api/reports/weekly - Send weekly summary now
 */
router.post('/reports/weekly', async (req: Request, res: Response) => {
  try {
    await sendWeeklySummaryToCaregiver();
    res.json({
      success: true,
      message: 'Weekly summary sent to caregiver'
    });
  } catch (error) {
    console.error('❌ Send weekly summary error:', error);
    res.status(500).json({ error: 'Failed to send weekly summary' });
  }
});

/**
 * POST /api/reports/test-alert - Test context-aware alert
 */
router.post('/reports/test-alert', async (req: Request, res: Response) => {
  try {
    const { event, medication, symptom, timeElapsed } = req.body;
    
    const alert = generateContextualAlert({
      event: event || 'missed_medication',
      medication,
      symptom,
      timeElapsed
    });
    
    res.json({
      success: true,
      alert,
      note: 'This is a preview. Use /api/reports/send-alert to actually send.'
    });
  } catch (error) {
    console.error('❌ Test alert error:', error);
    res.status(500).json({ error: 'Failed to generate test alert' });
  }
});

/**
 * POST /api/reports/send-alert - Send context-aware alert
 */
router.post('/reports/send-alert', async (req: Request, res: Response) => {
  try {
    const { event, medication, symptom, timeElapsed, additionalContext } = req.body;
    
    const success = await sendAlertToCaregiver({
      event: event || 'general_concern',
      medication,
      symptom,
      timeElapsed,
      additionalContext
    });
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert sent to caregiver'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send alert'
      });
    }
  } catch (error) {
    console.error('❌ Send alert error:', error);
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

/**
 * POST /api/reports/reassurance - Send "all is well" message
 */
router.post('/reports/reassurance', async (req: Request, res: Response) => {
  try {
    const success = await sendReassuranceMessage();
    
    if (success) {
      res.json({
        success: true,
        message: 'Reassurance message sent to caregiver'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send reassurance message'
      });
    }
  } catch (error) {
    console.error('❌ Send reassurance error:', error);
    res.status(500).json({ error: 'Failed to send reassurance' });
  }
});

/**
 * POST /api/reports/test-scheduler - Run all scheduled tasks now (for testing)
 */
router.post('/reports/test-scheduler', async (req: Request, res: Response) => {
  try {
    await testScheduler();
    res.json({
      success: true,
      message: 'All scheduled tasks executed (check console for details)'
    });
  } catch (error) {
    console.error('❌ Test scheduler error:', error);
    res.status(500).json({ error: 'Failed to test scheduler' });
  }
});

export default router;
