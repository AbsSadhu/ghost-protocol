export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content?: string;
  image_filename?: string;
  is_steganographic: boolean;
  created_at: string;
  sender_username?: string;
  recipient_username?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SteganographyRequest {
  message: string;
  recipient_id: number;
}

export interface SteganographyResponse {
  success: boolean;
  message: string;
  image_filename?: string;
}

export interface WebSocketMessage {
  type: 'new_message' | 'new_steganographic_message' | 'typing' | 'connection' | 'pong';
  sender_id?: number;
  sender_username?: string;
  recipient_id?: number;
  content?: string;
  image_filename?: string;
  is_steganographic?: boolean;
  is_typing?: boolean;
  timestamp?: string;
  user_id?: number;
}

export interface ChatPartner {
  id: number;
  username: string;
  lastMessage?: Message;
  unreadCount: number;
}