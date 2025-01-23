import { Server } from 'socket.io';

export function initSocket(server) {
  // If io is already initialized globally, return it
  if (global.io) {
    return global.io;
  }

  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store io instance globally
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('joinServiceUpdates', () => {
      socket.join('serviceUpdates');
      console.log('Client joined service updates channel');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

export function getIo() {
  if (!global.io) {
    throw new Error('Socket.IO server not initialized');
  }
  return global.io;
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 