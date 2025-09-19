import React, { useState, useRef } from 'react';
import {
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { CloudUpload, Visibility, Download, Lock, LockOpen } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { steganographyAPI } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SteganographyTool: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [hideMessage, setHideMessage] = useState('');
  const [hideImage, setHideImage] = useState<File | null>(null);
  const [hideImagePreview, setHideImagePreview] = useState<string>('');
  const [extractImage, setExtractImage] = useState<File | null>(null);
  const [extractImagePreview, setExtractImagePreview] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [extractedMessage, setExtractedMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hideFileInputRef = useRef<HTMLInputElement>(null);
  const extractFileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleHideImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHideImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHideImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExtractImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setExtractImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHideMessage = async () => {
    if (!hideImage || !hideMessage.trim()) {
      setError('Please select an image and enter a message');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await steganographyAPI.hideMessage(hideImage, hideMessage);
      setResultImage(`data:image/jpeg;base64,${response.image}`);
      setSuccess('Message successfully hidden in image!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to hide message');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractMessage = async () => {
    if (!extractImage) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await steganographyAPI.extractMessage(extractImage);
      setExtractedMessage(response.message || 'No hidden message found');
      setSuccess('Message extraction completed!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to extract message');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'ghost_protocol_image.jpg';
      link.click();
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          background: 'linear-gradient(45deg, #00ff88, #ff0088)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 3,
        }}
      >
        Steganography Tool
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        sx={{ color: '#888', mb: 4 }}
      >
        Hide and extract messages in JPEG images using DCT coefficients
      </Typography>

      <Paper
        sx={{
          background: 'rgba(26, 26, 26, 0.9)',
          border: '1px solid #333',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#00ff88',
            },
          }}
        >
          <Tab icon={<Lock />} label="Hide Message" />
          <Tab icon={<LockOpen />} label="Extract Message" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ m: 2 }}>
            {success}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Message Input */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Secret Message"
              placeholder="Enter the message you want to hide..."
              value={hideMessage}
              onChange={(e) => setHideMessage(e.target.value)}
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

            {/* Image Upload */}
            <Box>
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                onChange={handleHideImageSelect}
                ref={hideFileInputRef}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => hideFileInputRef.current?.click()}
                sx={{
                  borderColor: '#00ff88',
                  color: '#00ff88',
                  '&:hover': {
                    borderColor: '#00aa55',
                    backgroundColor: 'rgba(0, 255, 136, 0.08)',
                  },
                }}
              >
                Select Cover Image (JPEG)
              </Button>
            </Box>

            {/* Image Preview */}
            {hideImagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ maxWidth: 400, background: 'rgba(10, 10, 10, 0.5)' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={hideImagePreview}
                    alt="Cover image"
                    sx={{ objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Cover Image: {hideImage?.name}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Hide Button */}
            <Button
              variant="contained"
              onClick={handleHideMessage}
              disabled={loading || !hideImage || !hideMessage.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
              sx={{
                background: 'linear-gradient(45deg, #00ff88, #00aa55)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00aa55, #007733)',
                },
                maxWidth: 200,
              }}
            >
              {loading ? 'Hiding...' : 'Hide Message'}
            </Button>

            {/* Result Image */}
            {resultImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
                    Result Image:
                  </Typography>
                  <Card sx={{ maxWidth: 400, background: 'rgba(10, 10, 10, 0.5)' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={resultImage}
                      alt="Result image"
                      sx={{ objectFit: 'contain' }}
                    />
                    <CardContent>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={downloadImage}
                        sx={{
                          borderColor: '#00ff88',
                          color: '#00ff88',
                          '&:hover': {
                            borderColor: '#00aa55',
                            backgroundColor: 'rgba(0, 255, 136, 0.08)',
                          },
                        }}
                      >
                        Download Image
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Image Upload */}
            <Box>
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                onChange={handleExtractImageSelect}
                ref={extractFileInputRef}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => extractFileInputRef.current?.click()}
                sx={{
                  borderColor: '#ff0088',
                  color: '#ff0088',
                  '&:hover': {
                    borderColor: '#aa0055',
                    backgroundColor: 'rgba(255, 0, 136, 0.08)',
                  },
                }}
              >
                Select Image with Hidden Message
              </Button>
            </Box>

            {/* Image Preview */}
            {extractImagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ maxWidth: 400, background: 'rgba(10, 10, 10, 0.5)' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={extractImagePreview}
                    alt="Extract image"
                    sx={{ objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Image: {extractImage?.name}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Extract Button */}
            <Button
              variant="contained"
              onClick={handleExtractMessage}
              disabled={loading || !extractImage}
              startIcon={loading ? <CircularProgress size={20} /> : <LockOpen />}
              sx={{
                background: 'linear-gradient(45deg, #ff0088, #aa0055)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #aa0055, #770033)',
                },
                maxWidth: 200,
              }}
            >
              {loading ? 'Extracting...' : 'Extract Message'}
            </Button>

            {/* Extracted Message */}
            {extractedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ff0088' }}>
                    Extracted Message:
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(10, 10, 10, 0.5)',
                      border: '1px solid #ff0088',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        color: '#fff',
                      }}
                    >
                      {extractedMessage}
                    </Typography>
                  </Paper>
                </Box>
              </motion.div>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SteganographyTool;