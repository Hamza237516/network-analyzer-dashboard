import React, { useMemo } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { Activity, Shield, Zap, Database } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

// Professional dashboard colors
const PROTOCOL_COLORS = {
  TCP: '#3b82f6', // blue
  UDP: '#10b981', // green
  ICMP: '#f59e0b', // amber
  Other: '#6b7280' // gray
};

function App() {
  const { packets, isConnected } = useWebSocket('ws://localhost:8000/ws/traffic');

  // Process raw packets into chart-friendly formats
  const { protocolData, timelineData, totalBytes } = useMemo(() => {
    const protocols = { TCP: 0, UDP: 0, ICMP: 0, Other: 0 };
    let bytes = 0;
    
    // Line chart shows the last 50 packets
    const timeline = packets.slice(-50).map((p, index) => ({
      time: index,
      size: p.size
    }));

    packets.forEach(p => {
      if (protocols[p.protocol] !== undefined) {
        protocols[p.protocol]++;
      } else {
        protocols.Other++;
      }
      bytes += p.size;
    });

    const pieData = Object.keys(protocols)
      .map(key => ({ name: key, value: protocols[key] }))
      .filter(d => d.value > 0);

    return { protocolData: pieData, timelineData: timeline, totalBytes: bytes };
  }, [packets]);

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Activity className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight">NetTraffic Analyzer</h1>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center space-x-2 ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isConnected && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
          <span>{isConnected ? 'SYSTEM LIVE' : 'DISCONNECTED'}</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-xl"><Database className="w-6 h-6 text-blue-400" /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Packets Captured</h3>
            <p className="text-3xl font-bold">{packets.length}</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-green-500/20 rounded-xl"><Zap className="w-6 h-6 text-green-400" /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Total Volume</h3>
            <p className="text-3xl font-bold">{(totalBytes / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-xl"><Shield className="w-6 h-6 text-purple-400" /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Active Protocols</h3>
            <p className="text-3xl font-bold">{protocolData.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg lg:col-span-2">
          <h2 className="text-lg font-bold mb-6 text-gray-200">Live Bandwidth (Packet Size)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="size" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-lg font-bold mb-6 text-gray-200">Protocol Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={protocolData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                  {protocolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROTOCOL_COLORS[entry.name] || PROTOCOL_COLORS.Other} />
                  ))}
                </Pie>
                <ChartTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Data Table */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
        <h2 className="text-lg font-bold mb-4 text-gray-200">Latest Captured Packets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Source IP</th>
                <th className="px-6 py-3">Destination IP</th>
                <th className="px-6 py-3">Protocol</th>
                <th className="px-6 py-3">Size (B)</th>
              </tr>
            </thead>
            <tbody>
              {packets.slice(-10).reverse().map((packet) => (
                <tr key={packet.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-400">{new Date(packet.timestamp * 1000).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 font-mono">{packet.src_ip}</td>
                  <td className="px-6 py-4 font-mono">{packet.dst_ip}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      packet.protocol === 'TCP' ? 'bg-blue-500/20 text-blue-400' :
                      packet.protocol === 'UDP' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {packet.protocol}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{packet.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;