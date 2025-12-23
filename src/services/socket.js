import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Emit events
  sendMessage(data) {
    this.socket?.emit('send_message', data);
  }

  startTyping(toUserId) {
    this.socket?.emit('typing_start', { to_user_id: toUserId });
  }

  stopTyping(toUserId) {
    this.socket?.emit('typing_stop', { to_user_id: toUserId });
  }

  markAsRead(messageId) {
    this.socket?.emit('mark_read', { message_id: messageId });
  }

  // Listen to events
  onNewMessage(callback) {
    this.socket?.on('new_message', callback);
  }

  onMessageDelivered(callback) {
    this.socket?.on('message_delivered', callback);
  }

  onMessageRead(callback) {
    this.socket?.on('message_read', callback);
  }

  onUserTyping(callback) {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback) {
    this.socket?.on('user_stop_typing', callback);
  }

  onUserStatusChange(callback) {
    this.socket?.on('user_status_changed', callback);
  }

  // Remove listeners
  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();
