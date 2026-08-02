// encryp.io Application JS Client

let currentTab = 'nodes';
let currentUid = 'klevas';
let currentPeerUid = 'berzas';
let socket = null;
let selfDestructSeconds = 47 * 3600 + 12 * 60 + 59;
let selfDestructTimer = null;

// Initial state for Vault Payloads
let vaultPayloads = [
    { id: 'PAY-098x::a1b2c3d4...', status: 'SEALED', timestamp: '2026.08.02 14:02Z', color: 'primary-fixed-dim' },
    { id: 'P2P-SESS::e5f6g7h8...', status: 'EXPIRED', timestamp: '2026.08.01 09:15Z', color: 'error' },
    { id: 'DOC-SEC::i9j0k1l2...', status: 'SEALED', timestamp: '2026.07.30 18:45Z', color: 'primary-fixed-dim' }
];

// Initial Peers Data
let peerNodes = [
    { uid: 'berzas', ip: '127.0.0.1:5002', latency: '12ms', uptime: '99.99%', protocol: 'v2.4.1-alpha', status: 'online', hash: '0x8F2D...9A1B' },
    { uid: 'klevas', ip: '127.0.0.1:5001', latency: '18ms', uptime: '99.95%', protocol: 'v2.4.1-alpha', status: 'online', hash: '0x3B8D...F92A' },
    { uid: 'azuolas', ip: '192.168.1.104', latency: '45ms', uptime: '98.50%', protocol: 'v2.3.9-stable', status: 'idle', hash: '0xCC41...3F72' },
    { uid: 'egle', ip: '10.0.0.52', latency: '120ms', uptime: '94.20%', protocol: 'v2.4.0-rc1', status: 'offline', hash: '0x1A9B...E44C' }
];

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
    startEntropyAnimations();
    startSelfDestructCountdown();
    renderPeersGrid();
    renderVaultPayloads();
    startHexStreamTicker();
    
    // Connect WebSocket if identity exists
    initWebSocket();
});

// Navigation Controller
function navTo(tabName) {
    currentTab = tabName;

    // Hide all screens
    document.querySelectorAll('.tab-screen').forEach(el => el.classList.add('hidden'));

    // Show targeted screen
    const targetScreen = document.getElementById(`screen-${tabName}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }

    // Update Nav buttons styling
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('text-primary-fixed-dim', 'bg-white/10', 'border-primary-fixed-dim/30');
        btn.classList.add('text-on-surface-variant', 'opacity-80');
    });

    const activeBtn = document.getElementById(`nav-btn-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('text-primary-fixed-dim', 'bg-white/10', 'border-primary-fixed-dim/30');
        activeBtn.classList.remove('text-on-surface-variant', 'opacity-80');
    }
}

// -------------------------------------------------------------
// 1. Identity & Key Pair Generation Logic
// -------------------------------------------------------------
async function initializeIdentity() {
    const inputUid = document.getElementById('identity-uid-input').value.trim();
    if (!inputUid) {
        alert('Please enter a valid handle / UID!');
        return;
    }

    try {
        const response = await fetch('/api/identity/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: inputUid })
        });

        const data = await response.json();
        if (data.status === 'success') {
            currentUid = inputUid;
            document.getElementById('active-uid-display').innerText = currentUid;
            document.getElementById('active-user-badge').classList.remove('hidden');
            document.getElementById('active-user-badge').classList.add('flex');
            
            // Update Active Key Hash
            if (data.public_key_hex) {
                document.getElementById('active-key-hash').innerText = `0x${data.public_key_hex.substring(0, 32)}...`;
            }

            alert(`✅ Identity initialized for '${currentUid}'! SECP384R1 Keypair generated & registered with server database.`);
            navTo('nodes');
        } else {
            alert('Error generating identity: ' + data.message);
        }
    } catch (err) {
        console.warn('API fallback for identity generation');
        currentUid = inputUid;
        document.getElementById('active-uid-display').innerText = currentUid;
        document.getElementById('active-user-badge').classList.remove('hidden');
        document.getElementById('active-user-badge').classList.add('flex');
        navTo('nodes');
    }
}

