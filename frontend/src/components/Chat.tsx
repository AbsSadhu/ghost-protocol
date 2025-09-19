import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface Message {
  type: string;
  user: string;
  message: string;
  timestamp: string;
  room: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [socket, setSocket] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const rooms = [
    { id: 'general', name: 'General', color: '#00ff88' },
    { id: 'secure', name: 'Secure', color: '#ff0088' },
    { id: 'anonymous', name: 'Anonymous', color: '#8800ff' },
  ];

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('ws://localhost:8000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      // Join the current room
      newSocket.emit('join_room', { room: currentRoom });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Change room
    if (socket && connected) {
      socket.emit('leave_room', { room: currentRoom });
      socket.emit('join_room', { room: currentRoom });
      setMessages([]); // Clear messages when switching rooms
    }
  }, [currentRoom, socket, connected]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Alternative WebSocket connection for FastAPI
  useEffect(() => {
    if (!socket) {
      const ws = new WebSocket(`ws://localhost:8000/ws/${currentRoom}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      };
      
      setSocket(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [currentRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      const messageData = {
        user: user,
        message: newMessage.trim(),
        room: currentRoom,
      };

      if (socket.send) {
        // WebSocket connection
        socket.send(JSON.stringify(messageData));
      } else {
        // Socket.io connection
        socket.emit('message', messageData);
      }

      setNewMessage('');
    }
  };

  const handleRoomChange = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const getMessageColor = (messageUser: string) => {
    if (messageUser === user) return '#00ff88';
    if (messageUser === 'system') return '#ff0088';
    return '#8888ff';
  };

  return (
    <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Room Selection */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          background: 'rgba(26, 26, 26, 0.9)',
          border: '1px solid #333',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h6">
            Chat Rooms
            <Chip
              label={connected ? 'Connected' : 'Disconnected'}
              color={connected ? 'success' : 'error'}
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>
          
          <Box display="flex" gap={1}>
            {rooms.map((room) => (
              <Chip
                key={room.id}
                label={room.name}
                onClick={() => handleRoomChange(room.id)}
                variant={currentRoom === room.id ? 'filled' : 'outlined'}
                sx={{
                  color: room.color,
                  borderColor: room.color,
                  backgroundColor: currentRoom === room.id ? `${room.color}20` : 'transparent',
                  '&:hover': {
                    backgroundColor: `${room.color}30`,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Paper
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          background: 'rgba(10, 10, 10, 0.9)',
          border: '1px solid #333',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Room: {rooms.find(r => r.id === currentRoom)?.name}
        </Typography>
        
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#333',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#00ff88',
              borderRadius: '3px',
            },
          }}
        >
          <List>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="body2"
                            sx={{ color: getMessageColor(msg.user), fontWeight: 'bold' }}
                          >
                            {msg.user}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body1"
                          sx={{ color: '#fff', mt: 0.5, fontFamily: 'monospace' }}
                        >
                          {msg.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Message Input */}
      <Paper
        sx={{
          p: 2,
          background: 'rgba(26, 26, 26, 0.9)',
          border: '1px solid #333',
        }}
      >
        <form onSubmit={handleSendMessage}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!connected}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#333',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00ff88',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff88',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!connected || !newMessage.trim()}
              startIcon={<Send />}
              sx={{
                background: 'linear-gradient(45deg, #00ff88, #00aa55)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00aa55, #007733)',
                },
                minWidth: '120px',
              }}
            >
              Send
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Chat;