import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env as Record<string, any>).VITE_API_URL || 'http://localhost:5001';
const API_KEY = (import.meta.env as Record<string, any>).VITE_GENI_API_KEY || '';

let socketInstance: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export function connectSocket() {
  if (socketInstance) return socketInstance;
  
  socketInstance = io(SOCKET_URL, {
    auth: API_KEY ? { token: API_KEY } : undefined,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    transports: ['websocket', 'polling'],
  });
  
  socketInstance.on('connect', () => {
    console.log('✅ Socket connected');
    reconnectAttempts = 0;
  });
  
  socketInstance.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });
  
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;
  });
  
  socketInstance.on('reconnect_attempt', () => {
    console.log(`🔄 Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
  });
  
  socketInstance.on('reconnect_failed', () => {
    console.error('❌ Max reconnection attempts reached');
  });
  
  return socketInstance;
}

export function getSocket(): Socket {
  if (!socketInstance) {
    return connectSocket();
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// Export initialized socket
export const socket = connectSocket();
