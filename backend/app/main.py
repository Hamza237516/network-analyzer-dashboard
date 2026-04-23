import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import the sniffer function and the live data buffer from Phase 2
from analyzer.sniffer import run_sniffer_in_background, packet_buffer

# This "lifespan" function runs exactly once when the server starts.
# It's the perfect place to boot up our background network sniffer.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[*] Starting API Server...")
    # We pass "en0" here because that is your active Wi-Fi door
    run_sniffer_in_background(interface="en0") 
    yield
    print("[*] Shutting down API Server...")

app = FastAPI(lifespan=lifespan)

# Enable CORS (Cross-Origin Resource Sharing)
# This is required so our React dev server (port 5173) is allowed to talk to FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Network Analyzer API is actively running."}

@app.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[*] Frontend dashboard connected!")
    
    # We keep track of the last packet ID we sent so we don't 
    # send the same data over and over if nothing is happening.
    last_sent_id = None
    
    try:
        while True:
            if packet_buffer:
                latest_packet = packet_buffer[-1]
                
                # Only send an update if the buffer has changed
                if latest_packet['id'] != last_sent_id:
                    current_packets = list(packet_buffer)
                    await websocket.send_json({"packets": current_packets})
                    last_sent_id = latest_packet['id']
            
            # --- THE KEY CHANGE ---
            # 0.1 means the dashboard updates 10 times every second.
            # This makes the charts look smooth and "live."
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        print("[*] Frontend dashboard disconnected.")