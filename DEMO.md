# 👻 Ghost Protocol - Visual Demo

## Application Screenshots & Flow

### 🚪 Login Screen
```
╭─────────────────────────────────────────────────────────────╮
│                    👻 Ghost Protocol 🛡️                    │
│          Steganographic messenger for ultimate privacy      │
│                                                             │
│  ╭─────────────────────────────────────────────────────╮   │
│  │                    Login                            │   │
│  │                                                     │   │
│  │  Username: [________________]                       │   │
│  │  Password: [________________] 👁️                   │   │
│  │                                                     │   │
│  │           [    Sign in    ]                         │   │
│  │                                                     │   │
│  │  Don't have an account? Sign up                    │   │
│  ╰─────────────────────────────────────────────────────╯   │
│                                                             │
│        Messages are hidden using DCT-based JPEG            │
│             steganography for plausible deniability        │
╰─────────────────────────────────────────────────────────────╯
```

### 💬 Main Chat Interface
```
╭─────────────────────────────────────────────────────────────────────────────────────╮
│ 👻 Ghost Protocol 🛡️ • Welcome, Alice                        ⚙️ 🚪 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│         │                                                             │               │
│ Contacts│                      Chat with Bob                          │ Steganography │
│  (3)    │                   alice@example.com                         │     Panel     │
│         │ ────────────────────────────────────────────────────────── │               │
│  Bob ●  │                                                             │ 🔒 Hide Mode  │
│  Carol ●│  Today                                                      │               │
│  Dave ● │                                                             │ Upload Image: │
│         │  Alice: Hey! Want to see something cool?        2:30 PM    │ ┌───────────┐ │
│         │  Bob: Sure, what is it?                         2:31 PM    │ │ Drag image│ │
│         │  Alice: 📸 [steganographic_image.jpg] 🛡️        2:32 PM    │ │here or    │ │
│         │         [Reveal hidden message]                            │ │click      │ │
│         │  Bob: No way! What's hidden in it?              2:33 PM    │ └───────────┘ │
│         │                                                             │               │
│         │  🟡 Bob is typing...                                       │ Secret Msg:   │
│         │                                                             │ ┌───────────┐ │
│         │ ────────────────────────────────────────────────────────── │ │Enter your │ │
│         │ Message Bob...                              📎    ➤         │ │hidden msg │ │
│         │                                                             │ └───────────┘ │
│         │                                                             │               │
│         │                                                             │ Recipient:    │
│         │                                                             │ 👤 Bob        │
│         │                                                             │               │
│         │                                                             │ [Hide & Send] │
╰─────────────────────────────────────────────────────────────────────────────────────╯
```

### 🔓 Message Decoding
```
╭─────────────────────────────────────────────────────────────╮
│                  Hidden Message Revealed                    │
│                                                             │
│  📸 Original Image:                                         │
│  ╭─────────────────────────────────────────────────────╮   │
│  │                                                     │   │
│  │     [Seemingly normal photo of a landscape]         │   │
│  │                                                     │   │
│  ╰─────────────────────────────────────────────────────╯   │
│                                                             │
│  🔓 Decoded Message:                                        │
│  ╭─────────────────────────────────────────────────────╮   │
│  │ "Meet me at the old oak tree at midnight.           │   │
│  │  The documents are hidden in the hollow trunk.      │   │
│  │  Use the password 'ghost123' to decrypt the files." │   │
│  ╰─────────────────────────────────────────────────────╯   │
│                                                             │
│  ✨ Message successfully extracted from DCT coefficients!  │
╰─────────────────────────────────────────────────────────────╯
```

## 🔬 Technical Features Demonstrated

### 1. DCT-Based Steganography
- Hides messages in JPEG DCT (Discrete Cosine Transform) coefficients
- Invisible to the naked eye - images appear completely normal
- Robust against compression and casual analysis
- High capacity for message storage

### 2. Real-Time Communication
- WebSocket-based instant messaging
- Typing indicators and online status
- Message delivery confirmations
- Connection status monitoring

### 3. Security & Privacy
- JWT-based authentication
- Password hashing with bcrypt
- Secure API endpoints with CORS protection
- Plausible deniability - no evidence of hidden messages

### 4. User Experience
- Drag-and-drop file upload
- Responsive design for desktop and mobile
- Intuitive steganography panel
- Real-time message decoding

## 🚀 Usage Scenarios

### Scenario 1: Journalist Protection
A journalist needs to securely communicate with sources:
1. Source uploads a normal-looking vacation photo
2. Journalist receives the image via Ghost Protocol
3. The image contains coordinates and meeting details hidden in DCT coefficients
4. If intercepted, the image appears to be just a harmless vacation photo

### Scenario 2: Business Communications
Company executives need to discuss sensitive merger details:
1. Executive A sends a company logo image through Ghost Protocol
2. The logo contains financial projections and negotiation terms
3. Executive B decodes the message using the built-in decoder
4. Any external observer sees only corporate branding materials

### Scenario 3: Activist Coordination
Activists organizing in restrictive environments:
1. Coordinator uploads an innocent meme or artwork
2. The image contains protest locations, times, and safety protocols
3. Recipients decode instructions using Ghost Protocol
4. Surveillance systems see only normal social media content

## 🎯 Key Advantages

1. **Plausible Deniability**: Images appear completely normal
2. **High Security**: DCT-based hiding is sophisticated and robust
3. **User Friendly**: Simple drag-and-drop interface
4. **Real-Time**: Instant messaging with WebSocket technology
5. **Production Ready**: Full authentication, validation, and error handling
6. **Scalable**: Docker containerization for easy deployment

Ghost Protocol provides the perfect balance of advanced cryptographic techniques and user-friendly interface for secure, hidden communications.