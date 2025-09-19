import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { User } from '../types';
import { steganographyAPI } from '../services/api';
import { Shield, Upload, X, Send, Eye, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface SteganographyPanelProps {
  selectedUser: User | null;
  onMessageSent: (imageFilename: string) => void;
  onClose: () => void;
}

const SteganographyPanel: React.FC<SteganographyPanelProps> = ({
  selectedUser,
  onMessageSent,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [decodedMessage, setDecodedMessage] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDecodedMessage(''); // Clear any previous decoded message
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleEncode = async () => {
    if (!selectedFile || !message.trim() || !selectedUser) {
      toast.error('Please select an image, enter a message, and select a recipient');
      return;
    }

    try {
      setLoading(true);
      const result = await steganographyAPI.encodeMessage(message, selectedUser.id, selectedFile);
      
      if (result.success && result.image_filename) {
        toast.success('Message encoded successfully!');
        onMessageSent(result.image_filename);
        
        // Reset form
        setMessage('');
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        toast.error(result.message || 'Failed to encode message');
      }
    } catch (error) {
      toast.error('Failed to encode message');
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!selectedFile) {
      toast.error('Please select an image to decode');
      return;
    }

    try {
      setLoading(true);
      const result = await steganographyAPI.decodeMessage(selectedFile);
      
      if (result.success && result.message) {
        setDecodedMessage(result.message);
        toast.success('Hidden message found!');
      } else {
        setDecodedMessage('No hidden message found');
        toast.info('No hidden message detected in this image');
      }
    } catch (error) {
      toast.error('Failed to decode message');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setDecodedMessage('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="w-96 bg-dark-800 border-l border-dark-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <h3 className="text-white font-semibold">Steganography</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-dark-200 hover:text-white rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Mode Selector */}
        <div className="flex mt-3 bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => setMode('encode')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              mode === 'encode'
                ? 'bg-primary-600 text-white'
                : 'text-dark-200 hover:text-white'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              mode === 'decode'
                ? 'bg-primary-600 text-white'
                : 'text-dark-200 hover:text-white'
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Image File
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 hover:border-primary-500'
            }`}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-32 object-contain mx-auto rounded"
                />
                <p className="text-sm text-white">{selectedFile.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-dark-200">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image, or click to select'}
                </p>
                <p className="text-xs mt-1">JPEG, PNG up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Encode Mode */}
        {mode === 'encode' && (
          <>
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Secret Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your secret message..."
                className="w-full h-24 px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-dark-200 mt-1">
                {message.length} characters
              </p>
            </div>

            {/* Recipient */}
            {selectedUser ? (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Recipient
                </label>
                <div className="flex items-center space-x-2 p-2 bg-dark-700 rounded-md">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm">{selectedUser.username}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-dark-200 py-4">
                <p className="text-sm">Select a contact to send hidden message</p>
              </div>
            )}

            {/* Encode Button */}
            <button
              onClick={handleEncode}
              disabled={loading || !selectedFile || !message.trim() || !selectedUser}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Hide & Send</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Decode Mode */}
        {mode === 'decode' && (
          <>
            {/* Decode Button */}
            <button
              onClick={handleDecode}
              disabled={loading || !selectedFile}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Reveal Message</span>
                </>
              )}
            </button>

            {/* Decoded Message */}
            {decodedMessage && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hidden Message
                </label>
                <div className="p-3 bg-dark-700 border border-primary-500 rounded-md">
                  <p className="text-white text-sm">{decodedMessage}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-dark-200 text-center space-y-1">
          <p>🔒 Messages hidden using DCT-based JPEG steganography</p>
          <p>👁️ Provides plausible deniability</p>
        </div>
      </div>
    </div>
  );
};

export default SteganographyPanel;