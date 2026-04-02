import { Client, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { MessageResponse, NotificationResponse } from '../types'

const CHAT_WS_URL = 'http://localhost:8085/ws-chat'
const NOTIFICATIONS_WS_URL = 'http://localhost:8086/ws-notifications'

export class ChatWebSocket {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private connected = false
  private reconnectAttempts = 0

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(CHAT_WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connected = true
          this.reconnectAttempts = 0
          resolve()
        },
        onDisconnect: () => {
          this.connected = false
        },
        onStompError: (frame) => {
          console.error('[ChatWS] STOMP error:', frame)
          if (this.reconnectAttempts === 0) {
            reject(new Error(frame.headers?.message || 'STOMP connection failed'))
          }
          this.reconnectAttempts++
        },
        onWebSocketError: (event) => {
          console.error('[ChatWS] WebSocket error:', event)
          if (this.reconnectAttempts === 0) {
            reject(new Error('WebSocket connection failed'))
          }
        },
      })

      this.client.activate()
    })
  }

  subscribe(chatId: string, callback: (message: MessageResponse) => void): () => void {
    if (!this.client || !this.connected) {
      console.warn('[ChatWS] Not connected, cannot subscribe')
      return () => {}
    }

    const topic = `/topic/chat/${chatId}`
    const existing = this.subscriptions.get(topic)
    if (existing) {
      existing.unsubscribe()
    }

    const subscription = this.client.subscribe(topic, (frame) => {
      try {
        const message = JSON.parse(frame.body) as MessageResponse
        callback(message)
      } catch (e) {
        console.error('[ChatWS] Failed to parse message:', e)
      }
    })

    this.subscriptions.set(topic, subscription)

    return () => {
      subscription.unsubscribe()
      this.subscriptions.delete(topic)
    }
  }

  sendMessage(chatId: string, content: string): void {
    if (!this.client || !this.connected) {
      console.warn('[ChatWS] Not connected, cannot send message')
      return
    }

    this.client.publish({
      destination: `/app/chat/${chatId}/message`,
      body: JSON.stringify({ content }),
    })
  }

  disconnect(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions.clear()
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }
}

export class NotificationWebSocket {
  private client: Client | null = null
  private subscription: StompSubscription | null = null
  private connected = false

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(NOTIFICATIONS_WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connected = true
          resolve()
        },
        onDisconnect: () => {
          this.connected = false
        },
        onStompError: (frame) => {
          console.error('[NotifWS] STOMP error:', frame)
          reject(new Error(frame.headers?.message || 'STOMP connection failed'))
        },
        onWebSocketError: (event) => {
          console.error('[NotifWS] WebSocket error:', event)
          reject(new Error('WebSocket connection failed'))
        },
      })

      this.client.activate()
    })
  }

  subscribe(callback: (notification: NotificationResponse) => void): () => void {
    if (!this.client || !this.connected) {
      console.warn('[NotifWS] Not connected, cannot subscribe')
      return () => {}
    }

    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    this.subscription = this.client.subscribe('/user/queue/notifications', (frame) => {
      try {
        const notification = JSON.parse(frame.body) as NotificationResponse
        callback(notification)
      } catch (e) {
        console.error('[NotifWS] Failed to parse notification:', e)
      }
    })

    return () => {
      if (this.subscription) {
        this.subscription.unsubscribe()
        this.subscription = null
      }
    }
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }
}

// Singletons
export const chatWS = new ChatWebSocket()
export const notificationWS = new NotificationWebSocket()
