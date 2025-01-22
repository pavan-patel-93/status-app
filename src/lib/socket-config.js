import { WebSocketServer } from 'ws';
import { Server } from 'socket.io';

let wss;
let io;

export function initSocket(server) {
  if (wss) {
    return wss;
  }

  wss = new WebSocketServer({
    server,
    path: '/ws',
    clientTracking: true
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to socket');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('Received message:', message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

export function getWss() {
  if (!wss) {
    throw new Error('WebSocket server not initialized');
  }
  return wss;
}

export function broadcast(data) {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.serviceUpdates && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 