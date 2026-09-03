const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

class RideSocket {
    constructor() {
        this.socket = null;
        this.handlers = new Map();
        this.userId = null;
        this.role = null;
        this.shouldReconnect = false;
        this.reconnectAttempts = 0;
        this.maxAttempts = 5;
        this.reconnectDelay = 1500;
    }

    connect(role, userId) {
        this.role = role;
        this.userId = userId;
        this.shouldReconnect = true;
        this._open();
    }

    _open() {
        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this._send({
                type: 'register',
                role: this.role,
                userId: this.userId,
            });
            this._emit('connected');
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this._emit(message.type, message);
            } catch {
                console.error('Invalid message', event.data);
            }
        };

        this.socket.onclose = () => {
            this._emit('disconnected');
            if (this.shouldReconnect && this.reconnectAttempts < this.maxAttempts) {
                this.reconnectAttempts += 1;
                setTimeout(() => this._open(), this.reconnectDelay * this.reconnectAttempts);
            }
        };

        this.socket.onerror = () => {
            this.socket?.close();
        };
    }

    _send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    updateLocation(latitude, longitude) {
        this._send({ type: 'update-location', latitude, longitude });
    }

    followCaptain(captainId) {
        this._send({ type: 'follow-captain', captainId });
    }

    acceptRide(rideId, captainId) {
        this._send({ type: 'accept-ride', rideId, captainId });
    }

    rejectRide(rideId) {
        this._send({ type: 'reject-ride', rideId });
    }

    on(event, callback) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.handlers.get(event) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
    }

    _emit(event, data) {
        const callbacks = this.handlers.get(event) || [];
        callbacks.forEach((cb) => cb(data));
    }

    disconnect() {
        this.shouldReconnect = false;
        this.socket?.close();
        this.handlers.clear();
    }
}

const rideSocket = new RideSocket();

export default rideSocket;
