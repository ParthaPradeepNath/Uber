import http from 'http';
import app from './app.js';
import { initWebSocket } from './services/socket.service.js';
const port = process.env.PORT || 3000;

const server = http.createServer(app);

initWebSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`WebSocket server listening on /ws`);
});
