import cron from 'node-cron';
import { sendDailyReportToCaregiver } from './reporting';
import { sendWeeklySummaryToCaregiver } from './proactive';
import { proactiveHealthCheck, checkMedicationAdherence } from './proactive';
import { addActivity } from '../state';
import { shouldInitiateConversation, generateConversationStarter } from './conversation';
import { emitSpeak } from '../socket';

/**
 * Initialize all scheduled tasks
 */
export function initializeScheduler() {
  console.log('⏰ Initializing scheduler...');
  
  // Daily report: 9:00 PM every day
  cron.schedule('0 21 * * *', async () => {
    console.log('📊 Running daily report...');
    await sendDailyReportToCaregiver();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Weekly summary: Sunday at 8:00 PM
  cron.schedule('0 20 * * 0', async () => {
    console.log('📊 Running weekly summary...');
    await sendWeeklySummaryToCaregiver();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Medication adherence check: Every 30 minutes (9 AM - 9 PM)
  cron.schedule('*/30 9-21 * * *', async () => {
    console.log('💊 Checking medication adherence...');
    await checkMedicationAdherence();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Proactive health check: Every 2 hours (9 AM - 9 PM)
  cron.schedule('0 9-21/2 * * *', async () => {
    console.log('🏥 Running proactive health check...');
    await proactiveHealthCheck();
  }, {
    timezone: 'America/Detroit'
  });
  
  // Morning greeting: 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    console.log('☀️ Good morning check triggered');
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
      console.log('💬 Initiating proactive conversation:', reason);
      const starter = await generateConversationStarter(reason);
      addActivity(`GENI: ${starter}`, 'system');
      emitSpeak(starter);
    }
  }, {
    timezone: 'America/Detroit'
  });
  
  console.log('✅ Scheduler initialized:');
  console.log('   - Daily report: 9:00 PM');
  console.log('   - Weekly summary: Sundays 8:00 PM');
  console.log('   - Medication checks: Every 30 min (9 AM - 9 PM)');
  console.log('   - Health checks: Every 2 hours (9 AM - 9 PM)');
  console.log('   - Morning greeting: 8:00 AM');
  console.log('   - Proactive conversations: Hourly (9 AM - 9 PM)');
}

/**
 * Test scheduler (trigger reports immediately for testing)
 */
export async function testScheduler() {
  console.log('🧪 Testing scheduler functions...');
  
  console.log('1. Testing daily report...');
  await sendDailyReportToCaregiver();
  
  console.log('2. Testing weekly summary...');
  await sendWeeklySummaryToCaregiver();
  
  console.log('3. Testing medication check...');
  await checkMedicationAdherence();
  
  console.log('4. Testing health check...');
  await proactiveHealthCheck();
  
  console.log('✅ Scheduler tests complete');
}
