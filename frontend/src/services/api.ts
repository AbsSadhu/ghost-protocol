import axios from 'axios';
import {
  User,
  Message,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  SteganographyResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ghost_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ghost_token');
      localStorage.removeItem('ghost_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/v1/auth/users');
    return response.data;
  },
};

export const messageAPI = {
  getMessages: async (): Promise<Message[]> => {
    const response = await api.get('/api/v1/messages/');
    return response.data;
  },

  getConversation: async (userId: number): Promise<Message[]> => {
    const response = await api.get(`/api/v1/messages/conversation/${userId}`);
    return response.data;
  },

  sendMessage: async (content: string, recipientId: number): Promise<Message> => {
    const response = await api.post('/api/v1/messages/', {
      content,
      recipient_id: recipientId,
      is_steganographic: false,
    });
    return response.data;
  },
};

export const steganographyAPI = {
  encodeMessage: async (
    message: string,
    recipientId: number,
    imageFile: File
  ): Promise<SteganographyResponse> => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('recipient_id', recipientId.toString());
    formData.append('image', imageFile);

    const response = await api.post('/api/v1/steganography/encode', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  decodeMessage: async (imageFile: File): Promise<SteganographyResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/api/v1/steganography/decode', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getImage: (filename: string): string => {
    return `${API_BASE_URL}/api/v1/steganography/image/${filename}`;
  },
};

export default api;