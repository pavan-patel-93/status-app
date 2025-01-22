import { NextResponse } from 'next/server';
import { initWebSocketServer } from '@/lib/websocket';

export async function GET(req) {
  if (typeof window === 'undefined' && !global.wss) {
    const server = global.server;
    if (server) {
      try {
        global.wss = initWebSocketServer(server);
        console.log('WebSocket server initialized successfully');
      } catch (error) {
        console.error('Failed to initialize WebSocket server:', error);
      }
    } else {
      console.error('HTTP server not found');
    }
  }
  
  return NextResponse.json({ 
    status: 'WebSocket server is running',
    initialized: !!global.wss 
  });
}

export const dynamic = 'force-dynamic'; 