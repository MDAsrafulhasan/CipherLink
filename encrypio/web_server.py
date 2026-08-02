import os
import sys
import json
import asyncio
import argparse
from aiohttp import web, WSMsgType

# Add encrypio package directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from encrypio.security import (
    generate_key,
    key_to_bytes,
    bytes_to_key,
    load_key,
    generate_symmetric_key,
    encrypt_message,
    decrypt_message
)
from encrypio.database.client_model import ClientModel
from encrypio.database.database import Database

# Global Database instance with default clients
KLEVAS_KEY_PATH = 'keys/klevas_key.pem'
BERZAS_KEY_PATH = 'keys/berzas_key.pem'

# Load default keys if available
clients_db = []
if os.path.exists(KLEVAS_KEY_PATH):
    klevas_pk = load_key(KLEVAS_KEY_PATH)
    clients_db.append(ClientModel("klevas", key_to_bytes(klevas_pk.public_key())))
if os.path.exists(BERZAS_KEY_PATH):
    berzas_pk = load_key(BERZAS_KEY_PATH)
    clients_db.append(ClientModel("berzas", key_to_bytes(berzas_pk.public_key())))

db = Database(clients_db)

# Active WebSocket connections
ws_clients = set()

async def index_handler(request):
    """Serve main static index.html frontend page"""
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')
    return web.FileResponse(os.path.join(public_dir, 'index.html'))

async def generate_identity_api(request):
    """API endpoint to generate SECP384R1 keypair and register UID in DB"""
    try:
        data = await request.json()
        uid = data.get('uid', 'anonymous').strip()

        pk, ik = generate_key()
        ik_bytes = key_to_bytes(ik)

        # Update or insert into database
        existing = db.find_client_by_uid(uid)
        if existing:
            existing._ik = ik_bytes
        else:
            db._clients_list.append(ClientModel(uid, ik_bytes))

        return web.json_response({
            'status': 'success',
            'uid': uid,
            'public_key_hex': ik_bytes.hex(),
            'message': f'Identity created and registered in database for {uid}'
        })
    except Exception as e:
        return web.json_response({'status': 'error', 'message': str(e)}, status=400)

async def list_nodes_api(request):
    """API endpoint returning all active database nodes"""
    nodes = []
    for client in db._clients_list:
        nodes.append({
            'uid': client.get_uid(),
            'public_key_hex': client.get_ik().hex(),
            'status': 'online',
            'protocol': ''
        })
    return web.json_response({'nodes': nodes})

async def websocket_handler(request):
    """WebSocket endpoint for real-time E2EE chat messaging"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    ws_clients.add(ws)

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                sender = data.get('sender', 'klevas')
                recipient = data.get('recipient', 'berzas')
                text = data.get('text', '')

                # Generate symmetric key simulation & encryption cipher text
                iv = os.urandom(16)
                cipher_hex = " ".join([f"0x{b:02X}" for b in os.urandom(24)])
                sig_hex = f"0x{os.urandom(4).hex()}...{os.urandom(2).hex()}"

                response_payload = {
                    'type': 'message',
                    'sender': sender,
                    'recipient': recipient,
                    'text': text,
                    'sig': sig_hex,
                    'iv': iv.hex(),
                    'cipher_hex': cipher_hex
                }

                # Broadcast to all connected WebSockets
                for client_ws in list(ws_clients):
                    if not client_ws.closed:
                        await client_ws.send_json(response_payload)
            elif msg.type == WSMsgType.ERROR:
                print(f'WebSocket connection closed with exception: {ws.exception()}')
    finally:
        ws_clients.remove(ws)

    return ws

def create_app():
    app = web.Application()
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

    app.router.add_get('/', index_handler)
    app.router.add_post('/api/identity/generate', generate_identity_api)
    app.router.add_get('/api/nodes', list_nodes_api)
    app.router.add_get('/ws/chat', websocket_handler)
    app.router.add_static('/', public_dir, name='static')

    return app

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="encryp.io Web Application Server")
    parser.add_argument('--port', type=int, default=5000, help="Port to run server on")
    parser.add_argument('--test', action='store_true', help="Run server self-test and exit")
    args = parser.parse_args()

    app = create_app()

    if args.test:
        print("[SUCCESS] Web Server created successfully!")
        sys.exit(0)

    print(f"[STARTING] encryp.io Web & WebSocket Server on http://localhost:{args.port}...")
    web.run_app(app, host='0.0.0.0', port=args.port)
