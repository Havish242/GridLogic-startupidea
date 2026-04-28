import { io } from 'socket.io-client';

let socket;
let isConnected = false;
const queuedEvents = [];
const connectionSubscribers = new Set();

function notifySocketConnection(value) {
  if (isConnected === value) return;
  isConnected = value;
  connectionSubscribers.forEach((subscriber) => subscriber(isConnected));
}

function flushQueue() {
  if (!socket || !isConnected || !queuedEvents.length) return;
  while (queuedEvents.length) {
    const { event, payload } = queuedEvents.shift();
    socket.emit(event, payload);
  }
}

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      notifySocketConnection(true);
      flushQueue();
    });

    socket.on('disconnect', () => {
      notifySocketConnection(false);
    });

    socket.on('connect_error', () => {
      notifySocketConnection(false);
    });
  }
  return socket;
}

export function emitSocketEvent(event, payload) {
  const activeSocket = getSocket();
  if (activeSocket.connected) {
    activeSocket.emit(event, payload);
    return;
  }
  queuedEvents.push({ event, payload });
}

export function subscribeSocketConnection(callback) {
  connectionSubscribers.add(callback);
  callback(isConnected);
  return () => {
    connectionSubscribers.delete(callback);
  };
}