function startEntropyAnimations() {
    setInterval(() => {
        const updateBar = (id) => {
            const bar = document.getElementById(`${id}-bar`);
            const val = document.getElementById(`${id}-val`);
            if (!bar || !val) return;
            let currentW = parseInt(bar.style.width || '85');
            let newW = Math.max(20, Math.min(100, currentW + Math.floor(Math.random() * 9 - 4)));
            bar.style.width = `${newW}%`;
            val.innerText = `${newW}%`;
        };
        updateBar('stat-1');
        updateBar('stat-2');
        updateBar('stat-3');
    }, 900);
}

// -------------------------------------------------------------
// 2. Network Nodes & Peer Link Logic
// -------------------------------------------------------------
function renderPeersGrid() {
    const container = document.getElementById('peers-grid');
    if (!container) return;
    container.innerHTML = '';

    const onlinePeers = peerNodes.filter(p => p.uid !== currentUid);
    document.getElementById('active-peer-count').innerText = `${onlinePeers.length} CONNECTED PEERS`;

    onlinePeers.forEach(peer => {
        const isOnline = peer.status === 'online';
        const cardHtml = `
            <div class="${isOnline ? 'glass-panel-active' : 'glass-panel'} rounded-xl p-margin-sm flex flex-col group relative overflow-hidden transition-all hover:border-primary-fixed-dim/40">
                <div class="flex justify-between items-start mb-margin-sm relative z-10">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-primary-fixed-dim shadow-[0_0_8px_rgba(0,255,65,0.8)] animate-pulse' : 'bg-on-surface-variant/40'}"></span>
                        <span class="font-data-lg text-data-lg text-on-surface ${isOnline ? 'glow-text' : ''}">${peer.uid.toUpperCase()} (${peer.hash})</span>
                    </div>
                    <span class="material-symbols-outlined ${isOnline ? 'text-primary-fixed-dim' : 'text-on-surface-variant/50'}">signal_cellular_alt</span>
                </div>
                <div class="grid grid-cols-2 gap-unit mb-margin-sm border-t border-white/5 pt-margin-sm relative z-10 font-data-sm text-data-sm">
                    <div>
                        <p class="font-label-caps text-label-caps text-on-surface-variant opacity-60">LATENCY</p>
                        <p class="text-on-surface">${peer.latency}</p>
                    </div>
                    <div>
                        <p class="font-label-caps text-label-caps text-on-surface-variant opacity-60">UPTIME</p>
                        <p class="text-on-surface">${peer.uptime}</p>
                    </div>
                    <div class="col-span-2 mt-unit">
                        <p class="font-label-caps text-label-caps text-on-surface-variant opacity-60">PROTOCOL & IP</p>
                        <p class="text-on-surface">${peer.protocol} // ${peer.ip}</p>
                    </div>
                </div>
                <button onclick="initiateSession('${peer.uid}')" class="mt-auto w-full py-2.5 px-4 rounded border border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim font-label-caps text-label-caps hover:bg-primary-fixed-dim hover:text-background transition-all duration-300 shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] flex justify-center items-center gap-2 relative z-10">
                    <span class="material-symbols-outlined text-[16px]">lock</span> SECURE LINK
                </button>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

function refreshNodes() {
    renderPeersGrid();
    alert('⚡ Radar sweep completed! Active network nodes updated.');
}

// -------------------------------------------------------------
// 3. Cryptographic Vault Logic
// -------------------------------------------------------------
function renderVaultPayloads() {
    const container = document.getElementById('payloads-container');
    if (!container) return;
    container.innerHTML = '';

    vaultPayloads.forEach((item, idx) => {
        const isSealed = item.status === 'SEALED';
        const row = `
            <div class="grid grid-cols-12 gap-2 items-center py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group px-2 rounded">
                <div class="col-span-4 font-data-sm text-data-sm text-on-surface truncate pr-2 group-hover:text-primary-fixed-dim transition-colors font-mono">
                    ${item.id}
                </div>
                <div class="col-span-3 flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full ${isSealed ? 'bg-primary-fixed-dim pulse-active' : 'bg-error'}"></div>
                    <span class="font-label-caps text-label-caps ${isSealed ? 'text-primary-fixed-dim' : 'text-error'}">${item.status}</span>
                </div>
                <div class="col-span-3 font-data-sm text-data-sm text-on-surface-variant">
                    ${item.timestamp}
                </div>
                <div class="col-span-2 text-right">
                    <button onclick="deletePayload(${idx})" class="material-symbols-outlined text-on-surface-variant group-hover:text-error transition-colors text-[18px]">
                        ${isSealed ? 'lock_open' : 'delete'}
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += row;
    });
}

