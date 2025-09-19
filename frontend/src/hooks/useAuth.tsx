import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { authAPI } from '../services/api';
import websocketService from '../services/websocket';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ghost_token');
      const savedUser = localStorage.getItem('ghost_user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
          
          // Connect to WebSocket
          websocketService.connect(token);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('ghost_token');
          localStorage.removeItem('ghost_user');
          toast.error('Session expired. Please login again.');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const authResponse = await authAPI.login(credentials);
      
      // Store token
      localStorage.setItem('ghost_token', authResponse.access_token);
      
      // Get user data
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      localStorage.setItem('ghost_user', JSON.stringify(userData));
      
      // Connect to WebSocket
      websocketService.connect(authResponse.access_token);
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      await authAPI.register(userData);
      
      // Auto-login after registration
      await login({
        username: userData.username,
        password: userData.password,
      });
      
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ghost_token');
    localStorage.removeItem('ghost_user');
    setUser(null);
    websocketService.disconnect();
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};