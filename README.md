# ⚡ Real-Time Network Traffic Analyzer

A complete, real-time packet sniffer and network dashboard. This tool captures network data directly from your hardware and sends it to a web dashboard for live viewing. It is built to be fast, lightweight, and handle a lot of data without slowing down.

## 🚀 Overview

This project connects low-level network data with modern web tools. It uses a rolling memory buffer and WebSockets to process and show thousands of network packets in real time. It runs smoothly without freezing the screen or using too much computer memory.

## 🛠️ Tech Stack
* **Backend:** Python, FastAPI, Scapy, Uvicorn
* **Frontend:** React, Vite, Tailwind CSS
* **Communication:** Real-time WebSockets (`asyncio`)
* **Networking:** Promiscuous mode sniffing, IPv4/IPv6 parsing

## 🧠 Key Features
* **Live Hardware Tapping:** Uses `Scapy` to read data directly from your active network card (like `en0`).
* **Fast Live Streaming:** Sends live data to the screen 10 times a second for a perfectly smooth experience.
* **Dual-Stack Support:** Reads and filters both IPv4 and IPv6 network traffic at the same time.
* **Smart Memory Use:** Uses a rolling list (`collections.deque`) to keep memory usage low, no matter how long the app runs.

---

## 📂 Project Structure

```text
network-analyzer-dashboard/
├── backend/
│   ├── analyzer/
│   │   └── sniffer.py         # Scapy packet capture and IPv4/IPv6 logic
│   ├── app/
│   │   └── main.py            # FastAPI server & WebSocket endpoints
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useWebSocket.js # Custom hook for live data stream
│   │   ├── App.jsx            # Main React dashboard view
│   │   ├── main.jsx           # React application entry point
│   │   └── index.css          # Global styles
│   ├── package.json           # Node dependencies and build scripts
│   ├── tailwind.config.js     # UI styling configuration
│   └── vite.config.js         # Frontend build tool configuration
├── .gitignore                 # Excludes heavy directories (node_modules, venv)
└── README.md                  # Project documentation

⚙️ How to Run Locally
Prerequisites
Before you start, make sure you have these installed on your computer:

Python 3.10+

Node.js & npm

Root/Administrator access (You need this to let the app read raw network data)




1. Start the Backend Server
Open your terminal, go into the project folder, and run these commands to set up Python and start the API:

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# IMPORTANT: You must use sudo/root privileges 
# so Scapy has permission to listen to your network card.
sudo python -m uvicorn app.main:app --reload






2. Start the Frontend Dashboard
Open a second terminal window, go into the frontend folder, and start the React website:

cd frontend
npm install
npm run dev


🐛 Common Troubleshooting
Dashboard says "SYSTEM LIVE" but shows 0 Packets: Make sure you started the backend server using sudo. Normal user accounts do not have permission to capture raw network data.

Slow Packet Capture: The sniffer is set to listen to en0 by default. If you are using a VPN, iCloud Private Relay, or an Ethernet cable, you might need to change the interface variable inside backend/analyzer/sniffer.py (for example, change it to en1 or utun0).

🔮 Future Roadmap
Add an Isolation Forest Machine Learning model to detect unusual spikes in network traffic.

Add Deep Packet Inspection (DPI) to automatically figure out what kind of protocols are being used.

Add a feature to save .pcap capture files so they can be opened in Wireshark.

















