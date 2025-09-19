import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chat, Image, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #00ff88',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            background: 'linear-gradient(45deg, #00ff88, #ff0088)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          GHOST PROTOCOL
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<Chat />}
            onClick={() => navigate('/chat')}
            sx={{
              color: location.pathname === '/chat' ? '#00ff88' : 'inherit',
              '&:hover': { color: '#00ff88' },
            }}
          >
            Chat
          </Button>

          <Button
            color="inherit"
            startIcon={<Image />}
            onClick={() => navigate('/steganography')}
            sx={{
              color: location.pathname === '/steganography' ? '#00ff88' : 'inherit',
              '&:hover': { color: '#00ff88' },
            }}
          >
            Steganography
          </Button>

          <Typography variant="body2" sx={{ mx: 2, color: '#888' }}>
            {user}
          </Typography>

          <IconButton
            color="inherit"
            onClick={handleLogout}
            sx={{ '&:hover': { color: '#ff0088' } }}
          >
            <ExitToApp />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;