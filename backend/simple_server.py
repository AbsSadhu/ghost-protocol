#!/usr/bin/env python3
"""
Simple HTTP server for Ghost Protocol demonstration
Uses only Python standard library - no external dependencies required
"""

import json
import math
import base64
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from simple_demo import SimpleDCTSteganography

class GhostProtocolHandler(BaseHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        self.stego = SimpleDCTSteganography()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/' or self.path == '/index.html':
            self.serve_html()
        elif self.path == '/api/demo':
            self.serve_demo()
        else:
            self.send_error(404)
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/hide':
            self.handle_hide_message()
        elif self.path == '/api/extract':
            self.handle_extract_message()
        else:
            self.send_error(404)
    
    def serve_html(self):
        """Serve the main HTML page"""
        html_content = '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ghost Protocol - Steganography Demo</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                    color: #00ff88;
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(26, 26, 26, 0.9);
                    border: 1px solid #00ff88;
                    border-radius: 10px;
                    padding: 30px;
                }
                h1 {
                    text-align: center;
                    background: linear-gradient(45deg, #00ff88, #ff0088);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-size: 2.5em;
                    margin-bottom: 10px;
                }
                .subtitle {
                    text-align: center;
                    color: #888;
                    margin-bottom: 30px;
                }
                .section {
                    margin: 30px 0;
                    padding: 20px;
                    border: 1px solid #333;
                    border-radius: 5px;
                    background: rgba(10, 10, 10, 0.5);
                }
                .section h3 {
                    color: #ff0088;
                    margin-top: 0;
                }
                textarea, input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #00ff88;
                    border-radius: 5px;
                    font-family: inherit;
                    margin: 10px 0;
                    box-sizing: border-box;
                }
                button {
                    background: linear-gradient(45deg, #00ff88, #00aa55);
                    color: #000;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: inherit;
                    font-weight: bold;
                    margin: 10px 5px;
                    transition: all 0.3s;
                }
                button:hover {
                    background: linear-gradient(45deg, #00aa55, #007733);
                    transform: translateY(-2px);
                }
                .result {
                    margin: 20px 0;
                    padding: 15px;
                    border: 1px solid #00ff88;
                    border-radius: 5px;
                    background: rgba(0, 255, 136, 0.1);
                    display: none;
                }
                .error {
                    border-color: #ff0088;
                    background: rgba(255, 0, 136, 0.1);
                    color: #ff0088;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 20px 0;
                }
                @media (max-width: 768px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>👻 GHOST PROTOCOL</h1>
                <p class="subtitle">DCT-Based Steganography Demonstration</p>
                
                <div class="section">
                    <h3>🔬 Algorithm Demo</h3>
                    <p>Click the button below to see the DCT steganography algorithm in action with sample data.</p>
                    <button onclick="runDemo()">Run Algorithm Demo</button>
                    <div id="demo-result" class="result"></div>
                </div>
                
                <div class="grid">
                    <div class="section">
                        <h3>🔒 Hide Message</h3>
                        <p>Hide a secret message in simulated image data:</p>
                        <textarea id="message-input" rows="3" placeholder="Enter your secret message..."></textarea>
                        <button onclick="hideMessage()">Hide Message</button>
                        <div id="hide-result" class="result"></div>
                    </div>
                    
                    <div class="section">
                        <h3>🔓 Extract Message</h3>
                        <p>Extract a hidden message from the data:</p>
                        <input type="text" id="data-input" placeholder="Paste the stego data here..." />
                        <button onclick="extractMessage()">Extract Message</button>
                        <div id="extract-result" class="result"></div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>ℹ️ How It Works</h3>
                    <p><strong>DCT Steganography:</strong> This demonstration uses the Discrete Cosine Transform (DCT) to hide messages in the frequency domain of image data. The process involves:</p>
                    <ul>
                        <li>Dividing image data into 8×8 blocks</li>
                        <li>Applying 2D DCT to each block</li>
                        <li>Modifying middle-frequency coefficients to embed message bits</li>
                        <li>Applying inverse DCT to reconstruct the data</li>
                        <li>The modifications are imperceptible but recoverable</li>
                    </ul>
                </div>
            </div>
            
            <script>
                async function runDemo() {
                    const resultDiv = document.getElementById('demo-result');
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result';
                    resultDiv.innerHTML = '🔄 Running DCT steganography demo...';
                    
                    try {
                        const response = await fetch('/api/demo');
                        const data = await response.text();
                        resultDiv.innerHTML = '<pre>' + data + '</pre>';
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Demo failed: ' + error.message;
                    }
                }
                
                async function hideMessage() {
                    const message = document.getElementById('message-input').value;
                    const resultDiv = document.getElementById('hide-result');
                    
                    if (!message.trim()) {
                        resultDiv.style.display = 'block';
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Please enter a message to hide';
                        return;
                    }
                    
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result';
                    resultDiv.innerHTML = '🔄 Hiding message...';
                    
                    try {
                        const response = await fetch('/api/hide', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({message: message})
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            resultDiv.innerHTML = `
                                <strong>✅ Message hidden successfully!</strong><br><br>
                                <strong>Stego Data (copy this for extraction):</strong><br>
                                <textarea readonly style="height: 100px;">${data.stego_data}</textarea><br>
                                <small>Modified pixels: ${data.stats.modified_pixels}/${data.stats.total_pixels} (${data.stats.percentage}%)</small>
                            `;
                        } else {
                            resultDiv.className = 'result error';
                            resultDiv.innerHTML = '❌ ' + data.error;
                        }
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Error: ' + error.message;
                    }
                }
                
                async function extractMessage() {
                    const stegoData = document.getElementById('data-input').value;
                    const resultDiv = document.getElementById('extract-result');
                    
                    if (!stegoData.trim()) {
                        resultDiv.style.display = 'block';
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Please enter stego data';
                        return;
                    }
                    
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result';
                    resultDiv.innerHTML = '🔄 Extracting message...';
                    
                    try {
                        const response = await fetch('/api/extract', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({stego_data: stegoData})
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            resultDiv.innerHTML = `
                                <strong>✅ Message extracted successfully!</strong><br><br>
                                <strong>Hidden Message:</strong><br>
                                <div style="background: rgba(0,255,136,0.2); padding: 15px; border-radius: 5px; margin: 10px 0;">
                                    "${data.message}"
                                </div>
                            `;
                        } else {
                            resultDiv.className = 'result error';
                            resultDiv.innerHTML = '❌ ' + data.error;
                        }
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Error: ' + error.message;
                    }
                }
            </script>
        </body>
        </html>
        '''
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
    
    def serve_demo(self):
        """Serve the algorithm demonstration"""
        import io
        import contextlib
        
        # Capture the demo output
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            from simple_demo import demonstrate_steganography
            demonstrate_steganography()
        
        demo_output = output.getvalue()
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(demo_output.encode('utf-8'))
    
    def handle_hide_message(self):
        """Handle message hiding request"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            message = data.get('message', '')
            if not message:
                raise ValueError("No message provided")
            
            # Generate sample data
            sample_data = []
            for i in range(128):
                row = []
                for j in range(128):
                    value = int(128 + 50 * math.sin(i * 0.1) * math.cos(j * 0.1))
                    row.append(max(0, min(255, value)))
                sample_data.append(row)
            
            # Hide message
            stego_data = self.stego.hide_message_in_data(sample_data, message)
            
            # Calculate statistics
            differences = 0
            total_pixels = len(sample_data) * len(sample_data[0])
            for i in range(len(sample_data)):
                for j in range(len(sample_data[0])):
                    if sample_data[i][j] != stego_data[i][j]:
                        differences += 1
            
            # Serialize stego data
            stego_data_str = base64.b64encode(json.dumps(stego_data).encode()).decode()
            
            response = {
                'success': True,
                'stego_data': stego_data_str,
                'stats': {
                    'modified_pixels': differences,
                    'total_pixels': total_pixels,
                    'percentage': f"{differences/total_pixels*100:.2f}"
                }
            }
            
        except Exception as e:
            response = {'success': False, 'error': str(e)}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def handle_extract_message(self):
        """Handle message extraction request"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            stego_data_str = data.get('stego_data', '')
            if not stego_data_str:
                raise ValueError("No stego data provided")
            
            # Deserialize stego data
            stego_data = json.loads(base64.b64decode(stego_data_str).decode())
            
            # Extract message
            message = self.stego.extract_message_from_data(stego_data)
            
            response = {
                'success': True,
                'message': message
            }
            
        except Exception as e:
            response = {'success': False, 'error': str(e)}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

def run_server(port=8000):
    """Run the Ghost Protocol demonstration server"""
    server = HTTPServer(('localhost', port), GhostProtocolHandler)
    print(f"👻 Ghost Protocol Demo Server running at http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

if __name__ == "__main__":
    run_server()