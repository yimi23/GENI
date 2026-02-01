import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function connectSocket() {
  if (socket) return socket;
  
  socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });
  
  return socket;
}

export function getSocket(): Socket {
  if (!socket) {
    return connectSocket();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
