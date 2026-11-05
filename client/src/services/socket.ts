import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@shared/types';

// Production build served by the game server itself (Docker): same origin.
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001');

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  connect(): Socket {
    // Reuse the socket while it is connected, still connecting or reconnecting on its own
    if (this.socket && (this.socket.connected || this.socket.active)) return this.socket;

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });

    // Re-attach listeners
    for (const [event, callbacks] of this.listeners) {
      for (const cb of callbacks) {
        this.socket.on(event, cb);
      }
    }

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit<T = any>(event: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }
      this.socket.emit(event, data, (response: T) => {
        resolve(response);
      });
    });
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export { SocketEvents };
