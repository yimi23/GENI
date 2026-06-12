import cron from 'node-cron';
import { sendDailyReportToCaregiver } from './reporting';
import { sendWeeklySummaryToCaregiver } from './proactive';
import { proactiveHealthCheck, checkMedicationAdherence } from './proactive';
import { addActivity } from '../state';
import { shouldInitiateConversation, generateConversationStarter } from './conversation';
import { emitSpeak } from '../socket';
import { healthReportService } from './health-report-sms';
import { adherenceReportService } from './adherence-report-sms';
import { moduleLogger } from '../lib/logger';

const log = moduleLogger('scheduler');

/**
 * Initialize all scheduled tasks
 */
export function initializeScheduler() {
  log.info('⏰ Initializing scheduler...');
  
  // Daily health report SMS: 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    log.info('📊 Running daily health report SMS...');
    try {
      await healthReportService.sendDailyReport();
    } catch (error) {
      log.error({ err: error }, 'Error sending daily health report:');
    }
  }, {
    timezone: 'America/Detroit'
  });

  // Weekly medication adherence report SMS: Sunday at 6:00 PM
  cron.schedule('0 18 * * 0', async () => {
    log.info('💊 Running weekly adherence report SMS...');
    try {
      await adherenceReportService.sendWeeklyReport();
    } catch (error) {
      log.error({ err: error }, 'Error sending adherence report:');
    }
  }, {
    timezone: 'America/Detroit'
  });
  
  // Daily report: 9:00 PM every day
  cron.schedule('0 21 * * *', async () => {
    log.info('📊 Running daily report...');
    await sendDailyReportToCaregiver();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Weekly summary: Sunday at 8:00 PM
  cron.schedule('0 20 * * 0', async () => {
    log.info('📊 Running weekly summary...');
    await sendWeeklySummaryToCaregiver();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Medication adherence check: Every 30 minutes (9 AM - 9 PM)
  cron.schedule('*/30 9-21 * * *', async () => {
    log.info('💊 Checking medication adherence...');
    await checkMedicationAdherence();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Proactive health check: Every 2 hours (9 AM - 9 PM)
  cron.schedule('0 9-21/2 * * *', async () => {
    log.info('🏥 Running proactive health check...');
    await proactiveHealthCheck();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Morning greeting: 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    log.info('☀️ Good morning check triggered');
    const starter = await generateConversationStarter('morning-greeting');
    addActivity(`GENI: ${starter}`, 'system');
    emitSpeak(starter);
  }, {
    timezone: 'America/Detroit'
  });
  
  // Proactive conversation check: Every hour (9 AM - 9 PM)
  cron.schedule('0 9-21 * * *', async () => {
    const { shouldStart, reason } = shouldInitiateConversation();
    if (shouldStart) {
      log.info({ detail: reason }, '💬 Initiating proactive conversation:');
      const starter = await generateConversationStarter(reason);
      addActivity(`GENI: ${starter}`, 'system');
      emitSpeak(starter);
    }
  }, {
    timezone: 'America/Detroit'
  });
  
  log.info('✅ Scheduler initialized:');
  log.info('   - Daily report: 9:00 PM');
  log.info('   - Weekly summary: Sundays 8:00 PM');
  log.info('   - Medication checks: Every 30 min (9 AM - 9 PM)');
  log.info('   - Health checks: Every 2 hours (9 AM - 9 PM)');
  log.info('   - Morning greeting: 8:00 AM');
  log.info('   - Proactive conversations: Hourly (9 AM - 9 PM)');
}

/**
 * Test scheduler (trigger reports immediately for testing)
 */
export async function testScheduler() {
  log.info('🧪 Testing scheduler functions...');
  
  log.info('1. Testing daily report...');
  await sendDailyReportToCaregiver();
  
  log.info('2. Testing weekly summary...');
  await sendWeeklySummaryToCaregiver();
  
  log.info('3. Testing medication check...');
  await checkMedicationAdherence();
  
  log.info('4. Testing health check...');
  await proactiveHealthCheck();
  
  log.info('✅ Scheduler tests complete');
}
