const { WebSocketServer } = require('ws');

let wss;

function initWebSocketServer(server) {
  if (wss) {
    console.log('WebSocket server already initialized');
    return wss;
  }

  if (!server) {
    throw new Error('Server instance is required');
  }

  try {
    console.log('Initializing WebSocket server...');
    wss = new WebSocketServer({
      server,
      path: '/api/ws',
      clientTracking: true,
    });

    wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');

      // Send initial connection success message
      ws.send(
        JSON.stringify({
          type: 'connected',
          message: 'Successfully connected',
        })
      );

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('Received message:', data);

          if (data.type === 'joinServiceUpdates') {
            ws.serviceUpdates = true;
            console.log('Client joined service updates channel');
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', (code, reason) => {
        console.log('Client disconnected:', code, reason);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    console.log('WebSocket server initialization complete');
    return wss;
  } catch (error) {
    console.error('Error initializing WebSocket server:', error);
    throw error;
  }
}

function broadcastServiceUpdate(service) {
  if (!wss) {
    console.warn('WebSocket server not initialized');
    return;
  }

  console.log('Broadcasting service update:', service);
  wss.clients.forEach((client) => {
    if (client.serviceUpdates && client.readyState === 1) {
      try {
        client.send(
          JSON.stringify({
            type: 'serviceUpdated',
            service,
          })
        );
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    }
  });
}

module.exports = {
  initWebSocketServer,
  broadcastServiceUpdate,
};
