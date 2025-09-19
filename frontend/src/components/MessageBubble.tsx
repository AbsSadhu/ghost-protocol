import React, { useState } from 'react';
import { Message } from '../types';
import { Shield, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { steganographyAPI } from '../services/api';
import toast from 'react-hot-toast';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
}) => {
  const [showHiddenMessage, setShowHiddenMessage] = useState(false);
  const [hiddenMessage, setHiddenMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRevealMessage = async () => {
    if (!message.image_filename) return;

    try {
      setLoading(true);
      
      // Fetch the image and decode the hidden message
      const imageUrl = steganographyAPI.getImage(message.image_filename);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], message.image_filename, { type: blob.type });
      
      const result = await steganographyAPI.decodeMessage(file);
      
      if (result.success && result.message) {
        setHiddenMessage(result.message);
        setShowHiddenMessage(true);
        toast.success('Hidden message revealed!');
      } else {
        toast.error('No hidden message found');
      }
    } catch (error) {
      toast.error('Failed to decode hidden message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        {showAvatar && !isOwnMessage && (
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {message.sender_username?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        
        {/* Message Content */}
        <div>
          {/* Username (for received messages) */}
          {showAvatar && !isOwnMessage && (
            <div className="text-xs text-dark-200 mb-1 ml-2">
              {message.sender_username}
            </div>
          )}
          
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwnMessage
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-white'
            }`}
          >
            {/* Regular message content */}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
            
            {/* Steganographic message */}
            {message.is_steganographic && message.image_filename && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary-300" />
                  <span className="text-xs text-primary-300">Hidden Message</span>
                </div>
                
                {/* Image */}
                <div className="relative">
                  <img
                    src={steganographyAPI.getImage(message.image_filename)}
                    alt="Steganographic image"
                    className="max-w-full h-auto rounded-md"
                  />
                  
                  {/* Reveal button overlay */}
                  <button
                    onClick={handleRevealMessage}
                    disabled={loading}
                    className="absolute inset-0 bg-black bg-opacity-50 text-white rounded-md opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <span className="text-sm">Reveal</span>
                      </div>
                    )}
                  </button>
                </div>
                
                {/* Hidden message display */}
                {showHiddenMessage && hiddenMessage && (
                  <div className="mt-2 p-2 bg-black bg-opacity-30 rounded border border-primary-400">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-primary-300">Decoded Message:</span>
                      <button
                        onClick={() => setShowHiddenMessage(false)}
                        className="text-xs text-primary-300 hover:text-white"
                      >
                        <EyeOff className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm text-white">{hiddenMessage}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Timestamp */}
            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-200' : 'text-dark-200'}`}>
              {formatTime(message.created_at)}
              {message.is_steganographic && (
                <Shield className="inline h-3 w-3 ml-1" />
              )}
            </div>
          </div>
        </div>
        
        {/* Spacer for own messages */}
        {isOwnMessage && <div className="w-8"></div>}
      </div>
    </div>
  );
};

export default MessageBubble;