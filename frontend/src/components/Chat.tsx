import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Message, WebSocketMessage } from '../types';
import { authAPI, messageAPI } from '../services/api';
import websocketService from '../services/websocket';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import SteganographyPanel from './SteganographyPanel';
import { Ghost, Shield, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSteganography, setShowSteganography] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  // Refs for typing timeout
  const typingTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    loadUsers();
    
    // Set up WebSocket message handler
    const unsubscribe = websocketService.onMessage(handleWebSocketMessage);
    const unsubscribeConnection = websocketService.onConnectionChange(setConnected);
    
    return () => {
      unsubscribe();
      unsubscribeConnection();
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const usersData = await authAPI.getUsers();
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId: number) => {
    try {
      const conversation = await messageAPI.getConversation(userId);
      setMessages(conversation);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_message':
        if (message.sender_id && message.content) {
          const newMessage: Message = {
            id: Date.now(), // Temporary ID
            sender_id: message.sender_id,
            recipient_id: message.recipient_id || 0,
            content: message.content,
            is_steganographic: false,
            created_at: message.timestamp || new Date().toISOString(),
            sender_username: message.sender_username,
          };
          
          // Only add to current conversation if it's from the selected user
          if (selectedUser && message.sender_id === selectedUser.id) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          // Show notification if not from current conversation
          if (!selectedUser || message.sender_id !== selectedUser.id) {
            toast.success(`New message from ${message.sender_username}`);
          }
        }
        break;
        
      case 'new_steganographic_message':
        if (message.sender_id && message.image_filename) {
          const newMessage: Message = {
            id: Date.now(), // Temporary ID
            sender_id: message.sender_id,
            recipient_id: message.recipient_id || 0,
            image_filename: message.image_filename,
            is_steganographic: true,
            created_at: message.timestamp || new Date().toISOString(),
            sender_username: message.sender_username,
          };
          
          // Only add to current conversation if it's from the selected user
          if (selectedUser && message.sender_id === selectedUser.id) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          // Show notification
          if (!selectedUser || message.sender_id !== selectedUser.id) {
            toast.success(`New hidden message from ${message.sender_username}`);
          }
        }
        break;
        
      case 'typing':
        if (message.sender_id && selectedUser && message.sender_id === selectedUser.id) {
          if (message.is_typing) {
            setTypingUsers(prev => new Set(prev).add(message.sender_id!));
            
            // Clear existing timeout
            const existingTimeout = typingTimeouts.current.get(message.sender_id);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }
            
            // Set new timeout
            const timeout = setTimeout(() => {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(message.sender_id!);
                return newSet;
              });
              typingTimeouts.current.delete(message.sender_id!);
            }, 3000);
            
            typingTimeouts.current.set(message.sender_id, timeout);
          } else {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.sender_id!);
              return newSet;
            });
            
            // Clear timeout
            const timeout = typingTimeouts.current.get(message.sender_id);
            if (timeout) {
              clearTimeout(timeout);
              typingTimeouts.current.delete(message.sender_id);
            }
          }
        }
        break;
        
      case 'connection':
        setConnected(true);
        break;
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedUser || !content.trim()) return;

    try {
      // Send via WebSocket for real-time delivery
      websocketService.sendChatMessage(content, selectedUser.id);
      
      // Also send via API to store in database
      const message = await messageAPI.sendMessage(content, selectedUser.id);
      
      // Add to local messages
      setMessages(prev => [...prev, message]);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSteganographicMessage = (imageFilename: string) => {
    if (!selectedUser) return;
    
    // Send notification via WebSocket
    websocketService.sendSteganographicMessage(imageFilename, selectedUser.id);
    
    // Reload conversation to get the new message
    loadConversation(selectedUser.id);
    
    // Close steganography panel
    setShowSteganography(false);
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedUser) {
      websocketService.sendTypingIndicator(selectedUser.id, isTyping);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Ghost className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading Ghost Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-900 flex">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-dark-800 border-b border-dark-700 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <Ghost className="h-6 w-6 text-primary-500" />
            <Shield className="h-5 w-5 text-primary-400" />
            <span className="text-white font-semibold">Ghost Protocol</span>
            {connected ? (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-dark-200">Welcome, {user?.username}</span>
            <button
              onClick={() => setShowSteganography(!showSteganography)}
              className="p-2 text-dark-200 hover:text-white rounded-md hover:bg-dark-700"
              title="Steganography Panel"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-dark-200 hover:text-white rounded-md hover:bg-dark-700"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <ChatSidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />

        {/* Chat Window */}
        <div className="flex-1 flex">
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            typingUsers={typingUsers}
          />
          
          {/* Steganography Panel */}
          {showSteganography && (
            <SteganographyPanel
              selectedUser={selectedUser}
              onMessageSent={handleSteganographicMessage}
              onClose={() => setShowSteganography(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;