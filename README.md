# 👻 Ghost Protocol

**A steganographic messenger that hides messages within JPEG image DCT coefficients for ultimate privacy and plausible deniability**

![Ghost Protocol](https://img.shields.io/badge/Status-Production%20Ready-green) ![Python](https://img.shields.io/badge/Python-3.11+-blue) ![React](https://img.shields.io/badge/React-18+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)

## 🔐 Features

### Core Steganography
- **DCT-based JPEG Hiding**: Advanced steganographic engine using Discrete Cosine Transform coefficients
- **Plausible Deniability**: Hidden messages are undetectable without the decryption process
- **High Capacity**: Efficiently embeds messages in mid-frequency DCT coefficients
- **Lossless Recovery**: Perfect message reconstruction from steganographic images

### Secure Messaging
- **Real-time Chat**: WebSocket-based instant messaging
- **User Authentication**: JWT-based secure authentication system
- **End-to-End Workflow**: Seamless integration of steganography with chat interface
- **Multiple Formats**: Support for both plain text and hidden messages

### Modern Interface
- **React TypeScript Frontend**: Modern, responsive user interface
- **Drag & Drop**: Intuitive image upload for steganographic operations
- **Real-time Indicators**: Typing indicators and connection status
- **Mobile Responsive**: Works on desktop and mobile devices

### Production Ready
- **FastAPI Backend**: High-performance Python backend with async support
- **SQLAlchemy ORM**: Robust database management
- **Docker Support**: Container-ready deployment
- **Security Best Practices**: Rate limiting, input validation, CORS protection

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/AbsSadhu/ghost-protocol.git
cd ghost-protocol
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend will start on `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`

### 4. First Time Setup
1. Visit `http://localhost:3000`
2. Create a new account
3. Login and start secure messaging!

## 🐳 Docker Deployment

### Quick Deploy
```bash
docker-compose up -d
```

### Production Deploy
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

Access the application at `http://localhost:3000`

## 📱 Usage Guide

### Basic Messaging
1. **Register/Login**: Create account or sign in
2. **Select Contact**: Choose user from sidebar
3. **Send Message**: Type and send regular messages
4. **Real-time**: See messages instantly with WebSocket

### Steganographic Messaging
1. **Open Steganography Panel**: Click settings icon in header
2. **Upload Image**: Drag & drop or select JPEG/PNG image
3. **Enter Secret Message**: Type your hidden message
4. **Encode & Send**: Message is hidden in image and sent
5. **Reveal Messages**: Recipients can decode hidden messages

### Decoding Hidden Messages
1. **Open Steganography Panel**
2. **Switch to Decode Mode**
3. **Upload Steganographic Image**
4. **Reveal Message**: Hidden text is extracted and displayed

## 🏗️ Architecture

### Backend (Python FastAPI)
```
backend/
├── app/
│   ├── api/          # REST API endpoints
│   ├── core/         # Configuration and security
│   ├── models/       # Database models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── requirements.txt  # Python dependencies
└── run.py           # Application entry point
```

### Frontend (React TypeScript)
```
frontend/
├── src/
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API and WebSocket services
│   ├── types/        # TypeScript definitions
│   └── utils/        # Utility functions
├── public/          # Static assets
└── package.json     # Node.js dependencies
```

### Key Technologies
- **Backend**: FastAPI, SQLAlchemy, WebSockets, PIL, NumPy, SciPy
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Steganography**: DCT-based JPEG embedding, OpenCV image processing
- **Security**: JWT authentication, password hashing, CORS protection
- **Database**: SQLite (development), PostgreSQL (production ready)

## 🔬 Steganography Technical Details

### DCT-Based Hiding Algorithm
1. **Image Preprocessing**: Convert RGB to YCbCr color space
2. **Block Processing**: Divide image into 8x8 pixel blocks
3. **DCT Transform**: Apply 2D Discrete Cosine Transform
4. **Coefficient Selection**: Target mid-frequency coefficients for embedding
5. **LSB Modification**: Modify least significant bits of selected coefficients
6. **Reconstruction**: Apply inverse DCT and color space conversion

### Security Features
- **Frequency Domain Hiding**: More robust than spatial domain methods
- **Invisible Modifications**: Changes imperceptible to human eye
- **Capacity Control**: Automatic message size validation
- **Error Detection**: Built-in message integrity verification

## 🛡️ Security Considerations

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Secure session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Steganographic Security
- No visible image artifacts
- Statistical attack resistance
- Plausible deniability
- Secure message encoding

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/auth/me` - Current user info
- `GET /api/v1/auth/users` - List users

### Messaging Endpoints
- `GET /api/v1/messages/` - Get messages
- `POST /api/v1/messages/` - Send message
- `GET /api/v1/messages/conversation/{user_id}` - Get conversation

### Steganography Endpoints
- `POST /api/v1/steganography/encode` - Hide message in image
- `POST /api/v1/steganography/decode` - Extract message from image
- `GET /api/v1/steganography/image/{filename}` - Get steganographic image

### WebSocket Events
- `chat_message` - Real-time message
- `steganographic_message` - Hidden message notification
- `typing` - Typing indicator
- `connection` - Connection status

## 🚀 Production Deployment

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=https://yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Nginx Configuration
```nginx
upstream backend {
    server localhost:8000;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        root /var/www/ghost-protocol;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is intended for educational and legitimate privacy purposes only. Users are responsible for complying with applicable laws and regulations. The developers assume no liability for misuse of this software.

## 🔗 Links

- [Live Demo](https://ghost-protocol-demo.com) (Coming Soon)
- [Documentation](https://docs.ghost-protocol.com) (Coming Soon)
- [Issue Tracker](https://github.com/AbsSadhu/ghost-protocol/issues)

---

**Built with ❤️ for privacy and security**
