import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export function connectSocket() {
  if (socketInstance) return socketInstance;
  
  socketInstance = io(SOCKET_URL);
  
  socketInstance.on('connect', () => {
    console.log('✅ Socket connected');
  });
  
  socketInstance.on('disconnect', () => {
    console.log('❌ Socket disconnected');
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
