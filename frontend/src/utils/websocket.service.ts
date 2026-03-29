import { Client, IMessage, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Message } from '../types/messaging.types';

interface WebSocketConfig {
  url: string;
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  /**
   * Подключение к WebSocket серверу
   */
  connect(config: WebSocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => {
          // Добавляем токен в заголовки
          const sock = new SockJS(config.url);
          return sock;
        },
        connectHeaders: {
          Authorization: `Bearer ${config.token}`,
        },
        debug: (str) => {
          console.log('[STOMP Debug]:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame: IFrame) => {
        console.log('[WebSocket] Connected:', frame);
        config.onConnect?.();
        resolve();
      };

      this.client.onDisconnect = (frame: IFrame) => {
        console.log('[WebSocket] Disconnected:', frame);
        config.onDisconnect?.();
      };

      this.client.onError = (error: any) => {
        console.error('[WebSocket] Error:', error);
        config.onError?.(error);
        reject(error);
      };

      this.client.activate();
    });
  }

  /**
   * Отключение от WebSocket
   */
  disconnect(): void {
    // Отписываемся от всех подписок
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  /**
   * Подписка на топик
   */
  subscribe<T>(
    destination: string,
    callback: (message: T) => void
  ): void {
    if (!this.client || !this.client.connected) {
      console.error('[WebSocket] Client not connected');
      return;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body) as T;
        callback(body);
      } catch (error) {
        console.error('[WebSocket] Parse error:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`[WebSocket] Subscribed to: ${destination}`);
  }

  /**
   * Отписка от топика
   */
  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`[WebSocket] Unsubscribed from: ${destination}`);
    }
  }

  /**
   * Отправка сообщения
   */
  send(destination: string, body: any): void {
    if (!this.client || !this.client.connected) {
      console.error('[WebSocket] Client not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * Проверка подключения
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

// Singleton экземпляр
export const webSocketService = new WebSocketService();
export default webSocketService;
