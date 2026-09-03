const { WebSocketServer } = require('ws');

let wss;

const connectedClients = new Map();

function initWebSocket(server) {
    wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws) => {
        ws.on('message', (raw) => {
            try {
                const message = JSON.parse(raw.toString());
                handleMessage(ws, message);
            } catch (error) {
                send(ws, { type: 'error', message: 'Invalid message format' });
            }
        });

        ws.on('close', () => {
            removeClient(ws);
        });

        ws.on('error', () => {
            removeClient(ws);
        });
    });

    return wss;
}

function handleMessage(ws, message) {
    switch (message.type) {
        case 'register':
            registerClient(ws, message);
            break;
        case 'follow-captain':
            followCaptain(ws, message);
            break;
        case 'update-location':
            handleUpdateLocation(ws, message);
            break;
        case 'accept-ride':
            handleAcceptRide(ws, message);
            break;
        case 'reject-ride':
            handleRejectRide(ws, message);
            break;
        case 'ping':
            send(ws, { type: 'pong' });
            break;
        default:
            send(ws, { type: 'error', message: `Unknown message type: ${message.type}` });
    }
}

function registerClient(ws, message) {
    const { role, userId } = message;

    if (!role || !userId) {
        return send(ws, { type: 'error', message: 'role and userId are required' });
    }

    ws.metadata = { role, userId };
    connectedClients.set(ws, { role, userId });

    send(ws, {
        type: 'registered',
        role,
        userId,
    });
}

function followCaptain(ws, message) {
    const { captainId } = message;

    if (!ws.metadata || ws.metadata.role !== 'user') {
        return send(ws, { type: 'error', message: 'Only users can follow a captain' });
    }

    if (!captainId) {
        return send(ws, { type: 'error', message: 'captainId is required' });
    }

    ws.metadata.followingCaptainId = captainId;

    send(ws, { type: 'following-captain', captainId });
}

function handleUpdateLocation(ws, message) {
    const { latitude, longitude } = message;

    if (!ws.metadata || ws.metadata.role !== 'captain') {
        return send(ws, { type: 'error', message: 'Only captains can update location' });
    }

    const captainId = ws.metadata.userId;
    const payload = JSON.stringify({
        type: 'captain-location',
        captainId,
        latitude,
        longitude,
    });

    for (const [clientWs] of connectedClients) {
        if (
            clientWs.metadata &&
            clientWs.metadata.role === 'user' &&
            clientWs.metadata.followingCaptainId === captainId
        ) {
            if (clientWs.readyState === clientWs.OPEN) {
                clientWs.send(payload);
            }
        }
    }
}

function handleAcceptRide(ws, message) {
    const { rideId, captainId } = message;

    if (!ws.metadata || ws.metadata.role !== 'captain') {
        return send(ws, { type: 'error', message: 'Only captains can accept rides' });
    }

    sendToUser('ride-accepted', {
        rideId,
        captainId,
    });
}

function handleRejectRide(ws, message) {
    const { rideId } = message;
    send(ws, { type: 'ride-rejected', rideId });
}

function send(ws, data) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function broadcastToUsers(type, data) {
    const payload = JSON.stringify({ type, ...data });

    for (const [ws] of connectedClients) {
        if (ws.metadata && ws.metadata.role === 'user') {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        }
    }
}

function sendToUser(type, data, userId) {
    const payload = JSON.stringify({ type, ...data });

    for (const [ws] of connectedClients) {
        if (ws.metadata && ws.metadata.role === 'user') {
            if (userId && ws.metadata.userId !== userId) {
                continue;
            }
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        }
    }
}

function sendToCaptain(type, data, captainId) {
    const payload = JSON.stringify({ type, ...data });

    for (const [ws] of connectedClients) {
        if (ws.metadata && ws.metadata.role === 'captain') {
            if (captainId && ws.metadata.userId !== captainId) {
                continue;
            }
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        }
    }
}

function broadcastToCaptains(type, data) {
    const payload = JSON.stringify({ type, ...data });

    for (const [ws] of connectedClients) {
        if (ws.metadata && ws.metadata.role === 'captain') {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        }
    }
}

function removeClient(ws) {
    connectedClients.delete(ws);
}

module.exports = {
    initWebSocket,
    broadcastToUsers,
    sendToUser,
    sendToCaptain,
    broadcastToCaptains,
};
