"use client";

import { useState, useEffect } from 'react';
import { io } from "socket.io-client";

export function useWebSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    
    // Create Socket.IO instance
    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const sendMessage = (type, data = {}) => {
    if (socket?.connected) {
      socket.emit(type, data);
    } else {
      console.warn('Socket not connected, message not sent:', type, data);
    }
  };

  return { socket, isConnected, sendMessage };
} 