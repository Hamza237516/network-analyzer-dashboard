import time
from scapy.all import sniff, IP, IPv6, TCP, UDP, ICMP, ICMPv6EchoRequest
from threading import Thread
from collections import deque

packet_buffer = deque(maxlen=1000)

def process_packet(packet):
    # Check for BOTH IPv4 (IP) and IPv6 layers
    if IP in packet or IPv6 in packet:
        protocol = "Other"
        
        # Identify the protocol
        if TCP in packet: protocol = "TCP"
        elif UDP in packet: protocol = "UDP"
        elif ICMP in packet or ICMPv6EchoRequest in packet: protocol = "ICMP"

        # Get IP addresses (handles both formats)
        if IP in packet:
            src = packet[IP].src
            dst = packet[IP].dst
        else:
            src = packet[IPv6].src
            dst = packet[IPv6].dst

        packet_data = {
            "id": int(time.time() * 1000000),
            "timestamp": time.time(),
            "src_ip": src,
            "dst_ip": dst,
            "protocol": protocol,
            "size": len(packet)
        }
        packet_buffer.append(packet_data)

def start_sniffing(interface="en0"):
    print(f"[*] Sniffing IPv4 + IPv6 on {interface}...")
    # Change filter to "ip or ip6" to catch everything!
    sniff(iface=interface, prn=process_packet, store=False, filter="ip or ip6")

def run_sniffer_in_background(interface="en0"):
    sniffer_thread = Thread(target=start_sniffing, args=(interface,), daemon=True)
    sniffer_thread.start()
    return sniffer_thread