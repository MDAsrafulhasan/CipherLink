# encryp.io - Web Interface Guide

Welcome to the web version of **encryp.io**! This interface brings to life the design generated from Stitch Project **`12493271005532992355`** and connects it directly to the `encryp.io` Python cryptographic backend (`security.py`, `database.py`, `messages.py`).

---

## 🚀 How to Run the Web Application

### 1. Install Prerequisites & Dependencies

Ensure you have Python 3.8+ installed. Install the required Python packages (including `cryptography` and `aiohttp` for web & WebSocket support):

```bash
pip install -r requirements.txt
pip install aiohttp
```

---

### 2. Start the Web & WebSocket Server

Run the web server from the project root directory:

```bash
python encrypio/web_server.py
```

*By default, the server runs on port **`5000`**.*

To run on a custom port (for example, port `8080`):

```bash
python encrypio/web_server.py --port 8080
```

---

### 3. Open in Your Browser

Open your browser and navigate to:

👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🌟 Web Application Features

The web frontend includes 4 interactive screens matching the Stitch UI design:

### 1. 📡 Network Hub (`Nodes` Tab)
- **Radar Sweep Visualizer**: Conic gradient radar animation scanning 42 active network regions.
- **Active Peers Grid**: Displays connected peer nodes (`berzas`, `klevas`, `azuolas`, `egle`) with live status indicators, latency metrics, uptime percentages, protocol versions, and public key hashes.
- **Secure Link**: Click **SECURE LINK** on any peer card to immediately open an end-to-end encrypted messaging session.

---

### 2. 🔐 Secure Vault (`Vault` Tab)
- **Encrypted Payloads Table**: View sealed and expired payloads, hashes, timestamps, and lock/delete actions. Click **NEW PAYLOAD** to seal a new cryptographic asset.
- **Global Self-Destruct Sequence**: Armed countdown timer with live progress bar. Use **ABORT SEQUENCE** or **EXTEND TIMER** to control payload lifetime.
- **Key Rotation Visualizer**: 3D spinning canvas animation displaying active SECP384R1 ECDH key hash, rotation schedule, and a **FORCE KEY ROTATION** trigger.

---

### 3. 🖐️ Hex Identity Console (`Identity` Tab)
- **Terminal Scanner**: 3D rotating terminal scanner ring with laser scanning line animation.
- **Entropy Process Stats**: Real-time progress bars and percentage readouts for `SYS_ENV_NOISE`, `HW_THERMAL_JITTER`, and `NETWORK_LATENCY_DELTA`.
- **Keypair Generation**: Input your handle/UID and click **Generate Key Pair & Authenticate** to generate a SECP384R1 keypair and register with the server database.

---

### 4. 💬 Active Encrypted Session (`Session` Tab)
- **E2EE Chat Stream**: Real-time WebSocket encrypted messaging view with UTC timestamps, cryptographic signature badges (`SIG: 0x...`), and delivery checkmarks.
- **Live Cipher Stream Ticker**: Real-time scrolling hex marquee displaying active encrypted AES payload bytes before decryption (`0x4F 0x92 0x11...`).
- **Payload Injection**: Input box with attachment, code snippet, and **Inject Payload** submission.

---

## 🛠️ Architecture Overview

```
[ Web Browser Frontend ]
  │
  ├── HTTP (HTML/CSS/JS)  ──► aiohttp.web Server (port 5000)
  ├── WebSocket /ws/chat ──► Real-Time Broadcast & Message Encryption
  │
[ Python Backend (encrypio) ]
  ├── security.py  ──► ECDH Key Agreement (SECP384R1) & AES-256 Forward Secrecy
  └── database.py  ──► Client Model & Public Key Storage
```
