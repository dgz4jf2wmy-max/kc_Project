
import React, { useState, useEffect } from 'react';
import { StandardModal } from '../../components/admin/StandardLayouts';
import { fetchKnifeGapAnalysis } from '../../services/mockDataService';
import { KnifeGapRecord } from '../../types';

// 图表组件 (复用逻辑，针对 Modal 场景适配)
const GapTrendChart: React.FC<{ data: KnifeGapRecord[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 bg-gray-50 rounded text-gray-400 text-sm">暂无趋势数据</div>;
  }

  // 按日期排序
  const sorted = [...data].sort((a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime());
  
  // 画布配置
  const width = 600; 
  const height = 220;
  const padding = { top: 30, right: 30, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const values = sorted.map(d => d.gapValue);
  
  // 修正：支持负数范围，计算动态 Min/Max
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);
  const range = maxVal - minVal || 1; // 防止除以0
  
  // 增加上下 10% 余量，确保曲线不顶格/底格
  minVal -= range * 0.1;
  maxVal += range * 0.1;

  const getX = (index: number) => {
     if (sorted.length <= 1) return padding.left + graphWidth / 2;
     return padding.left + (index / (sorted.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
     const ratio = (val - minVal) / (maxVal - minVal);
     return padding.top + graphHeight - (ratio * graphHeight);
  };

  const points = sorted.map((d, i) => `${getX(i)},${getY(d.gapValue)}`).join(' ');
  const linePath = `M ${points}`;
  // 填充逻辑：使用 areaPath 填充下方
  const areaPath = `${linePath} L ${getX(sorted.length - 1)},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;

  return (
    <div className="w-full select-none">
       <svg 
         viewBox={`0 0 ${width} ${height}`} 
         className="w-full h-auto overflow-visible block"
         preserveAspectRatio="xMidYMid meet"
       >
          {/* Y轴网格 */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
             const y = padding.top + graphHeight * ratio;
             const valLabel = maxVal - (maxVal - minVal) * ratio;
             return (
               <g key={ratio}>
                 <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 2" />
                 <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" className="font-mono">{valLabel.toFixed(2)}</text>
               </g>
             )
          })}
          
          {/* 区域填充 */}
          <path d={areaPath} fill="url(#gradientBlueMonitor)" opacity="0.15" />
          {/* 折线 */}
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* 数据点 */}
          {sorted.map((d, i) => (
            <g key={d.id} className="group cursor-pointer">
              <circle cx={getX(i)} cy={getY(d.gapValue)} r="12" fill="transparent" />
              <circle cx={getX(i)} cy={getY(d.gapValue)} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2" className="transition-all duration-200 group-hover:r-5 group-hover:stroke-blue-700" />
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ transform: 'translateY(-8px)' }}>
                 <rect x={getX(i) - 20} y={getY(d.gapValue) - 34} width="40" height="22" rx="4" fill="#1e293b" />
                 <path d={`M ${getX(i)} ${getY(d.gapValue) - 12} L ${getX(i) - 4} ${getY(d.gapValue) - 16} L ${getX(i) + 4} ${getY(d.gapValue) - 16} Z`} fill="#1e293b" />
                 <text x={getX(i)} y={getY(d.gapValue) - 19} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">{d.gapValue}</text>
              </g>
            </g>
          ))}
          
          {/* X轴标签 */}
          {sorted.map((d, i) => (
             <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">
               {d.weekDate.slice(5)}
             </text>
          ))}
          
          <defs>
            <linearGradient id="gradientBlueMonitor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
       </svg>
    </div>
  );
};

interface GapTrendModalProps {
  onClose: () => void;
  deviceName: string;
  knifeModel: string;
}

export const GapTrendModal: React.FC<GapTrendModalProps> = ({ onClose, deviceName, knifeModel }) => {
  const [data, setData] = useState<KnifeGapRecord[]>([]);

  useEffect(() => {
    // 模拟获取该设备的间隙分析数据
    fetchKnifeGapAnalysis('mock-id').then(res => setData(res.data));
  }, []);

  return (
    <StandardModal
      title="刀盘间隙趋势 (自然周)"
      onClose={onClose}
      width="w-[700px]"
      footer={
        <button 
          className="px-5 py-2 rounded bg-system-primary text-white hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
          onClick={onClose}
        >
          关闭
        </button>
      }
    >
      <div className="p-4">
         <div className="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded border border-slate-100">
            <div>
               <div className="text-xs text-slate-400">当前设备</div>
               <div className="font-bold text-slate-700">{deviceName}</div>
            </div>
             <div>
               <div className="text-xs text-slate-400 text-right">当前刀盘</div>
               <div className="font-bold text-slate-700">{knifeModel}</div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
             <GapTrendChart data={data} />
         </div>
      </div>
    </StandardModal>
  );
};
