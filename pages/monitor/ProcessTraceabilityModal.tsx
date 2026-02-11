
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileText, 
  Activity, 
  Search, 
  User, 
  RefreshCw, 
  List as ListIcon, 
  Sliders, 
  ArrowLeft,
  Filter,
  GitBranch,
  Check,
  Zap,
  Gauge,
  Droplet,
  Percent
} from 'lucide-react';
import { StandardModal } from '../../components/admin/StandardLayouts';
import { 
  RECORD_LIST, 
  RECORD_DETAILS, 
  PARAM_CONFIGS, 
  MOCK_RETRO_STANDARD, // 引入标准数据
  generateChartData 
} from '../../services/traceabilityService';
import { ProcessIndicator } from '../../types';

interface ProcessTraceabilityModalProps {
  onClose: () => void;
}

// --- Utils: 平滑曲线生成算法 ---
const getSmoothPath = (data: any[], width: number, height: number, min: number, range: number, padding: {top: number, bottom: number, left: number, right: number}) => {
  if (data.length === 0) return '';
  
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * drawWidth;
    const y = height - padding.bottom - ((d.value - min) / range) * drawHeight;
    return [x, y];
  });

  return points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`;
    const [px, py] = arr[i - 1];
    const cp1x = px + (x - px) / 3;
    const cp2x = x - (x - px) / 3;
    return `${acc} C ${cp1x},${py} ${cp2x},${y} ${x},${y}`;
  }, '');
};

// --- Sub-Components ---

// 1. 图表组件 (增强版：支持 Zoom, Tooltip, Standard, Linking, Axis)
interface TraceChartProps {
  config: any;
  viewRange: { start: number; end: number }; // 0-100
  onHoverLog: (logId: string | null) => void; // Updated: logId is string
}

const TraceChart: React.FC<TraceChartProps> = ({ config, viewRange, onHoverLog }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 1. 生成全量数据 (Mock)
  const fullChartData = useMemo(() => {
    if (config.type === 'single') {
      return { type: 'single', series: [{ name: config.name, color: config.color, data: generateChartData(config.id) }] };
    } else {
      const series = [1, 2, 3, 4, 5].map((idx) => {
        const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];
        const baseData = generateChartData(config.id);
        const offsetData = baseData.map(d => ({ ...d, value: d.value * (1 + (idx - 3) * 0.05) }));
        return { name: `#${idx}`, color: colors[idx - 1], data: offsetData };
      });
      return { type: 'multi', series };
    }
  }, [config.id, config.type, config.name, config.color]);

  // 2. 根据 viewRange 裁切数据 (实现 Zoom)
  const visibleData = useMemo(() => {
    if (!fullChartData) return null;
    const totalPoints = fullChartData.series[0].data.length;
    // 转换百分比为索引
    const startIdx = Math.floor((viewRange.start / 100) * (totalPoints - 1));
    const endIdx = Math.ceil((viewRange.end / 100) * (totalPoints - 1));
    // 确保至少有2个点
    const safeEndIdx = Math.max(endIdx, startIdx + 2);
    
    return {
        ...fullChartData,
        series: fullChartData.series.map(s => ({
            ...s,
            data: s.data.slice(startIdx, safeEndIdx + 1)
        }))
    };
  }, [fullChartData, viewRange]);

  if (!visibleData) return null;

  // 3. 计算坐标系
  const width = 1000;
  const height = 240; 
  const padding = { top: 25, bottom: 40, left: 50, right: 20 }; 
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  let allValues: number[] = [];
  visibleData.series.forEach(s => s.data.forEach((d: any) => allValues.push(d.value)));
  
  // 如果有工艺标准，需要把标准值也纳入 Y 轴范围计算
  if (config.standard) {
      allValues.push(config.standard.target + config.standard.dev);
      allValues.push(config.standard.target - config.standard.dev);
  }

  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);
  const safeRange = (maxVal - minVal) * 1.1 || 1;
  const center = (maxVal + minVal) / 2;
  const yMin = center - safeRange / 2;
  const yMax = center + safeRange / 2;
  const yRange = yMax - yMin;

  const getX = (i: number, total: number) => padding.left + (i / (total - 1)) * drawWidth;
  const getY = (val: number) => height - padding.bottom - ((val - yMin) / yRange) * drawHeight;

  // Y 轴刻度
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const val = yMin + yRange * p;
      return { y: height - padding.bottom - (p * drawHeight), val: val };
  });

  // X 轴刻度
  const xTickCount = 5;
  const dataLen = visibleData.series[0].data.length;
  const xTicks = Array.from({ length: xTickCount }).map((_, i) => {
      const index = Math.floor(i * (dataLen - 1) / (xTickCount - 1));
      return { x: getX(index, dataLen), label: visibleData.series[0].data[index].time };
  });

  const currentValues = visibleData.series.map(s => ({
    name: s.name,
    color: s.color,
    val: s.data[s.data.length - 1].value.toFixed(2)
  }));

  // 4. 交互处理 (修复坐标映射)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // 1. 获取 DOM 坐标
    const domX = e.clientX - rect.left;
    
    // 2. 转换为 SVG 内部坐标 (因为 SVG preserveAspectRatio="none", 且 viewBox width=1000)
    // 比例 = SVG总宽 / DOM总宽
    const scaleX = width / rect.width;
    const svgX = domX * scaleX;

    // 3. 计算在绘图区域内的百分比
    // 绘图区起点: padding.left
    // 绘图区宽度: drawWidth
    let percent = (svgX - padding.left) / drawWidth;
    
    // 边界限制
    percent = Math.max(0, Math.min(percent, 1));
    
    const totalVisible = visibleData.series[0].data.length;
    let idx = Math.round(percent * (totalVisible - 1));
    
    setHoverIndex(idx);

    const pointData = visibleData.series[0].data[idx];
    if (pointData && pointData.linkedLogId) {
        onHoverLog(pointData.linkedLogId);
    } else {
        onHoverLog(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onHoverLog(null);
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col h-[280px] shrink-0 transition-all hover:shadow-md group relative select-none"
    >
      {/* 标题栏 */}
      <div className="flex justify-between items-start mb-2 h-6 pl-2">
        <div className="flex items-center gap-2">
           {config.icon ? <div className="p-1 bg-slate-100 rounded text-slate-600"><config.icon size={14}/></div> : 
             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }}></div>
           }
           <span className="text-sm font-bold text-slate-700">{config.name}</span>
        </div>
        <div className="flex gap-3 text-xs font-mono">
           {currentValues.slice(0, 5).map((v, i) => (
             <div key={i} className="flex items-center gap-1">
               {config.type === 'multi' && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.color }}></div>}
               {config.type === 'multi' && <span className="text-slate-400 scale-90">{v.name}:</span>}
               <span className="font-bold text-slate-700">{v.val}</span>
               {i === currentValues.length - 1 && <span className="text-slate-400 ml-0.5">{config.unit}</span>}
             </div>
           ))}
        </div>
      </div>

      {/* 图表绘制区 */}
      <div 
        ref={containerRef}
        className="flex-1 w-full relative overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
           
           {/* Y Axis Grid & Labels */}
           {yTicks.map((tick, i) => (
             <g key={i}>
                <line 
                  x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} 
                  stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" 
                />
                <text 
                  x={padding.left - 8} y={tick.y + 4} 
                  textAnchor="end" fontSize="10" fill="#94a3b8" className="font-mono"
                >
                  {Math.abs(tick.val) < 10 ? tick.val.toFixed(2) : Math.round(tick.val)}
                </text>
             </g>
           ))}

           {/* X Axis Ticks & Labels */}
           {xTicks.map((tick, i) => (
             <g key={i}>
                <line x1={tick.x} y1={height - padding.bottom} x2={tick.x} y2={height - padding.bottom + 6} stroke="#e2e8f0" strokeWidth="1" />
                <text 
                  x={tick.x} y={height - padding.bottom + 18} 
                  textAnchor="middle" fontSize="10" fill="#94a3b8" className="font-mono"
                >
                  {tick.label}
                </text>
             </g>
           ))}

           {/* A. 工艺标准阈值区域 */}
           {config.standard && (
             <rect
                x={padding.left}
                y={getY(config.standard.target + config.standard.dev)}
                width={drawWidth}
                height={Math.abs(getY(config.standard.target - config.standard.dev) - getY(config.standard.target + config.standard.dev))}
                fill={config.color}
                opacity="0.08"
             />
           )}
           {config.standard && (
             <>
               <line 
                 x1={padding.left} y1={getY(config.standard.target)} 
                 x2={width - padding.right} y2={getY(config.standard.target)} 
                 stroke={config.color} strokeWidth="1" strokeDasharray="5 5" opacity="0.4" 
               />
               <text x={padding.left + 5} y={getY(config.standard.target) - 4} fontSize="10" fill={config.color} opacity="0.6">STD: {config.standard.target}</text>
             </>
           )}

           {/* B. 背景区域标记 */}
           {config.hasActions && visibleData.series[0].data.map((d: any, i: number, arr: any[]) => {
             if (i === arr.length - 1) return null;
             if (d.action) {
               const x1 = getX(i, arr.length);
               const x2 = getX(i+1, arr.length);
               return (
                 <rect 
                    key={i}
                    x={x1} y={padding.top} width={x2 - x1 + 0.5} height={drawHeight} 
                    fill={d.action === 'manual' ? '#fbbf24' : '#60a5fa'} 
                    opacity="0.2"
                 />
               );
             }
             return null;
           })}

           {/* D. 曲线绘制 */}
           {visibleData.series.map((s, idx) => (
              <g key={idx}>
                {config.type === 'single' && (
                  <path 
                    d={`${getSmoothPath(s.data, width, height, yMin, yRange, padding)} L ${width-padding.right},${height-padding.bottom} L ${padding.left},${height-padding.bottom} Z`} 
                    fill={s.color} fillOpacity="0.05" stroke="none"
                  />
                )}
                <path 
                   d={getSmoothPath(s.data, width, height, yMin, yRange, padding)} 
                   fill="none" stroke={s.color} 
                   strokeWidth={config.type === 'single' ? 2 : 1.5} 
                   strokeLinecap="round" strokeLinejoin="round"
                   vectorEffect="non-scaling-stroke"
                />
              </g>
           ))}

           {/* E. 悬浮交互 */}
           {hoverIndex !== null && (
             <g>
               <line 
                 x1={getX(hoverIndex, visibleData.series[0].data.length)} 
                 y1={padding.top} 
                 x2={getX(hoverIndex, visibleData.series[0].data.length)} 
                 y2={height - padding.bottom} 
                 stroke="#94a3b8" 
                 strokeWidth="1"
               />
               {visibleData.series.map((s, idx) => {
                 const point = s.data[hoverIndex];
                 return (
                   <circle 
                     key={idx}
                     cx={getX(hoverIndex, s.data.length)}
                     cy={getY(point.value)}
                     r="4"
                     fill="#fff"
                     stroke={s.color}
                     strokeWidth="2"
                   />
                 );
               })}
             </g>
           )}
        </svg>
        
        {/* F. Tooltip */}
        {hoverIndex !== null && (
           <div 
             className="absolute pointer-events-none bg-slate-800/90 text-white text-xs rounded p-2 shadow-xl border border-slate-700 z-20"
             style={{ 
               left: getX(hoverIndex, visibleData.series[0].data.length), 
               top: 10,
               transform: 'translateX(-50%)' 
             }}
           >
              <div className="font-mono mb-1 text-slate-400 border-b border-slate-600 pb-1">
                {visibleData.series[0].data[hoverIndex].time}
              </div>
              {visibleData.series.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                   <div className="w-2 h-2 rounded-full" style={{background: s.color}}></div>
                   <span className="opacity-80">{s.name}:</span>
                   <span className="font-bold font-mono">{s.data[hoverIndex].value.toFixed(2)}</span>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

// 2. 时间轴组件
interface TimeRangeSliderProps {
  range: { start: number; end: number };
  onChange: (newRange: { start: number; end: number }) => void;
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({ range, onChange }) => {
  const [isDragging, setIsDragging] = useState<string | null>(null); 
  const sliderRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState("13:12");
  const [endTime, setEndTime] = useState("13:48");

  const handleMouseDown = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width * 100), 100);
      
      let newStart = range.start;
      let newEnd = range.end;

      if (isDragging === 'start') {
        newStart = Math.min(percent, range.end - 5);
      } else if (isDragging === 'end') {
        newEnd = Math.max(percent, range.start + 5);
      }
      
      onChange({ start: newStart, end: newEnd });
    };

    const handleMouseUp = () => { setIsDragging(null); };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, range, onChange]);

  return (
    <div className="w-full h-full px-3 pb-3 pt-2">
       <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">视图开始</span>
                <div className="relative">
                   <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-mono font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all cursor-pointer h-6"
                   />
                </div>
             </div>
             <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">视图结束</span>
                <div className="relative">
                   <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-mono font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all cursor-pointer h-6"
                   />
                </div>
             </div>
          </div>
       </div>
       
       <div 
          ref={sliderRef}
          className="relative h-8 bg-slate-100 rounded-md border border-slate-200 select-none overflow-hidden"
       >
          <div className="absolute inset-0 pointer-events-none flex justify-between px-2">
             {[...Array(11)].map((_, i) => (
                <div key={i} className="h-full border-l border-slate-200 last:border-r-0 relative">
                   <span className="absolute bottom-1 left-1 text-[9px] text-slate-400">
                      {13 + Math.floor(i/2)}:{i%2===0?'00':'30'}
                   </span>
                </div>
             ))}
          </div>

          <div 
            className="absolute top-0 bottom-0 bg-blue-500/10 border-x border-blue-500 cursor-grab active:cursor-grabbing group"
            style={{ left: `${range.start}%`, right: `${100 - range.end}%` }}
          >
             <div 
               className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-white border border-slate-300 rounded shadow-sm flex items-center justify-center cursor-ew-resize hover:border-blue-500 hover:text-blue-500 z-20"
               onMouseDown={(e) => handleMouseDown('start', e)}
             >
                <div className="w-0.5 h-3 bg-slate-300"></div>
             </div>
             <div 
               className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-white border border-slate-300 rounded shadow-sm flex items-center justify-center cursor-ew-resize hover:border-blue-500 hover:text-blue-500 z-20"
               onMouseDown={(e) => handleMouseDown('end', e)}
             >
                <div className="w-0.5 h-3 bg-slate-300"></div>
             </div>
          </div>
       </div>
    </div>
  );
};

