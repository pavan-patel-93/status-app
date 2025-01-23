const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(handle);
    const io = new Server(server, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        path: '/socket.io',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        reconnection: true,
        reconnectionAttempts: 5
    });

    // Store io instance globally
    global.io = io;

    io.on("connection", (socket) => {
        try {
            console.log("Client connected with ID:", socket.id);

            socket.on("joinServiceUpdates", () => {
                socket.join("serviceUpdates");
                console.log(`Client ${socket.id} joined service updates channel`);
            });

            socket.on("disconnect", () => {
                console.log(`Client ${socket.id} disconnected`);
            });

            socket.on("error", (error) => {
                console.error(`Socket ${socket.id} error:`, error);
            });
        } catch (error) {
            console.error("Socket error:", error);
        }
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
}); 