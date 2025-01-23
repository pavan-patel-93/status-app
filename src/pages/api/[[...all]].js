import { initSocket } from '@/lib/socket-config';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server');
    res.socket.server.io = initSocket(res.socket.server);
  }
  res.end();
} 