// 3. 左侧标准组件 (接收实体数据)
const StandardCard = ({ data }: { data: ProcessIndicator }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-4 shrink-0">
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-blue-600"/>
        <span className="text-sm font-bold text-slate-700">回溯时刻工艺标准</span>
      </div>
      <span className="text-[10px] text-slate-400">{data.startTime.slice(0, 16)}</span>
    </div>
    <div className="space-y-3">
      <div>
        <div className="text-xs text-slate-400 mb-1">产品代号</div>
        <div className="text-lg font-bold text-slate-800 tracking-tight">{data.productCode}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 p-2 rounded border border-slate-100">
          <div className="text-[10px] text-slate-500">目标叩解度</div>
          <div className="text-sm font-bold text-slate-700">
            {data.freeness} <span className="text-[10px] font-normal text-slate-400">±{data.freenessDeviation}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded border border-slate-100">
          <div className="text-[10px] text-slate-500">目标纤长</div>
          <div className="text-sm font-bold text-slate-700">
            {data.fiberLength} <span className="text-[10px] font-normal text-slate-400">±{data.fiberLengthDeviation}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- 主弹窗页面 ---

export const ProcessTraceabilityModal: React.FC<ProcessTraceabilityModalProps> = ({ onClose }) => {
  const [selectedRecordId, setSelectedRecordId] = useState('1'); // 初始化ID需匹配字符串
  const [activeParams, setActiveParams] = useState(['beatingDegree', 'fiberLength']);
  const [viewRange, setViewRange] = useState({ start: 0, end: 100 });
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null); // Updated: ID type string

  const toggleParam = (id: string) => {
    setActiveParams(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const currentRecord = RECORD_LIST.find(r => r.id === selectedRecordId);

  // 参数分组
  const paramGroups = [
    { title: '关键质量指标', items: PARAM_CONFIGS.filter(p => p.group === 'quality') },
    // 修改标题：设备运行参数 -> 工艺参数
    { title: '工艺参数', items: PARAM_CONFIGS.filter(p => p.group === 'device') },
  ];

  return (
    <StandardModal
      title="工艺回溯分析"
      onClose={onClose}
      width="w-[95vw] max-w-[1600px]" // 宽屏弹窗
      footer={
        <button 
          className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors"
          onClick={onClose}
        >
          关闭
        </button>
      }
    >
      {/* 
         LAYOUT FIX: 
         1. 设置固定高度 h-[65vh] (减小高度)，确保在 StandardModal (max-h-85vh) 内部能够撑开并启用内部滚动，避免父级滚动。
            这预留了约 20vh 的空间给 Header 和 Footer，防止底部内容（时间轴）被遮挡。
         2. 中间区域采用 flex-col 布局，图表区域 flex-1 overflow-auto，时间轴 absolute bottom-0 悬浮。
         3. 右侧区域拆分为左右两个独立滚动区。
      */}
      <div className="flex h-[65vh] overflow-hidden -m-6 bg-slate-50">
        
        {/* 左侧：配置区 (固定宽度，独立滚动) */}
        <div className="w-[18%] min-w-[240px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {/* 传入标准实体数据 */}
              <StandardCard data={MOCK_RETRO_STANDARD} />
              <div className="mt-4">
                 <div className="flex items-center gap-2 mb-3 text-slate-500 px-1">
                    <Sliders size={14}/>
                    <span className="text-xs font-bold uppercase tracking-wider">参数叠加选择</span>
                 </div>
                 <div className="space-y-6">
                    {paramGroups.map(group => (
                       <div key={group.title}>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">
                             {group.title}
                          </div>
                          <div className="space-y-1.5">
                             {group.items.map(opt => {
                                const isActive = activeParams.includes(opt.id);
                                return (
                                   <button 
                                      key={opt.id}
                                      onClick={() => toggleParam(opt.id)}
                                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all border ${
                                         isActive
                                           ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                                           : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:border-slate-100'
                                      }`}
                                   >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                         isActive ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                                      }`}>
                                         {isActive && <Check size={10} className="text-white"/>}
                                      </div>
                                      <span className="text-xs font-medium truncate">{opt.name}</span>
                                   </button>
                                );
                             })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* 中间：图表分析区 (独立滚动 + 底部悬浮) */}
        <div className="flex-1 flex flex-col h-full relative min-w-0 bg-slate-50/50">
           {/* 图表滚动区 (增加底部 padding 以避开悬浮时间轴) */}
           <div className="flex-1 overflow-y-auto p-4 pb-[80px] space-y-4 custom-scrollbar scroll-smooth">
              {activeParams.map(id => {
                 const config = PARAM_CONFIGS.find(p => p.id === id);
                 return config ? (
                    <TraceChart 
                        key={id} 
                        config={config} 
                        viewRange={viewRange} 
                        onHoverLog={setHighlightedLogId}
                    /> 
                 ) : null;
              })}
              
              {activeParams.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Activity size={48} className="mb-4 opacity-20"/>
                    <p className="text-sm">请在左侧选择要分析的参数</p>
                 </div>
              )}
           </div>

           {/* 底部悬浮时间控制 (Absolute定位，固定在底部) */}
           <div className="absolute bottom-0 left-0 right-0 h-[60px] z-20 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[-4px_0_20px_rgba(0,0,0,0.05)]">
              <TimeRangeSlider range={viewRange} onChange={setViewRange} />
           </div>
        </div>

        {/* 右侧：追溯与明细 (拆分为两个独立列) */}
        <div className="w-[32%] min-w-[350px] flex h-full border-l border-slate-200 bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
           
           {/* 子列 1: 明细详情 (Flex-1) */}
           <div className="flex-1 flex flex-col h-full border-r border-slate-100 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 h-12">
                 <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600"/>
                    <span className="text-sm font-bold text-slate-800">记录明细</span>
                 </div>
                 <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {currentRecord?.id}
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {/* 1. 进退刀汇总 */}
                  <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={12}/> 进退刀汇总
                  </h4>
                  <div className="flex flex-col gap-2 mb-6">
                     {RECORD_DETAILS.deviceSummary.map(item => {
                        const isAdvance = item.accumulatedInFeed !== undefined;
                        const typeLabel = isAdvance ? '进刀' : '退刀';
                        const value = isAdvance ? item.accumulatedInFeed : item.accumulatedOutFeed;
                        const duration = isAdvance ? item.inFeedDuration : item.outFeedDuration;

                        return (
                           <div key={item.id} className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between hover:shadow-sm transition-shadow">
                              <div className="flex items-center gap-2">
                                 <span className="font-bold text-slate-700 w-6">{item.deviceName.replace('精浆机','')}</span>
                                 <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                    isAdvance ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                 }`}>
                                    {typeLabel}
                                 </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-slate-400">累计</span>
                                    <span className="font-mono font-bold text-slate-800">{value}mm</span>
                                 </div>
                                 <div className="flex flex-col items-end w-12">
                                    <span className="text-[10px] text-slate-400">时长</span>
                                    <span className="font-mono text-slate-600">{duration}s</span>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* 2. 操作记录 */}
                  <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex justify-between items-center">
                     <div className="flex items-center gap-2"><ListIcon size={12}/> 操作记录流</div>
                     <span className="text-[10px] font-normal normal-case bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">共 {RECORD_DETAILS.logs.length} 条</span>
                  </h4>
                  
                  {/* Table Header */}
                  <div className="flex text-[10px] text-slate-400 pb-2 px-2 border-b border-slate-200 mb-1">
                     <span className="w-14">时间</span>
                     <span className="w-10 text-center">设备</span>
                     <span className="w-10 text-center">类型</span>
                     <span className="w-12 text-center">数值</span>
                     <span className="w-10 text-right">时长</span>
                     <span className="flex-1 text-right">来源</span>
                  </div>

                  {/* Table Body */}
                  <div className="space-y-0">
                     {RECORD_DETAILS.logs.map((log, idx) => {
                        const isHighlighted = highlightedLogId === log.id;
                        const isAdvance = log.type === '累计进刀';
                        const isRetract = log.type === '累计退刀';
                        
                        let highlightClass = '';
                        if (isHighlighted) {
                           if (isAdvance) highlightClass = 'bg-emerald-50 border-emerald-400 shadow-sm scale-[1.02] z-10';
                           else if (isRetract) highlightClass = 'bg-orange-50 border-orange-400 shadow-sm scale-[1.02] z-10';
                           else highlightClass = 'bg-yellow-50 border-yellow-400 shadow-sm scale-[1.02] z-10';
                        } else {
                           highlightClass = 'bg-transparent border-transparent hover:bg-white hover:shadow-sm hover:border-slate-100';
                        }

                        const timeDisplay = log.startTime.split(' ')[1] || log.startTime;

                        return (
                            <div 
                                key={log.id}
                                onMouseEnter={() => setHighlightedLogId(log.id)}
                                onMouseLeave={() => setHighlightedLogId(null)}
                                className={`flex items-center text-xs py-2.5 px-2 transition-all rounded-md group border-l-4 cursor-default
                                    ${highlightClass}
                                    ${!isHighlighted && idx !== RECORD_DETAILS.logs.length-1 ? 'border-b-slate-100 border-b-[1px]' : ''}
                                `}
                            >
                               <span className="w-14 font-mono text-slate-500 scale-90 origin-left">{timeDisplay}</span>
                               <span className="w-10 text-center font-bold text-slate-700">{log.deviceName.replace('精浆机','')}</span>
                               <span className={`w-10 text-center font-bold ${isAdvance ? 'text-emerald-600' : 'text-orange-600'}`}>
                                  {isAdvance ? '进刀' : '退刀'}
                               </span>
                               <span className="w-12 text-center font-mono text-slate-800">{log.gapChange > 0 ? `+${log.gapChange}` : log.gapChange}</span>
                               <span className="w-10 text-right font-mono text-slate-500">{log.duration}</span>
                               <div className="flex-1 flex justify-end">
                                  {log.source === '人工操作' 
                                     ? <User size={12} className="text-slate-400 group-hover:text-slate-600"/> 
                                     : <RefreshCw size={12} className="text-blue-400 group-hover:text-blue-600"/>}
                               </div>
                            </div>
                        );
                     })}
                  </div>
              </div>
           </div>

           {/* 子列 2: 列表面板 (Fixed Width) */}
           <div className="w-[200px] flex flex-col h-full bg-slate-50/50 shrink-0 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-white">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">工艺回溯</span>
                    <Filter size={14} className="text-slate-400 cursor-pointer hover:text-blue-500"/>
                 </div>
                 <div className="relative">
                    <input 
                       type="text" 
                       placeholder="搜索时间/类型" 
                       className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 pl-7 shadow-sm"
                    />
                    <Search size={12} className="absolute left-2.5 top-2 text-slate-400"/>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {RECORD_LIST.map((record) => {
                    const hasAuto = record.source.includes('自动操作');
                    const hasManual = record.source.includes('人工操作');
                    const isPurpleTheme = record.operationType === '开机操作';
                    
                    return (
                      <div 
                         key={record.id}
                         onClick={() => setSelectedRecordId(record.id)}
                         className={`
                            flex flex-col p-2.5 cursor-pointer transition-all rounded-lg relative group border
                            ${selectedRecordId === record.id 
                               ? 'bg-white border-purple-300 shadow-md ring-1 ring-purple-50' 
                               : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                            }
                         `}
                      >
                         {selectedRecordId === record.id && (
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-white drop-shadow-md z-20">
                               <ArrowLeft size={18} fill="currentColor" className="text-white stroke-slate-200"/>
                            </div>
                         )}

                         <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                               isPurpleTheme ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                               {record.operationType}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{record.date.slice(5)}</span>
                         </div>
                         
                         <div className="text-xs font-black text-slate-800 font-mono tracking-tight mb-2 pl-0.5">
                            {record.timeRange.replace(' ', '')}
                         </div>
                         
                         <div className="flex justify-between items-center bg-slate-50 rounded-md p-1.5 border border-slate-100">
                            <div className="flex items-center gap-2">
                               <div className="flex items-center gap-1" title="操作来源">
                                  <div className="flex items-center gap-0.5">
                                     {hasManual && <User size={12} className="text-slate-500"/>}
                                     {hasAuto && <RefreshCw size={12} className="text-blue-500"/>}
                                  </div>
                                  <span className="text-[10px] text-slate-600 font-medium">
                                     {record.source.join('/')}
                                  </span>
                               </div>
                            </div>

                            <button 
                              className="p-1 rounded hover:bg-white hover:text-purple-600 hover:shadow-sm text-slate-300 transition-all" 
                              title="物料追溯"
                              onClick={(e) => { e.stopPropagation(); }}
                            >
                               <GitBranch size={12}/>
                            </button>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </StandardModal>
  );
}
