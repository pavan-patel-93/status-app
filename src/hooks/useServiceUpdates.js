"use client";

import { useEffect } from 'react';
import { initSocket } from '@/lib/socket-client';

export function useServiceUpdates(onServiceUpdate) {
  useEffect(() => {
    const socket = initSocket();

    socket.emit('joinServiceUpdates');

    socket.on('serviceUpdated', (data) => {
      if (data.type === 'serviceUpdated' && onServiceUpdate) {
        onServiceUpdate(data.service);
      }
    });

    return () => {
      socket.off('serviceUpdated');
    };
  }, [onServiceUpdate]);
} 