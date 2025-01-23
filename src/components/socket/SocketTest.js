"use client";

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';

export default function SocketTest() {
  const { socket, isConnected, sendMessage } = useWebSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for messages from the server
    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  const sendTestMessage = () => {
    sendMessage('testMessage', { text: 'Hello Server!' });
  };

  const simulateServiceUpdate = () => {
    const testUpdate = {
      _id: '678fd0ddbc211544ba0da0e2',
      name: 'Test Service',
      status: ['operational', 'degraded', 'down'][Math.floor(Math.random() * 3)]
    };
    
    sendMessage('serviceUpdated', testUpdate);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-black font-semibold">Socket Test Panel</h3>
        <p className="text-black text-sm">
          Status: {isConnected ? 
            <span className="text-green-600">Connected</span> : 
            <span className="text-red-600">Disconnected</span>
          }
        </p>
      </div>

      <Button 
        onClick={sendTestMessage}
        disabled={!isConnected}
        className="mb-4 text-black"
      >
        Send Test Message
      </Button>

      <Button 
        onClick={simulateServiceUpdate}
        disabled={!isConnected}
        className="mb-4 text-black ml-2"
      >
        Simulate Service Update
      </Button>

      <div className="space-y-2">
        <h4 className="text-black text-sm font-medium">Messages:</h4>
        {messages.map((msg, index) => (
          <div key={index} className="text-sm p-2 bg-gray-50 rounded">
            {JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </div>
  );
} 