function addDummyPayload() {
    const randomHash = Math.random().toString(36).substring(2, 10);
    vaultPayloads.unshift({
        id: `ENC-PAY::${randomHash}...`,
        status: 'SEALED',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + 'Z',
        color: 'primary-fixed-dim'
    });
    renderVaultPayloads();
}

function deletePayload(idx) {
    vaultPayloads.splice(idx, 1);
    renderVaultPayloads();
}

function startSelfDestructCountdown() {
    selfDestructTimer = setInterval(() => {
        if (selfDestructSeconds <= 0) return;
        selfDestructSeconds--;

        const hrs = Math.floor(selfDestructSeconds / 3600);
        const mins = Math.floor((selfDestructSeconds % 3600) / 60);
        const secs = selfDestructSeconds % 60;

        document.getElementById('timer-hours').innerText = hrs.toString().padStart(2, '0');
        document.getElementById('timer-mins').innerText = mins.toString().padStart(2, '0');
        document.getElementById('timer-secs').innerText = secs.toString().padStart(2, '0');

        const percent = (selfDestructSeconds / (48 * 3600)) * 100;
        document.getElementById('timer-progress-bar').style.width = `${Math.max(5, percent)}%`;
    }, 1000);
}

function abortSelfDestruct() {
    clearInterval(selfDestructTimer);
    document.getElementById('self-destruct-status').innerText = 'ABORTED';
    document.getElementById('self-destruct-status').className = 'font-data-sm text-data-sm text-primary-fixed-dim bg-primary-fixed-dim/20 border border-primary-fixed-dim/40 px-3 py-1 rounded-full font-bold';
    alert('🛡️ Global Self-Destruct Sequence ABORTED.');
}

function extendSelfDestruct() {
    selfDestructSeconds += 24 * 3600;
    alert('⏰ Self-destruct sequence extended by 24 hours!');
}

function forceKeyRotation() {
    const newHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    document.getElementById('active-key-hash').innerText = `${newHash.substring(0, 16)}...${newHash.substring(48)}`;
    alert('🔄 Key rotation forced! New SECP384R1 public key generated.');
}

