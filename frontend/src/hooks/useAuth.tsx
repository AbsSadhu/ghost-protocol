import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, LoginData, RegisterData } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      setIsAuthenticated(true);
      setUser(username);
    }
    
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      const { access_token } = response;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('username', data.username);
      
      setIsAuthenticated(true);
      setUser(data.username);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data);
      // After successful registration, log in the user
      await login({ username: data.username, password: data.password });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};