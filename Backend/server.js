const http = require('http');
const app = require('./app');
const { initWebSocket } = require('./services/socket.service');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

initWebSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`WebSocket server listening on /ws`);
});
