"use client";

import { useState, useEffect, useCallback } from 'react';

export function useWebSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const connect = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
      const ws = new WebSocket(`${wsUrl}/api/ws`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setRetryCount(0);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);
        
        if (event.code !== 1000) {
          const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      setSocket(ws);
      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }, [retryCount]);

  useEffect(() => {
    const ws = connect();
    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type, data = {}) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, ...data }));
    }
  }, [socket]);

  return { socket, isConnected, sendMessage };
} 