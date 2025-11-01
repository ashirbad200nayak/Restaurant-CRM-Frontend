import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinTable = (tableNumber: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_table', { tableNumber });
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinTable,
    on,
    off,
  };
};
