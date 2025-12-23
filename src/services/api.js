import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () =>
    api.get('/auth/me'),
};

// User endpoints
export const userAPI = {
  search: (query) =>
    api.get(`/users/search?q=${query}`),
  
  getProfile: (userId) =>
    api.get(`/users/${userId}/profile`),
  
  updateProfile: (data) =>
    api.put('/users/me/profile', data),
  
  addContact: (userId) =>
    api.post('/users/add-contact', { user_id: userId }),
};

// Message endpoints
export const messageAPI = {
  send: (toUserId, message, coverImageFile, stegoMethod = 'histogram_shifting') => {
    const formData = new FormData();
    formData.append('to_user_id', toUserId);
    formData.append('message', message);
    formData.append('stego_method', stegoMethod);
    if (coverImageFile) {
      formData.append('cover_image', coverImageFile);
    }
    return api.post('/messages/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  decrypt: (messageId) =>
    api.post(`/messages/decrypt`, { message_id: messageId }),
  
  getConversation: (conversationId, limit = 50) =>
    api.get(`/messages/conversation/${conversationId}?limit=${limit}`),
  
  markAsRead: (messageId) =>
    api.put(`/messages/${messageId}/read`),
  
  delete: (messageId) =>
    api.delete(`/messages/${messageId}`),
};

// Conversation endpoints
export const conversationAPI = {
  getAll: () =>
    api.get('/conversations'),
  
  get: (conversationId) =>
    api.get(`/conversations/${conversationId}`),
  
  create: (userId) =>
    api.post('/conversations', { user_id: userId }),
};

// Image endpoints
export const imageAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