// -------------------------------------------------------------
// 4. Session & Real-Time E2EE Chat Logic
// -------------------------------------------------------------
function initiateSession(peerUid) {
    currentPeerUid = peerUid;
    document.getElementById('session-title').innerText = `Session: ${peerUid.toUpperCase()}`;

    // Enable session button in header
    const sessionBtn = document.getElementById('nav-btn-session');
    if (sessionBtn) sessionBtn.classList.remove('hidden');

    navTo('session');

    // Add initial default messages for conversation
    const stream = document.getElementById('messages-stream');
    stream.innerHTML = `
        <div class="flex justify-center w-full my-2">
            <div class="glass-panel px-4 py-1.5 rounded-full border-white/5">
                <span class="font-data-sm text-data-sm text-on-surface-variant text-center opacity-80">
                    🔒 P2P Session established with ${peerUid.toUpperCase()}. Key exchange verified via SECP384R1 ECDH.
                </span>
            </div>
        </div>
        <div class="flex w-full justify-start pr-12 md:pr-24">
            <div class="glass-panel p-4 rounded-xl rounded-tl-sm border-white/10 relative group">
                <div class="absolute -top-3 -left-2 bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-data-sm text-on-surface-variant border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${new Date().toLocaleTimeString()} UTC
                </div>
                <p class="font-body-md text-body-md text-on-surface m-0">
                    Payload received from ${peerUid.toUpperCase()}. Channel ready for end-to-end encrypted datastream.
                </p>
                <div class="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <span class="font-data-sm text-on-surface-variant opacity-50 font-mono">SIG: 0x9f2a...c41</span>
                    <span class="material-symbols-outlined text-[16px] text-primary-fixed-dim">verified</span>
                </div>
            </div>
        </div>
    `;
}

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket connected to encryp.io server');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
                appendChatMessage(data.sender, data.text, data.sig, data.iv, false);
                updateHexStream(data.cipher_hex);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected, retrying in 3s...');
            setTimeout(initWebSocket, 3000);
        };
    } catch (e) {
        console.warn('WebSocket connection not available, fallback to local simulator');
    }
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const msgText = input.value.trim();
    if (!msgText) return;

    const signature = '0x' + Math.random().toString(36).substring(2, 10) + '...';
    const ivHex = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const cipherHex = Array.from({length: 24}, () => '0x' + Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(' ');

    // Render outgoing message
    appendChatMessage(currentUid, msgText, signature, ivHex, true);
    updateHexStream(cipherHex);

    // Send via WebSocket if available
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            sender: currentUid,
            recipient: currentPeerUid,
            text: msgText
        }));
    } else {
        // Echo automated peer response for simulation
        setTimeout(() => {
            const replySig = '0x' + Math.random().toString(36).substring(2, 10) + '...';
            const replyCipher = Array.from({length: 24}, () => '0x' + Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(' ');
            appendChatMessage(currentPeerUid, `Encrypted response acknowledged: [${msgText.substring(0, 15)}...]`, replySig, ivHex, false);
            updateHexStream(replyCipher);
        }, 1200);
    }

    input.value = '';
}

function appendChatMessage(sender, text, sig, iv, isOutgoing) {
    const stream = document.getElementById('messages-stream');
    if (!stream) return;

    const timeStr = new Date().toLocaleTimeString();

    const msgHtml = isOutgoing ? `
        <div class="flex w-full justify-end pl-12 md:pl-24">
            <div class="glass-panel-active p-4 rounded-xl rounded-tr-sm relative group">
                <div class="absolute -top-3 -right-2 bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-data-sm text-primary-fixed-dim border border-primary-fixed-dim/30">
                    ${timeStr} UTC
                </div>
                <p class="font-body-md text-body-md text-on-surface m-0">${escapeHtml(text)}</p>
                <div class="mt-2 pt-2 border-t border-primary-fixed-dim/20 flex justify-between items-center text-xs">
                    <span class="font-data-sm text-primary-fixed-dim opacity-70 font-mono">SIG: ${sig}</span>
                    <span class="material-symbols-outlined text-[16px] text-primary-fixed-dim">done_all</span>
                </div>
            </div>
        </div>
    ` : `
        <div class="flex w-full justify-start pr-12 md:pr-24">
            <div class="glass-panel p-4 rounded-xl rounded-tl-sm border-white/10 relative group">
                <div class="absolute -top-3 -left-2 bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-data-sm text-on-surface-variant border border-white/5">
                    ${timeStr} UTC
                </div>
                <p class="font-body-md text-body-md text-on-surface m-0">${escapeHtml(text)}</p>
                <div class="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <span class="font-data-sm text-on-surface-variant opacity-50 font-mono">SIG: ${sig}</span>
                    <span class="material-symbols-outlined text-[16px] text-primary-fixed-dim">verified</span>
                </div>
            </div>
        </div>
    `;

    stream.innerHTML += msgHtml;
    stream.scrollTop = stream.scrollHeight;
}

function updateHexStream(cipherHex) {
    const el = document.getElementById('hex-stream-text');
    if (el) {
        el.innerText = cipherHex;
    }
}

function startHexStreamTicker() {
    setInterval(() => {
        const bytes = Array.from({length: 30}, () => '0x' + Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(' ');
        updateHexStream(bytes);
    }, 3000);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
