import { io, Socket } from 'socket.io-client';

// In production on Railway, the server serves the client from the same origin
// In development, proxy is configured in vite.config.ts
const SERVER_URL = window.location.origin;

export const socket: Socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  path: '/socket.io',
});
