import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

import Login from './components/Login';
import Chat from './components/Chat';
import SteganographyTool from './components/SteganographyTool';
import NavBar from './components/NavBar';
import { AuthProvider, useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: '#00ff88'
      }}>
        <AppContent />
      </Box>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity
          }}
        >
          <Typography variant="h4" sx={{ color: '#00ff88' }}>
            GHOST PROTOCOL
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <>
      {isAuthenticated && <NavBar />}
      <Container maxWidth="lg" sx={{ pt: isAuthenticated ? 4 : 0 }}>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} 
          />
          <Route 
            path="/chat" 
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/steganography" 
            element={isAuthenticated ? <SteganographyTool /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} 
          />
        </Routes>
      </Container>
    </>
  );
};

export default App;