import { initSocket } from '@/lib/socket-config';

export default function handler(req, res) {
  if (!res.socket.server.ws) {
    console.log('Initializing WebSocket server');
    res.socket.server.ws = initSocket(res.socket.server);
  }
  res.end();
} 