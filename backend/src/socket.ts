import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
  
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

// Helper functions to emit events
export function emitActivity(activity: any) {
  if (io) {
    io.emit('activity', activity);
  }
}

export function emitMedicationUpdate(medication: any) {
  if (io) {
    io.emit('medication_update', medication);
  }
}

export function emitIncomingMessage(message: any) {
  if (io) {
    io.emit('incoming_message', message);
  }
}

export function emitSpeak(text: string) {
  if (io) {
    io.emit('speak', { text });
  }
}

export function emitFallDetected() {
  if (io) {
    io.emit('fall_detected', {});
  }
}

export function emitFallAlert(data: {
  state: 'confirming' | 'emergency' | 'escalated' | 'cancelled';
  message: string;
  patient?: string;
  timestamp?: number;
  progress?: number;
  data?: any;
}) {
  if (io) {
    io.emit('fall_alert', data);
  }
}

export function emitHardwareStatus(status: any) {
  if (io) {
    io.emit('hardware_status', status);
  }
}
