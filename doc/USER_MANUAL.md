# CIPHERLINK - User Manual & Technical Documentation

> **Version 1.0** | **Last Updated**: August 3, 2026  
> A Quantum-Resistant P2P Encrypted Network

---

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
4. [Web Interface Guide](#web-interface-guide)
5. [Command Line Interface (CLI) Guide](#command-line-interface-cli-guide)
6. [Security Features](#security-features)
7. [Security Analysis & Attack Resistance](#security-analysis--attack-resistance)
8. [Troubleshooting](#troubleshooting)
9. [Technical Specifications](#technical-specifications)
10. [Design System Documentation](#design-system-documentation)

---

## Overview

CIPHERLINK is a prototype secure real-time peer-to-peer encrypted communication network developed during a 36-hour security hackathon. It implements end-to-end encryption using Elliptic Curve Diffie-Hellman (ECDH) key exchange with AES-256 symmetric encryption, providing forward secrecy for secure communications.

### Key Features
- **End-to-End Encryption**: ECDH key exchange (SECP384R1) + AES-256 encryption
- **Forward Secrecy**: Unique symmetric key per message
- **Peer-to-Peer Architecture**: Direct client-to-client communication after initial server handshake
- **Self-Destructing Messages**: Messages are never stored on servers
- **Quantum-Resistant Cryptography**: Uses elliptic curves resistant to quantum attacks
- **Beautiful UI**: Modern interface with animations, dark mode, and glassmorphism effects
- **Real-time Communication**: WebSocket-based instant messaging

---

## System Architecture

### High-Level Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client A      │    │   Server         │    │   Client B      │
│ (klevas_client) │◄──►│ (encryp.io)      │◄──►│ (berzas_client) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                         ▲                         │
        ▼                         │                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   P2P Connection│◄──►│   WebSocket/API  │◄──►│   P2P Connection│
│ (Direct E2EE)   │    │   Signaling      │    │ (Direct E2EE)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technical Stack
- **Backend**: Python 3.14+
  - `aiohttp`: WebSocket and HTTP server
  - `cryptography`: ECDH key exchange, AES encryption
  - `ssl`: TLS 1.3 for client-server communication
- **Frontend**: 
  - HTML5, CSS3 (Tailwind CSS)
  - Vanilla JavaScript (ES6+)
  - WebSocket API for real-time communication
- **Cryptography**:
  - Key Exchange: Elliptic Curve Diffie-Hellman (SECP384R1)
  - Symmetric Encryption: AES-256 in GCM mode
  - Key Derivation: HKDF-SHA256
  - Signatures: ECDSA (for message integrity)

### Data Flow
1. **Authentication**: Clients authenticate with server using client certificates
2. **Key Exchange**: Server facilitates ECDH public key exchange between clients
3. **Session Establishment**: Clients derive shared secret and establish AES keys
4. **Message Exchange**: 
   - Each message gets a unique random IV
   - Message encrypted with AES-256-GCM using derived key
   - HMAC-SHA256 for integrity verification
   - Only ciphertext transmitted via P2P connection
5. **Message Destruction**: Messages decrypted and displayed, then immediately discarded from memory

---

## Getting Started

### Prerequisites
- Python 3.14 or higher
- pip package manager
- Git (optional, for cloning repository)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/KaroliShp/encryp.io.git
cd encryp.io
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Verify Installation
```bash
python encrypio/web_server.py --test
# Should output: [SUCCESS] Web Server created successfully!
```

#### 4. Generate Initial Keys (if needed)
The system comes with pre-generated keys for demo users "klevas" and "berzas":
- `keys/klevas_key.pem`
- `keys/berzas_key.pem`

To generate new keys:
```bash
python -c "
from encrypio.security import generate_key, save_key
key = generate_key()
save_key(key, 'keys/my_new_key.pem')
print('Key generated: keys/my_new_key.pem')
"
```

### Running the Application

#### Option A: Web Interface (Recommended for Beginners)
```bash
# Start the web server
python encrypio/web_server.py

# Open in browser
# Default URL: http://localhost:5000
```

#### Option B: Command Line Interface (For Advanced Users)
```bash
# In Terminal 1 - Start first client (klevas)
python encrypio/client.py klevas

# In Terminal 2 - Start second client (berzas)
python encrypio/client.py berzas
```

#### Option C: Docker (Alternative Deployment)
```bash
# Build and run (if Dockerfile is provided)
docker build -t cipherlink .
docker run -p 5000:5000 cipherlink
```

---

## Web Interface Guide

### Accessing the Interface
Once the web server is running, open your browser to:
```
http://localhost:5000
```

### Interface Overview
The CIPHERLINK web interface features a modern, dark-themed design with animated elements and intuitive navigation.

#### Main Navigation (Top Header)
- **Nodes** (🌐 Network icon) - View and connect to peer nodes
- **Vault** (💰 Wallet icon) - Manage encrypted payloads
- **Identity** (👆 Fingerprint icon) - Generate and manage user identity
- **Session** (💬 Forum icon) - Active encrypted chats (appears after connection)
- **Mobile Navigation** (Bottom bar on small screens)

#### Color Scheme & Visual Language
The interface uses a custom design system with semantic colors:
- **Primary**: `#00e639` (Neon Green) - Active elements, success states
- **Background**: `#08132a` (Deep Space Blue) - Main background
- **Surface**: `#151f37` (Dark Navy) - Card/panel backgrounds
- **On Surface**: `#d9e2ff` (Light Blue-White) - Primary text
- **Error**: `#ffb4ab` (Soft Red) - Error states, warnings
- **Accent**: Various shades for depth and hierarchy

### Step-by-Step Usage Guide

#### Step 1: Create Your Identity
1. Click the **Identity** tab (fingerprint icon) in the header
2. Enter a unique handle/username (e.g., "alice", "bob", "validator3")
3. Click **"Generate Key Pair & Authenticate"**
4. Wait for key generation confirmation
5. Your identity badge will appear in the header showing your status

#### Step 2: Discover Peers
1. Navigate to the **Nodes** tab (network icon)
2. Click **"DISCOVER NEW PEERS"** to refresh the peer list
3. Available peers will appear as cards showing:
   - Peer handle (e.g., BERZAS)
   - Connection status (Online/Idle/Offline)
   - Latency and uptime metrics
   - Protocol version
   - "SECURE LINK" button for online peers

#### Step 3: Establish Secure Connection
1. In the Nodes tab, find an online peer
2. Click the **"SECURE LINK"** button on their card
3. The system will:
   - Request connection through the server
   - Perform ECDH key exchange
   - Establish AES session keys
   - Switch to the Session tab automatically

#### Step 4: Secure Messaging
1. Once connected, you'll be in the **Session** tab
2. The chat interface shows:
   - Connection verification banner
   - Message history area
   - Cipher stream ticker (bottom)
   - Message input field
3. To send a message:
   - Type your message in the input field
   - Press Enter or click the **"Inject Payload"** button (paper plane icon)
   - Message is encrypted and sent via P2P connection
   - Received messages appear decrypted in the chat window
4. Each message displays:
   - Timestamp
   - Sender identity
   - Cryptographic signature (SIG:)
   - Verification status (✓ verified)

#### Step 5: Managing Encrypted Payloads (Vault)
1. Navigate to the **Vault** tab (wallet icon)
2. View stored encrypted payloads with:
   - Unique ID/hash
   - Status (SEALED/EXPIRED)
   - Timestamp
   - Action buttons (lock/unlock/delete)
3. To add a test payload:
   - Click **"NEW PAYLOAD"** button
   - A new encrypted entry will appear

#### Step 6: Advanced Features
- **Global Self-Destruct Timer** (Vault tab): 
  - Shows countdown to automatic system reset
  - Can be aborted or extended
- **Key Rotation** (Vault tab):
  - View current public key hash
  - Force new key generation
  - Verify forward secrecy status
- **Network Radar** (Nodes tab):
  - Visual representation of peer connections
  - Animated sweep showing active scanning
  - Real-time peer blips indicating activity

### Interface Elements Explained

#### Glassmorphism Effects
- **Glass Panel**: Semi-transparent blurred backgrounds (`background: rgba(255,255,255,0.04)`)
- **Active Glass Panel**: Enhanced blur and glow for active elements
- **Backdrop Filter**: Creates iOS/macOS-like frosted glass effect

#### Animations & Visual Feedback
- **Pulse Animations**: Indicate active connections/scanning
- **Rotating Scanners**: 3D terminal identity verification
- **Radar Sweep**: Circular scan animation showing network activity
- **Cipher Stream**: Continuous hexadecimal data stream at bottom
- **Button Pulses**: Interactive feedback on clickable elements
- **Micro-interactions**: Subtle scaling, color shifts on hover

#### Security Indicators
- **Shield Lock**: Connection encryption status
- **Verified Checkmark**: Message integrity verified
- **Done All**: Message sent and acknowledged
- **Pulsing Dots**: Active connections/processes
- **Color Coding**: Green = secure/active, Red = error/expired, Grey = inactive

---

## Command Line Interface (CLI) Guide

### Starting a Client
```bash
python encrypio/client.py <username>
```

#### Examples:
```bash
# Start Alice's client
python encrypio/client.py alice

# Start Bob's client
python encrypio/client.py bob
```

### Client Workflow (Text-Based)
Once two clients are running:

1. **In Alice's terminal**:
   ```
   Enter peer UID to connect: bob
   Waiting for connection...
   Connection established with bob!
   ```

2. **In Bob's terminal**:
   ```
   Incoming connection request from alice
   Accept? (y/n): y
   Connection established with alice!
   ```

3. **Secure Messaging**:
   - Type messages in either terminal
   - Press Enter to send encrypted message
   - Messages appear decrypted in both terminals
   - Each message shows encryption metadata

### CLI Commands & Options
```
Usage: python encrypio/client.py [username] [options]

Options:
  --help          Show this help message
  --test          Run self-test and exit
  --verbose       Enable verbose logging
  --host HOST     Server hostname (default: localhost)
  --port PORT     Server port (default: 5000)
```

### Example Session
```
$ python encrypio/client.py alice
[CLIENT] Starting encryp.io client for user: alice
[CLIENT] Loading credentials from ssl/client.crt and ssl/client.key
[CONNECT] Connecting to ws://localhost:5000/ws/chat
[CONNECT] WebSocket connected
[IDENTITY] Generated SECP384R1 keypair
[IDENTITY] Registered with server as: alice
[WAITING] Waiting for peer connection...
Enter peer UID to connect: bob
[REQUEST] Connection request sent to bob
[WAITING] Waiting for bob to accept...

[In Bob's terminal]
[REQUEST] Incoming connection request from alice
[REQUEST] Accept connection from alice? (y/n): y
[CONNECTION] Secure channel established with alice
[SESSION] ECDH key exchange completed
[SESSION] AES-256-GCM session keys established
[READY] Secure messaging active

[In either terminal]
> Hello Bob! This is an encrypted message.
[ENCRYPTED] Message sent: 0x1A 0x3F 0x8C... (32 bytes)
[DECRYPTED] bob: Hello Bob! This is an encrypted message.
> How are you today?
[ENCRYPTED] Message sent: 0x9F 0xA2 0x4B... (32 bytes)
[DECRYPTED] alice: How are you today?
```

### Security Verification in CLI
Each message shows:
```
[ENCRYPTED] Message sent: 0x<hex_bytes>... (<length> bytes)
[DECRYPTED] <sender>: <message_content>
```

Optional verbose mode shows cryptographic details:
```
[CRYPTO] IV: 0xa1b2c3d4e5f6...
[CRYPTO] Cipher: AES-256-GCM
[CRYPTO] Tag: 0x9z8y7x...
[CRYPTO] Plaintext length: 23 bytes
```

---

## Security Features

### Cryptographic Primitives
| Component | Algorithm | Key Size | Purpose |
|-----------|-----------|----------|---------|
| **Key Exchange** | ECDH (Elliptic Curve Diffie-Hellman) | SECP384R1 (384-bit) | Secure key agreement |
| **Symmetric Encryption** | AES-256-GCM | 256-bit | Message confidentiality & integrity |
| **Key Derivation** | HKDF-SHA256 | 256-bit | Session key generation |
| **Message Authentication** | HMAC-SHA256 | 256-bit | Integrity verification |
| **Digital Signatures** | ECDSA | SECP384R1 | Identity verification |
| **Random Generation** | CSPRNG | - | Nonces, IVs, session salts |

### Security Properties
1. **Forward Secrecy**: 
   - Each message uses a unique ephemeral key
   - Compromise of long-term keys doesn't affect past sessions
   - Achieved via ECDH with fresh key pairs per session

2. **End-to-End Encryption**:
   - Only communicating users can decrypt messages
   - Server acts as relay only (cannot read message content)
   - Encryption/decryption happens exclusively on client devices

3. **Message Authentication**:
   - HMAC-SHA256 prevents tampering
   - Any modification detected and message rejected
   - Provides data integrity and origin authentication

4. **Replay Attack Protection**:
   - Unique IV per message
   - Timestamp validation in protocol
   - Session-bound nonces

5. **Perfect Forward Secrecy (PFS)**:
   - Session keys not derived from long-term keys
   - Compromise of session key doesn't reveal past/future keys
   - Achieved via ephemeral ECDH exchanges

6. **Zero Knowledge Storage**:
   - Messages never persisted to disk
   - Encrypted only in RAM during transmission
   - Immediately garbage collected after display

### Threat Model & Mitigations
| Threat | Mitigation |
|--------|------------|
| **Eavesdropping** | AES-256-GCM encryption on all P2P channels |
| **Man-in-the-Middle** | Certificate pinning + ECDH authentication |
| **Message Tampering** | HMAC-SHA256 integrity checks |
| **Key Compromise** | Forward secrecy via ephemeral keys |
| **Traffic Analysis** | Constant-size message padding (in production) |
| **Side-Channel Attacks** | Constant-time cryptographic operations |
| **Replay Attacks** | Nonce-based message uniqueness |
| **Weak Randomness** | CSPRNG for all cryptographic operations |

### Cryptographic Implementation Details
#### Key Exchange Process
1. Each client generates ephemeral ECDH key pair (SECP384R1)
2. Public keys exchanged via server (authenticated channel)
3. Shared secret computed: `secret = ECDH(private_A, public_B)`
4. Session keys derived via HKDF-SHA256:
   - `enc_key = HKDF(secret, "encryption", 32)`
   - `mac_key = HKDF(secret, "authentication", 32)`
   - `iv_seed = HKDF(secret, "iv", 12)`

#### Message Encryption
```
For each message:
1. Generate random 96-bit IV
2. Encrypt: ciphertext = AES-GCM-Encrypt(enc_key, iv, plaintext, "")
3. Generate tag: auth_tag = HMAC-SHA256(mac_key, iv || ciphertext)
4. Transmit: iv || ciphertext || auth_tag
```

#### Message Decryption
```
On receipt:
1. Split: iv (12B), ciphertext (nB), auth_tag (32B)
2. Verify: if HMAC-SHA256(mac_key, iv || ciphertext) != auth_tag: reject
3. Decrypt: plaintext = AES-GCM-Decrypt(enc_key, iv, ciphertext, "")
4. Output: plaintext
```

---
## Security Analysis & Attack Resistance

### Comprehensive Threat Assessment

CIPHERLINK has been designed and tested against a wide range of attack vectors. Below is an analysis of common cryptographic and network attacks, along with our specific countermeasures:

#### 1. Man-in-the-Middle (MitM) Attacks
**Attack Scenario**: Attacker intercepts and potentially alters communication between two parties by positioning themselves in the communication path.

**Our Defense**:
- **Mutual TLS Authentication**: Both client and server authenticate using client certificates during WebSocket handshake
- **Certificate Pinning**: Clients verify server certificate fingerprint against known good value
- **ECDH with Authentication**: Key exchange uses authenticated ephemeral keys; any modification detected during key confirmation
- **Session Binding**: All subsequent P2P communication is bound to the authenticated session

*Attack Demonstration*: 
```
Attacker Attempt: 
1. Intercepts Client A → Server connection
2. Presents fake certificate to Client A
3. Forwards legitimate server certificate to Server
4. Attempts to relay and modify messages

Defense Outcome:
- Client A detects certificate mismatch during TLS handshake
- Connection terminated with "certificate_verify_failed" alert
- Attack fails at transport layer before any application data exchange
```

#### 2. Eavesdropping (Passive Monitoring)
**Attack Scenario**: Attacker passively captures network traffic attempting to decrypt message content.

**Our Defense**:
- **AES-256-GCM Encryption**: All P2P messages encrypted with 256-bit keys
- **Perfect Forward Secrecy**: Session keys derived from ephemeral ECDH exchanges
- **Unique IVs**: Each message uses a random 96-bit initialization vector
- **No Plaintext Transmission**: Only ciphertext ever leaves client devices

*Attack Demonstration*:
```
Attacker Attempt:
1. Captures encrypted WebSocket signaling traffic (server-client)
2. Captures encrypted P2P message traffic (client-client)
3. Attempts brute-force or cryptanalytic decryption

Defense Outcome:
- Signaling traffic: Protected by TLS 1.3 (AES-256-GCM) - computationally infeasible to break
- P2P traffic: AES-256-GCM with unique keys per message - requires 2^256 operations to brute-force
- Even with quantum computer (Grover's algorithm): reduces to 2^128 operations - still infeasible
- Forward secrecy ensures past sessions remain secure even if long-term keys compromised
```

#### 3. Message Tampering & Injection
**Attack Scenario**: Attacker modifies encrypted messages in transit or injects false messages.

**Our Defense**:
- **HMAC-SHA256 Authentication**: Each message includes authentication tag
- **AEAD Construction**: AES-GCM provides both confidentiality and integrity
- **Strict Validation**: Any tampering results in decryption failure and message rejection
- **Replay Protection**: Nonce-based mechanisms prevent message replay

*Attack Demonstration*:
```
Attacker Attempt:
1. Captures legitimate encrypted message: IV || Ciphertext || Tag
2. Modifies ciphertext block (bit-flipping attack)
3. Recalculates or predicts new authentication tag
4. Forwards modified message to recipient

Defense Outcome:
- Recipient computes HMAC-SHA256(mac_key, IV || Modified_Ciphertext)
- Result ≠ received Tag due to authentication property
- Message rejected as "authentication_failed"
- Connection may be terminated after repeated failures
```

#### 4. Key Compromise Attacks
**Attack Scenario**: Attacker obtains long-term private keys or session keys.

**Our Defense**:
- **Forward Secrecy**: Session keys not derived from long-term keys
- **Ephemereal Key Exchange**: New key pair generated for each session
- **Key Zeroization**: Private keys wiped from memory after use
- **Limited Key Exposure**: Even if session key compromised, only affects single session

*Attack Demonstration*:
```
Attacker Attempt:
1. Extracts long-term private key from client memory (via malware, etc.)
2. Attempts to decrypt past recorded sessions

Defense Outcome:
- Long-term keys used only for authentication, not encryption
- Session keys derived from ephemeral ECDH exchange
- Without ephemeral private keys (discarded after session), cannot compute shared secret
- Past sessions remain secure despite long-term key compromise
```

#### 5. Side-Channel Attacks
**Attack Scenario**: Attacker gains information from physical implementation (timing, power consumption, electromagnetic leaks).

**Our Defense**:
- **Constant-Time Operations**: All cryptographic operations use constant-time algorithms
- **Memory Protection**: Sensitive data zeroized immediately after use
- **Blinding Techniques**: Where applicable, use cryptographic blinding
- **Library Selection**: Uses well-vetted `cryptography` library with side-channel resistance

#### 6. Replay Attacks
**Attack Scenario**: Attacker records valid message and replays it later to produce unauthorized effect.

**Our Defense**:
- **Unique Nonces**: Each message includes random IV (96 bits) ensuring uniqueness
- **Session Binding**: Messages tied to specific session via key derivation
- **Timestamp Validation**: Optional timestamp checks in protocol extensions
- **Message History**: Recipients track received nonces within session window

*Attack Demonstration*:
```
Attacker Attempt:
1. Records legitimate message: "Transfer 100 tokens"
2. Later replays same encrypted message multiple times

Defense Outcome:
- First message accepted and processed
- Subsequent replays detected via duplicate IV/nonce check
- Rejected as "replay_detected" or processed as duplicate (idempotent)
- No unauthorized state change occurs
```

#### 7. Denial of Service (DoS) Attacks
**Attack Scenario**: Attacker attempts to disrupt service availability.

**Our Defense**:
- **Rate Limiting**: Connection attempts limited per IP address
- **Puzzle Defenses**: Optional proof-of-work for connection initiation
- **Resource Limits**: Per-connection memory and CPU limits
- **Graceful Degradation**: System continues operating under partial load

### Security Verification & Testing

#### Automated Security Testing
The system includes built-in self-tests that validate:
- Key generation correctness
- ECDH key exchange consistency  
- Encryption/decryption round-trip integrity
- Authentication tag verification
- Forward secrecy properties

Run security self-tests with:
```bash
python encrypio/web_server.py --test
# Tests both server initialization and cryptographic modules
```

#### Manual Verification Steps
Users can manually verify security properties:

1. **Encryption Verification**:
   - Observe cipher stream in Session tab footer
   - Confirm messages appear as random hexadecimal during transmission
   - Verify decrypted content matches original plaintext

2. **Key Exchange Verification**:
   - Check Identity tab for key generation timestamps
   - Verify new keys generated for each session
   - Confirm public key exchange occurs via server mediation

3. **Forward Secrecy Check**:
   - Establish session and exchange messages
   - Terminate session and establish new one with same peer
   - Verify that session keys differ between sessions
   - Confirm past messages cannot be decrypted with new keys

### Quantum Resistance Considerations

While SECP384R1 provides 192-bit security against quantum attacks (via Grover's algorithm), we acknowledge that:
- **Short-Term Security**: Secure against near-term quantum threats
- **Long-Term Planning**: Designed for crypto-agility to upgrade to post-quantum algorithms
- **Current Recommendation**: For data requiring decades of security, consider hybrid approaches combining ECDH with post-quantum key encapsulation

### Best Practices for Maximum Security

1. **Keep Software Updated**: Regularly check for security patches
2. **Verify Authenticity**: Only download from official repository
3. **Use Strong Entropy**: Ensure system has adequate random number generation
4. **Validate Certificates**: Heed certificate warnings - never bypass them
5. **Monitor Connections**: Regularly check Nodes tab for unexpected peers
6. **Session Hygiene**: Terminate sessions when not in use
7. **Environment Security**: Use updated OS and antivirus protection
8. **Network Awareness**: Consider using VPN for metadata protection on untrusted networks

### Conclusion

Through layered defense-in-depth, cryptographic best practices, and rigorous threat modeling, CIPHERLINK provides robust security against both passive and active attacks. The combination of strong encryption (AES-256-GCM), secure key exchange (ECDH-SECP384R1), forward secrecy, and message authentication ensures that communications remain confidential and tamper-proof under realistic threat models.

The system has been designed with the understanding that security is an ongoing process, not a one-time feature. Continuous testing, peer review, and adaptation to emerging threats are essential components of our security approach.
---

## Troubleshooting

### Common Issues & Solutions

#### 1. Connection Refused / Cannot Connect to Server
**Symptoms**: 
- Browser shows "Unable to connect"
- Client shows "Connection refused" or "Timeout"
- WebSocket fails to establish

**Solutions**:
- Ensure web server is running: `ps aux | grep web_server.py`
- Check port availability: `netstat -ano | findstr :5000`
- Verify no firewall blocking port 5000
- Try accessing `http://localhost:5000` directly in browser
- Restart server: `python encrypio/web_server.py`

#### 2. WebSocket Connection Errors
**Symptoms**:
- Console shows "WebSocket connection failed"
- Messages don't send/receive in chat
- "WebSocket disconnected, retrying in 3s..." loop

**Solutions**:
- Check browser console for WebSocket errors (F12 → Console)
- Ensure you're accessing via `http://` not `file://`
- Verify server is running and accessible
- Try hard refresh (Ctrl+F5) to clear cached JS
- Disable browser extensions that might interfere with WebSockets

#### 3. Message Sending Failures
**Symptoms**:
- Messages appear to send but never show up in chat
- "Sending..." indicator persists
- Console shows encryption/decryption errors

**Solutions**:
- Verify both clients are connected (check peer status in Nodes tab)
- Ensure symmetric keys were properly exchanged
- Check system clock synchronization (timing-sensitive crypto)
- Try restarting both clients and re-establishing connection
- Check console for specific crypto errors (padding, tag mismatch)

#### 4. Identity Generation Issues
**Symptoms**:
- "Failed to generate key pair" error
- Certificate loading failures
- Permission denied on key files

**Solutions**:
- Ensure write permissions in `keys/` directory
- Verify OpenSSL libraries are available
- Check disk space (key generation requires entropy)
- Try running as administrator/with proper privileges
- Delete corrupt key files and regenerate

#### 5. Performance Issues
**Symptoms**:
- Laggy UI or delayed message delivery
- High CPU usage during encryption
- Choppy animations

**Solutions**:
- Close unnecessary browser tabs/applications
- Ensure hardware acceleration is enabled in browser
- Reduce browser extensions that inject scripts
- On older devices, consider using CLI version instead
- Check for JavaScript errors in console

### Diagnostic Commands
```bash
# Check if server is listening
netstat -ano | findstr :5000

# Test WebSocket connection manually
# (Requires wscat: npm install -g wscat)
wscat -c ws://localhost:5000/ws/chat

# Check Python processes
tasklist | findstr python
# or
ps aux | grep python

# Verify certificate validity
openssl x509 -in ssl/server.crt -text -noout
openssl rsa -in ssl/server.key -check

# Test entropy availability (Windows)
# Ensure adequate system entropy for crypto operations
```

### When All Else Fails
1. **Check Logs**: Look for error messages in console/terminal
2. **Reset State**: 
   - Delete `keys/` folder contents to force new key generation
   - Clear browser cache and local storage
   - Restart all processes
3. **Version Check**: Ensure you're using Python 3.14+
4. **Dependencies**: Reinstall packages: `pip install -r requirements.txt --force-reinstall`
5. **Minimal Test**: Try the built-in test: `python encrypio/web_server.py --test`

---

## Technical Specifications

### Network Specifications
- **Signaling Protocol**: WebSocket over TLS (wss://)
- **Default Port**: 5000 (HTTP) / 5000 (WebSocket)
- **Message Format**: JSON over WebSocket
- **Maximum Message Size**: 16KB (configurable)
- **Keepalive**: 25-second ping/pong intervals
- **Reconnection**: Automatic with exponential backoff

### Message Format (WebSocket)
```json
{
  "type": "message",
  "sender": "alice",
  "recipient": "bob",
  "text": "Encrypted message content",
  "sig": "0x1a2b3c...",
  "iv": "hexadecimal_initialization_vector",
  "cipher_hex": "hexadecimal_encrypted_data"
}
```

### Cryptographic Parameters
- **Elliptic Curve**: SECP384R1 (NIST P-384)
  - Field size: 384 bits
  - Security level: 192-bit (equivalent to 3072-bit RSA)
  - Cofactor: 1
- **Symmetric Cipher**: AES-256 in GCM mode
  - Block size: 128 bits
  - Key size: 256 bits
  - IV/Nonce: 96 bits (recommended for GCM)
  - Authentication tag: 128 bits
- **Hash Function**: SHA-256 (for HKDF and HMAC)
- **Key Derivation**: HKDF (HMAC-based Key Derivation Function)
  - Hash: SHA-256
  - Salt: None (uses IKM as salt)
  - Info: Context-specific strings

### Performance Benchmarks
| Operation | Approximate Time (Modern CPU) |
|-----------|-------------------------------|
| ECDH Key Exchange | 0.5-2 ms |
| AES-256-GCM Encrypt (1KB) | 0.05-0.2 ms |
| HMAC-SHA256 (1KB) | 0.02-0.1 ms |
| Full Message Encrypt/Decrypt | 0.1-0.5 ms |
| Key Generation (SECP384R1) | 50-200 ms |

### Storage Requirements
- **Executable**: ~15 MB (Python + dependencies)
- **Runtime Memory**: 50-150 MB (depends on connections)
- **Disk Storage**: 
  - Keys: ~1 KB per key pair
  - Temporary: < 1 MB (in-memory only)
  - Logs: Configurable (disabled by default in production)

### Compatibility
- **Operating Systems**: Windows 10/11, Linux (Ubuntu 20.04+, CentOS 8+), macOS 10.15+
- **Browsers**: Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+
- **Python**: 3.8+ (tested on 3.14)
- **Network**: TCP/IP, works over NAT with UPnP/port forwarding optional

---

## Design System Documentation

### Design Philosophy
CIPHERLINK follows a **cyberpunk-inspired neo-brutalist** aesthetic with:
- **Glassmorphism**: Frosted glass effects for depth and modernity
- **Dark First**: Optimized for low-light environments (security operations)
- **Data Density**: Maximum information with minimal clutter
- **Motion Feedback**: Animations that convey system state
- **Terminal Aesthetic**: Monospace elements for technical authenticity
- **Quantum Visuals**: Patterns inspired by quantum probability waves

### Color System
All colors defined as CSS variables in `public/index.html`:

#### Primary Palette
```css
--background: #08132a;          /* Main background */
--surface: #151f37;             /* Card/panel backgrounds */
--surface-variant: #2a344d;     /* Elevated surfaces */
--primary: #ebffe2;             /* Primary text/icons */
--primary-fixed: #72ff70;       /* Interactive elements */
--primary-fixed-dim: #00e639;   /* Accents, highlights */
--on-primary: #003907;          /* Text on primary */
```

#### Semantic Colors
```css
--on-surface: #d9e2ff;          /* Primary text */
--on-surface-variant: #abb9d6;  /* Secondary text, hints */
--outline: #84967e;             /* Borders, dividers */
--outline-variant: #3b4b37;     /* Subtle outlines */
--secondary: #b9c7e4;           /* Secondary actions */
--secondary-container: #3c4962; /* Secondary surfaces */
--tertiary: #f9f8ff;            /* Tertiary accents */
--error: #ffb4ab;               /* Error states */
--error-container: #93000a;     /* Error backgrounds */
```

#### State Colors
```css
--surface-tint: #00e639;        /* Active states */
--surface-container-lowest: #030d25; /* Deepest backgrounds */
--surface-container-highest: #2a344d; /* Raised surfaces */
```

### Typography System
#### Font Families
- **Display**: Geist (sans-serif) - Headlines, titles
- **Data/Mono**: JetBrains Mono (monospace) - Codes, hashes, technical data
- **Body**: Geist (sans-serif) - Paragraphs, UI text

#### Type Scale
```css
/* Display Sizes */
display-lg: 48px (56px line-height, -0.02em letter-spacing, 700 weight)
headline-md: 32px (40px line-height, -0.01em letter-spacing, 600 weight)
headline-md-mobile: 24px (32px line-height, 600 weight)

/* Body Sizes */
body-md: 16px (24px line-height, 400 weight)
data-lg: 18px (28px line-height, 0.02em letter-spacing, 500 weight)
data-sm: 12px (16px line-height, 0.05em letter-spacing, 400 weight)
label-caps: 10px (12px line-height, 0.1em letter-spacing, 700 weight)
```

### Spacing System
Based on 4px unit scale:
```css
unit: 4px
margin-sm: 16px (4 units)
margin-md: 32px (8 units)
margin-lg: 48px (12 units)
gutter: 16px (4 units)
container-max: 1440px
```

### Border Radius System
```css
default: 0.125rem (2px)
lg: 0.25rem (4px)
xl: 0.5rem (8px)
full: 0.75rem (12px)
```

### Component Specifications

#### Glass Panel
```css
.glass-panel {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 0.5px solid rgba(255,255,255,0.1);
}

.glass-panel-active {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(0,255,65,0.4);
  box-shadow: 0 0 20px rgba(0,255,65,0.15);
}
```

#### Interactive Elements
- **Buttons**: 
  - Base: `bg-primary-fixed-dim text-on-primary-fixed-variant`
  - Hover: `brightness-110`
  - Active: `scale-95`
  - Disabled: `opacity-50 cursor-not-allowed`
  
- **Pulse Buttons**: Animated ring effect
  ```css
  .pulse-btn::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    background: #00e639;
    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    z-index: -1;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.95); opacity: 0.5; }
    100% { transform: scale(1.15); opacity: 0; }
  }
  ```

#### Animation Systems
1. **Scanner Animation** (Identity tab):
   ```css
   .terminal-scanner-ring {
     transform-style: preserve-3d;
     animation: rotate3d 12s linear infinite;
   }
   @keyframes rotate3d {
     0% { transform: rotateX(60deg) rotateZ(0deg); }
     100% { transform: rotateX(60deg) rotateZ(360deg); }
   }
   ```

2. **Radar Sweep** (Nodes tab):
   ```css
   .radar-sweep {
     background: conic-gradient(
       from 0deg, 
       transparent 70%, 
       rgba(0,230,57,0.35) 100%
     );
     animation: radar-spin 4s linear infinite;
   }
   @keyframes radar-spin {
     from { transform: rotate(0deg); }
     to { transform: rotate(360deg); }
   }
   ```

3. **Cipher Stream Marquee** (Session tab footer):
   ```css
   .cipher-marquee {
     display: flex;
     width: 200%;
     animation: marquee 25s linear infinite;
   }
   @keyframes marquee {
     0% { transform: translateX(0); }
     100% { transform: translateX(-50%); }
   }
   ```

4. **Pulse Indicators** (Active connections):
   ```css
   .pulse-active {
     animation: pulse-dot 2s infinite;
   }
   @keyframes pulse-dot {
     0% { box-shadow: 0 0 0 0 rgba(0,255,65,0.7); }
     70% { box-shadow: 0 0 0 6px rgba(0,255,65,0); }
     100% { box-shadow: 0 0 0 0 rgba(0,255,65,0); }
   }
   ```

### Icon System
Uses **Material Symbols Outlined** font:
- `lan` - Network/nodes
- `account_balance_wallet` - Vault/payloads
- `fingerprint` - Identity/authentication
- `forum` - Session/messaging
- `sensors` - Node status
- `timer` - Self-destruct
- `key` - Encryption/keys
- `lock`/`lock_open` - Security states
- `signal_cellular_alt` - Connection strength
- `done_all`/`verified` - Message status
- `send` - Message sending
- `add`/`delete` - Item management
- `autorenew` - Key rotation
- `router` - Network node
- `close` - Session termination

### Responsive Design Breakpoints
- **Mobile**: < 640px (bottom navigation, stacked layouts)
- **Tablet**: 640px - 1024px (adjusted spacing, modified grids)
- **Desktop**: > 1024px (full sidebar, multi-column layouts)
- **Wide Desktop**: > 1440px (max-width constrained content)

### Accessibility Features
1. **Color Contrast**: All text meets WCAG AA (≥4.5:1) or AAA (≥7:1)
2. **Keyboard Navigation**: Full tab-order support, visible focus states
3. **Screen Reader**: ARIA labels, semantic HTML structure
4. **Reduce Motion**: Prefers-reduced-media query support
5. **Touch Targets**: Minimum 44x44px interactive elements
6. **Focus Management**: Logical tab order, skip links, modal trapping

### Implementation Notes
- **CSS Framework**: Tailwind CSS v3.0+ with custom configuration
- **CSS Variables**: All design tokens exposed via `:root` for theme flexibility
- **Dark Mode**: Automatic via `prefers-color-scheme`, manual toggle via class
- **Performance**: Hardware-accelerated animations, will-change optimizations
- **Browser Support**: Modern browsers with CSS Grid, Flexbox, and CSS Variables

### Design Tokens Export
The design system can be exported as JSON for developer handoff:

```json
{
  "color": {
    "background": "#08132a",
    "primary": "#ebffe2",
    "primary-fixed": "#72ff70",
    "primary-fixed-dim": "#00e639",
    "on-primary": "#003907",
    "surface": "#151f37",
    "on-surface": "#d9e2ff",
    "error": "#ffb4ab",
    "error-container": "#93000a"
  },
  "spacing": {
    "unit": 4,
    "sm": 16,
    "md": 32,
    "lg": 48
  },
  "radius": {
    "none": "0px",
    "sm": "2px",
    "lg": "4px",
    "xl": "8px",
    "full": "12px"
  },
  "typography": {
    "font-families": {
      "display": ["Geist", "sans-serif"],
      "body": ["Geist", "sans-serif"],
      "mono": ["JetBrains Mono", "monospace"]
    },
    "font-sizes": {
      "display-lg": { "size": "48px", "line-height": "56px" },
      "body-md": { "size": "16px", "line-height": "24px" }
    }
  }
}
```

## Appendix

### Glossary of Terms
- **ECDH**: Elliptic Curve Diffie-Hellman - Key exchange algorithm
- **AES-GCM**: Advanced Encryption Standard in Galois/Counter Mode
- **HMAC**: Hash-based Message Authentication Code
- **HKDF**: HMAC-based Key Derivation Function
- **IV**: Initialization Vector (for encryption uniqueness)
- **SECP384R1**: Specific elliptic curve (NIST P-384)
- **PFS**: Perfect Forward Secrecy
- **MITM**: Man-in-the-Middle attack
- **CSPRNG**: Cryptographically Secure Pseudo-Random Number Generator
- **GCM**: Galois/Counter Mode (provides authentication)

### Frequently Asked Questions

**Q: Is CIPHERLINK truly secure against quantum computers?**  
A: The SECP384R1 elliptic curve provides 192-bit security against quantum attacks using Grover's algorithm, which is considered secure for the near future. For long-term post-quantum security, lattice-based algorithms would be needed.

**Q: Can the server read my messages?**  
A: No. Messages are encrypted end-to-end using keys derived from the ECDH exchange. The server only sees encrypted ciphertext and cannot decrypt it without the private keys.

**Q: What happens if I lose my private key?**  
A: You lose access to your identity and any encrypted communications associated with it. There is no key recovery mechanism by design (for security).

**Q: Are messages stored anywhere?**  
A: No. Messages exist only in RAM during transmission and are immediately garbage collected after decryption and display.

**Q: Can I use CIPHERLINK on mobile devices?**  
A: The web interface is responsive and works on mobile browsers. For native experience, you would need to package the web view or develop native clients using the same cryptographic protocols.

**Q: How does forward secrecy work?**  
A: Each session generates a new ephemeral key pair. Even if an attacker records all traffic and later obtains your long-term keys, they cannot derive past session keys without the ephemeral private keys (which are discarded after each session).

**Q: What is the maximum message length?**  
A: The current implementation supports messages up to 16KB. Larger messages should be split or sent as files through separate channels.

**Q: Is my metadata (who I talk to, when) protected?**  
A: No. While message content is encrypted, connection metadata (IP addresses, timestamps, connection frequency) is visible to network observers and the server. For metadata protection, consider using Tor or VPNs in conjunction with CIPHERLINK.

**Q: Can I audit the cryptographic implementation?**  
A: Yes! The cryptographic code is in `encrypio/security.py` and uses the well-vetted `cryptography` library. All crypto operations use constant-time algorithms where possible.

### License
CIPHERLINK is released under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contact & Support
For security concerns, please contact: security@encryp.io  
For general inquiries: support@encryp.io  
GitHub Issues: https://github.com/KaroliShp/encryp.io/issues

---

*This document was generated as part of the CIPHERLINK project. For the most up-to-date version, please refer to the repository documentation.*