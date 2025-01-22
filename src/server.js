const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initWebSocketServer } = require('./lib/websocket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server with path that doesn't conflict with Next.js
  try {
    const wss = initWebSocketServer(server);
    console.log('WebSocket server initialized successfully');
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
  }

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}); 