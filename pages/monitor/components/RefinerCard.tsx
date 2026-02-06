
import React from 'react';
import { MonitorRefinerState } from '../../../services/monitorMockService';

interface RefinerCardProps {
  data: MonitorRefinerState;
}

export const RefinerCard: React.FC<RefinerCardProps> = ({ data }) => {
  const isRunning = data.status === 'running';
  const statusColor = isRunning ? '#10b981' : '#64748b'; // Green vs Slate
  const pipeColor = isRunning ? '#10b981' : '#334155'; // Active pipe vs Inactive
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group hover:border-blue-300 transition-colors">
      
      {/* 1. Header */}
      <div className="flex justify-between items-center mb-2 z-10">
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-sm ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="font-bold text-gray-800 text-lg">{data.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${isRunning ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          {isRunning ? '运行中' : '停机'}
        </span>
      </div>

      {/* 2. Visual Area (SVG) */}
      <div className="h-32 relative z-0 mb-2">
        <svg className="w-full h-full" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid meet">
           {/* Piping Background */}
           <path d="M10 60 L60 60" stroke={pipeColor} strokeWidth="3" fill="none" strokeDasharray={isRunning ? "0" : "5 2"} />
           <path d="M180 60 L230 60" stroke={pipeColor} strokeWidth="3" fill="none" />
           
           {/* P-In Marker */}
           <g transform="translate(30, 45)">
             <rect x="-16" y="-14" width="32" height="14" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
             <text x="0" y="-4" textAnchor="middle" fontSize="9" fill="#64748b">P-In</text>
             <text x="0" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">{data.pIn}</text>
           </g>

           {/* Refiner Body (Circle) */}
           <circle cx="120" cy="60" r="30" fill="white" stroke={statusColor} strokeWidth="2" />
           {/* Inner Fan Animation */}
           <g transform="translate(120, 60)">
             <circle cx="0" cy="0" r="25" stroke={statusColor} strokeWidth="1" strokeOpacity="0.2" fill="none" />
             <path d="M-25 0 L25 0 M0 -25 L0 25 M-18 -18 L18 18 M-18 18 L18 -18" stroke={statusColor} strokeWidth="1" strokeOpacity="0.3" 
               className={isRunning ? 'origin-center animate-spin-slow' : ''} 
               style={{ animationDuration: '3s' }}
             />
           </g>

           {/* Direction Indicator */}
           <rect x="135" y="80" width="24" height="12" rx="6" fill="#eff6ff" stroke="#bfdbfe" />
           <text x="147" y="89" textAnchor="middle" fontSize="8" fill="#3b82f6" fontWeight="bold">{data.direction}</text>

           {/* P-Out Marker */}
           <g transform="translate(200, 45)">
             <rect x="-16" y="-14" width="32" height="14" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
             <text x="0" y="-4" textAnchor="middle" fontSize="9" fill="#64748b">P-Out</text>
             <text x="0" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">{data.pOut}</text>
           </g>
           
           {/* Connection Lines (Flow) */}
           <path d="M90 60 L60 60" stroke={statusColor} strokeWidth="2" markerEnd="url(#arrow)" />
        </svg>
      </div>

      {/* 3. Core Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3 px-2">
         <div>
           <div className="flex items-end gap-1">
             <span className="text-sm text-gray-500 flex items-center gap-1">⚡ 实时功率</span>
           </div>
           <div className="text-xl font-bold text-gray-900 mt-1">{data.power} <span className="text-xs font-normal text-gray-500">KW</span></div>
           <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {data.flow} L/m
           </div>
         </div>
         <div className="text-right border-l border-gray-100 pl-2">
           <div className="text-xs text-gray-500">压差 (dP)</div>
           <div className="text-lg font-bold text-gray-800">{data.dp} <span className="text-xs font-normal text-gray-400">bar</span></div>
           <div className="text-xs text-orange-500 mt-1 flex justify-end items-center gap-1">
             🌡 {data.temp} °C
           </div>
         </div>
      </div>

      {/* 4. Disc & Gap Info (Bottom Card) */}
      <div className="bg-gray-50 rounded-lg p-2.5 mt-auto">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-blue-500 font-bold bg-blue-100 px-1.5 py-0.5 rounded">当前刀盘</span>
            <span className="text-sm font-bold text-gray-700">{data.discModel}</span>
         </div>
         <div className="flex justify-between text-xs text-gray-500 mb-2 pb-2 border-b border-gray-200 border-dashed">
            <span>📅 上机: {data.installDate}</span>
            <span>🕒 累计: {data.runHours}h</span>
         </div>
         
         {/* Gap Metrics Grid */}
         <div className="grid grid-cols-3 gap-1 text-center">
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">初始间隙</div>
              <div className="font-mono font-medium text-gray-600">{data.gapInit}</div>
            </div>
            <div className="relative">
               {/* Highlight Current */}
              <div className="text-[10px] text-blue-500 font-bold mb-0.5">当前间隙</div>
              <div className="font-mono font-bold text-gray-900 text-sm">{data.gapCurrent}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">累计变化</div>
              <div className={`font-mono font-medium ${data.gapChange < 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.gapChange > 0 ? '+' : ''}{data.gapChange}
              </div>
            </div>
         </div>
         
         {/* Health Bar (Fake) */}
         <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 w-[70%]"></div>
         </div>
         <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>健康度 (预测)</span>
            <span>剩余约 400h</span>
         </div>
      </div>
    </div>
  );
};
