"use client";

import { useEffect } from 'react';
import { initSocket } from '@/lib/socket-client';

// Custom hook to handle real-time service updates
export function useServiceUpdates(onServiceUpdate) {
  useEffect(() => {
    // Initialize the socket connection
    const socket = initSocket();

    // Join the 'serviceUpdates' channel to receive updates
    socket.emit('joinServiceUpdates');

    // Listen for 'serviceUpdated' events from the server
    socket.on('serviceUpdated', (data) => {
      // Check if the event type is 'serviceUpdated' and the callback is provided
      if (data.type === 'serviceUpdated' && onServiceUpdate) {
        // Call the provided callback function with the updated service data
        onServiceUpdate(data.service);
      }
    });

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      socket.off('serviceUpdated');
    };
  }, [onServiceUpdate]); // Dependency array to re-run the effect if the callback changes
}