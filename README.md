# CipherLink

<div align="center">

<p>
  <img src="https://img.shields.io/badge/Quantum--Resistant-Encryption-00e639?style=for-the-badge" alt="Quantum-Resistant Encryption" />
  <img src="https://img.shields.io/badge/aiohttp-Backend-009688?style=for-the-badge" alt="aiohttp backend" />
  <img src="https://img.shields.io/badge/Vanilla%20JS-Frontend-000000?style=for-the-badge" alt="Vanilla JS frontend" />
</p>

   <h3>A prototype secure real-time peer-to-peer encrypted communication network.</h3>

<p>CipherLink implements end-to-end encryption using Elliptic Curve Diffie-Hellman (ECDH) key exchange with AES-256 symmetric encryption, providing forward secrecy for secure communications.</p>

</div>

---

## Problem

In insecure communication channels, sensitive information is vulnerable to interception, manipulation, and unauthorized access. Users need a way to communicate privately with guarantees that:
- Only intended recipients can read messages
- Communications cannot be tampered with
- Past communications remain secure even if long-term keys are compromised
- No message history is stored on servers

## Solution

CipherLink provides a complete encrypted communication solution that allows users to:

- Establish secure peer-to-peer connections through a signaling server
- Perform authenticated Ephemeral Elliptic Curve Diffie-Hellman (ECDHE) key exchange
- Encrypt all messages with AES-256-GCM using unique session keys
- Verify message integrity with HMAC-SHA256 authentication
- Enjoy forward secrecy through ephemeral key exchange
- Communicate without storing message history on any server

## Key features

- **End-to-End Encryption**: ECDH key exchange (SECP384R1) + AES-256-GCM encryption
- **Forward Secrecy**: Unique ephemeral keys per session prevent retrospective decryption
- **Message Authentication**: HMAC-SHA256 ensures message integrity and origin verification
- **Peer-to-Peer Architecture**: Direct client-to-client communication after server-mediated handshake
- **Ephemeral Messages**: Messages exist only in memory during transmission
- **Web Interface**: Modern responsive UI with glassmorphism effects and real-time updates
- **Command-Line Interface**: Text-based client for advanced users and scripting
- **Self-Destructing Communications**: No persistent storage of message content

## Project structure

```text
CipherLink/
├── encrypio/                 # Core application package
│   ├── __init__.py
│   ├── security.py           # Cryptographic operations
│   ├── database/             # Client data management
│   │   ├── __init__.py
│   │   ├── client_model.py
│   │   └── database.py
│   ├── web_server.py         # HTTP/WebSocket server
│   ├── client.py             # Command-line client
│   ├── messages.py           # Message handling
│   └── p2p/                  # Peer-to-peer communication
│       ├── __init__.py
│       ├── p2p_client.py
│       └── p2p_server.py
├── public/                   # Static web assets
│   ├── index.html            # Main application entry point
│   ├── app.js                # Frontend application logic
│   └── design/               # UI assets and animations
├── keys/                     # Cryptographic key storage
│   ├── klevas_key.pem        # Demo user key
│   └── berzas_key.pem        # Demo user key
├── ssl/                      # TLS certificates
│   ├── server.crt
│   └── server.key
├── requirements.txt          # Python dependencies
├── render.yaml               # Render.com deployment configuration
├── USER_MANUAL.md            # Detailed user documentation
└── README.md                 # This file
```

## Tech stack

### Backend
- Python 3.14+
- aiohttp: WebSocket and HTTP server
- cryptography: ECDH, AES, HKDF, HMAC implementations

### Frontend
- HTML5
- CSS3 (with custom design system)
- Vanilla JavaScript (ES6+)
- WebSocket API for real-time communication

### Cryptography
- Key Exchange: Elliptic Curve Diffie-Hellman (SECP384R1)
- Symmetric Encryption: AES-256 in GCM mode
- Key Derivation: HKDF-SHA256
- Message Authentication: HMAC-SHA256
- Random Generation: Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)

### Supporting tools
- OpenSSL: For certificate generation and management
- pip: Python package management

## Workflow

```text
User Action
   ↓
Client authenticates with server (mTLS)
   ↓
Server facilitates ECDH public key exchange
   ↓
Clients derive shared secret and session keys
   ↓
Messages encrypted with AES-256-GCM + HMAC-SHA256
   ↓
Encrypted payloads transmitted peer-to-peer
   ↓
Recipient verifies and decrypts messages
   ↓
Keys and plaintext discarded after use
```

## Quick start

### 1. Prerequisites

- Python 3.10+
- pip package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Git for version control

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/your-username/CipherLink.git
cd CipherLink

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the application

#### Web Interface (Recommended)
```bash
# Start the web server
python encrypio/web_server.py

# Open in browser
# Visit: http://localhost:5000
```

#### Command-Line Interface
```bash
# In Terminal 1 - Start first client
python encrypio/client.py klevas

# In Terminal 2 - Start second client
python encrypio/client.py berzas

# Follow prompts to establish connection and exchange messages
```

### 4. Verify installation

```bash
# Run built-in self-test
python encrypio/web_server.py --test
# Should output: [SUCCESS] Web Server created successfully!
```

## Main features and experiences

- **Web Interface** (`/`): Full-featured encrypted chat with modern UI
- **Identity Management**: Generate and manage cryptographic identities
- **Peer Discovery**: Find and connect to other users on the network
- **Secure Messaging**: End-to-end encrypted real-time communication
- **Vault**: Manage encrypted payloads and cryptographic assets
- **Session Monitoring**: View cryptographic details of active connections
- **CLI Client** (`encrypio/client.py`): Text-based interface for automation

## Development notes

- The web server serves static files from the `public` directory
- WebSocket connections are handled at `/ws/chat`
- REST API endpoints are available at:
  - `POST /api/identity/generate` - Create new user identity
  - `GET /api/nodes` - List available peer nodes
- Ensure the `keys` directory is included in deployments (contains demo keys)
- SSL/TLS certificates in the `ssl` directory are used for server authentication
- The project uses relative paths and should work from any directory when run via `python encrypio/web_server.py`

## License

This project is released under the MIT License - see the [LICENSE](LICENSE) file for details.