import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import type { Activity, IncomingMessage } from '../types';

export function useSocket() {
  const [socket] = useState(() => getSocket());
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return { socket, connected };
}

export function useSocketEvent<T = any>(event: string, callback: (data: T) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
}
