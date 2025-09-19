import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import { Send, Image, Shield, MessageCircle } from 'lucide-react';
import { steganographyAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  selectedUser: User | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  typingUsers: Set<number>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedUser,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedUser) return;

    onSendMessage(messageText);
    setMessageText('');
    
    // Stop typing indicator
    setIsTyping(false);
    onTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = formatDate(message.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-900">
        <div className="text-center text-dark-200">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Welcome to Ghost Protocol</h3>
          <p>Select a contact to start a secure conversation</p>
          <p className="text-sm mt-2 opacity-75">Messages can be hidden using steganography</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-dark-900">
      {/* Chat Header */}
      <div className="bg-dark-800 border-b border-dark-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold">{selectedUser.username}</h3>
            <p className="text-xs text-dark-200">{selectedUser.email}</p>
          </div>
          <Shield className="h-5 w-5 text-primary-400 ml-auto" title="Secure messaging enabled" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center py-2">
              <div className="bg-dark-700 text-dark-200 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>
            
            {/* Messages for this date */}
            {dayMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === currentUser?.id}
                showAvatar={
                  index === 0 || 
                  dayMessages[index - 1].sender_id !== message.sender_id
                }
              />
            ))}
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center space-x-2 text-dark-200">
            <div className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center text-xs">
              {selectedUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-dark-200 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-dark-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-dark-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-dark-800 border-t border-dark-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={handleInputChange}
              placeholder={`Message ${selectedUser.username}...`}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-dark-200 hover:text-white"
              title="Attach image for steganography"
            >
              <Image className="h-5 w-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;