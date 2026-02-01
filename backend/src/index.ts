import express from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config';
import { initializeSocket } from './socket';
import { initializeScheduler } from './services/scheduler';

// Routes
import statusRouter from './routes/status';
import chatRouter from './routes/chat';
import voiceRouter from './routes/voice';
import medicationRouter from './routes/medication';
import messagesRouter from './routes/messages';
import emergencyRouter from './routes/emergency';
import webhooksRouter from './routes/webhooks';
import proactiveRouter from './routes/proactive';
import twilioRouter from './routes/twilio';
import callsRouter from './routes/calls';
import fallRouter from './routes/fall';
import reportsRouter from './routes/reports';
import ttsRouter from './routes/tts';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Initialize Scheduler (daily/weekly reports, health checks)
initializeScheduler();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', statusRouter);
app.use('/api', chatRouter);
app.use('/api', voiceRouter);
app.use('/api', medicationRouter);
app.use('/api', messagesRouter);
app.use('/api', emergencyRouter);
app.use('/api', webhooksRouter);
app.use('/api', proactiveRouter);
app.use('/api/twilio', twilioRouter);
app.use('/api', callsRouter);
app.use('/api', fallRouter);
app.use('/api', reportsRouter);
app.use('/api', ttsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║   🐾 GENI Backend Server Running      ║
║                                        ║
║   Port: ${config.port}                      ║
║   Environment: ${config.nodeEnv}       ║
║   Patient: ${config.patient.name}              ║
║                                        ║
╚════════════════════════════════════════╝
  `);
  
  console.log('📍 API Endpoints:');
  console.log('   GET  /api/status');
  console.log('   POST /api/chat');
  console.log('   POST /api/voice');
  console.log('   POST /api/pill-check');
  console.log('   POST /api/send-message');
  console.log('   POST /api/emergency');
  console.log('   POST /api/medication/confirm');
  console.log('   GET  /api/medication/history');
  console.log('   POST /api/webhook/twilio');
  console.log('   POST /api/proactive/check');
  console.log('   POST /api/proactive/morning-briefing');
  console.log('   POST /api/proactive/health-check');
  console.log('   WS   /socket.io');
  console.log('');
});

export default app;
