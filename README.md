# 👻 Ghost Protocol

> **Steganographic Messenger for Ultimate Privacy**

Ghost Protocol is a cutting-edge steganographic messenger that hides messages within JPEG image DCT coefficients, providing ultimate privacy and plausible deniability for secure communications.

![Ghost Protocol](https://img.shields.io/badge/Ghost-Protocol-brightgreen?style=for-the-badge&logo=ghost&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## 🚀 Features

### 🔐 Advanced Steganography
- **DCT-based hiding**: Messages hidden in JPEG DCT coefficients
- **Invisible embedding**: No visible changes to cover images
- **High capacity**: Support for messages up to image capacity limits
- **Robust extraction**: Reliable message recovery from stego images

### 💬 Real-time Chat
- **WebSocket communication**: Instant message delivery
- **Multiple chat rooms**: General, Secure, and Anonymous channels
- **User authentication**: JWT-based secure login system
- **Live connection status**: Real-time connectivity indicators

### 🎨 Modern UI
- **Dark theme**: Cyberpunk-inspired design
- **Responsive layout**: Works on desktop and mobile
- **Smooth animations**: Framer Motion powered transitions
- **Material-UI components**: Professional, accessible interface

### 🔧 Developer Features
- **FastAPI backend**: High-performance async API
- **React TypeScript frontend**: Type-safe, maintainable code
- **Docker support**: Easy deployment and scaling
- **RESTful API**: Well-documented endpoints

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  React Frontend │◄──►│  FastAPI Backend │◄──►│   PostgreSQL    │
│   (TypeScript)  │    │    (Python)      │    │    Database     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         │              ┌─────────────────┐              │
         │              │                 │              │
         └──────────────┤  WebSocket API  ├──────────────┘
                        │   (Real-time)   │
                        └─────────────────┘
```

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbsSadhu/ghost-protocol.git
   cd ghost-protocol
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Installation

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./ghost_protocol.db
REDIS_URL=redis://localhost:6379

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Steganography Endpoints

- `POST /steganography/hide` - Hide message in image
- `POST /steganography/extract` - Extract message from image

### Chat Endpoints

- `GET /rooms` - Get available chat rooms
- `WebSocket /ws/{room_id}` - Real-time chat connection

### Example Usage

#### Hide a Message
```python
import requests

# Hide message in image
with open('cover_image.jpg', 'rb') as f:
    files = {'image_file': f}
    data = {'message': 'Secret message'}
    response = requests.post('http://localhost:8000/steganography/hide', 
                           files=files, data=data,
                           headers={'Authorization': 'Bearer YOUR_TOKEN'})
```

#### Extract a Message
```python
# Extract message from image
with open('stego_image.jpg', 'rb') as f:
    files = {'image_file': f}
    response = requests.post('http://localhost:8000/steganography/extract',
                           files=files,
                           headers={'Authorization': 'Bearer YOUR_TOKEN'})
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security Features

### Steganography Security
- **DCT coefficient embedding**: Messages hidden in frequency domain
- **Invisible modifications**: No perceptual changes to images
- **Plausible deniability**: Images appear completely normal

### Application Security
- **JWT authentication**: Secure token-based auth
- **Password hashing**: Bcrypt password protection
- **CORS protection**: Controlled cross-origin requests
- **Input validation**: Pydantic model validation

## 🛠️ Development

### Project Structure
```
ghost-protocol/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── steganography.py     # DCT steganography service
│   ├── auth.py              # Authentication service
│   ├── models.py            # Pydantic models
│   ├── database.py          # Database configuration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   └── types/           # TypeScript types
│   ├── package.json         # Node dependencies
│   └── tsconfig.json        # TypeScript config
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is for educational and research purposes only. Users are responsible for complying with all applicable laws and regulations. The authors do not condone illegal activities.

## 🙏 Acknowledgments

- **Steganography**: Based on DCT coefficient embedding techniques
- **UI Design**: Inspired by cyberpunk aesthetics
- **FastAPI**: For the excellent async web framework
- **React**: For the component-based frontend architecture

---

<div align="center">
  <strong>👻 Ghost Protocol - Where Messages Disappear Into Plain Sight 👻</strong>
</div>
