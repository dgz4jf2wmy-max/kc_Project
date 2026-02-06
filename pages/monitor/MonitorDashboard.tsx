
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Activity, 
  Edit3, 
  Database,
  History,
  Droplet,
  Thermometer,
  Cpu,
  RotateCw,
  RotateCcw,
  AlertTriangle,
  Zap,
  Clock,
  Tag,
  Gauge,
  Disc,
  Calendar,
  ArrowDown,
  ArrowUp,
  Settings,
  Monitor,
  ChevronRight,
  ArrowRight,
  TrendingDown,
  Rewind,
  PackagePlus,
  User,
  Users,
  PlayCircle,
  MoreHorizontal,
  Pipette,
  ArrowRightCircle,
  Bell,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { fetchCurrentProcessIndicator } from '../../services/monitorMockService'; // 引入接口
import { ProcessIndicator } from '../../types'; // 引入实体类

// --- 常量定义：绝对坐标系统 ---
const CONFIG = {
  visualHeight: 140,    // 视觉区高度
  centerY: 80,          // 磨浆机中心 Y 坐标
  discRadius: 36,       // 磨浆机视觉半径
  inletY: 80,           // 进浆管 Y 坐标
  outletTopY: 15,       // 出浆管顶部转弯 Y 坐标
  
  // 绝对定位参数
  headerH: 45,
  pipeBottomY: 420      // 底部进出管的绝对 Y 坐标
};

// --- 1. 独立封装的旋转刀盘组件 ---
const RotatingRefinerDisc = ({ isRunning, speed, direction, isOverload, colorClass }: any) => {
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number>();
  
  const animate = () => {
    if (isRunning) {
      setRotation(prev => {
        const delta = direction * (speed * 0.8); 
        return (prev + delta) % 360;
      });
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, speed, direction]);

  return (
    <div 
      className="relative rounded-full transition-transform duration-75"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg width="56" height="56" viewBox="0 0 100 100" className={colorClass} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="50" cy="50" r="48" strokeWidth="3" className="opacity-80"/>
        <circle cx="50" cy="50" r="18" strokeWidth="3" className="opacity-80"/>
        <circle cx="50" cy="50" r="6" fill="currentColor" className="opacity-50"/>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line key={`l-${angle}`} x1="50" y1="50" x2="50" y2="2" transform={`rotate(${angle} 50 50)`} strokeLinecap="round"/>
        ))}
      </svg>
    </div>
  );
};

// --- 2. 模拟数据生成 ---
const generateData = () => {
  const power = 100 + Math.random() * 120;
  const currentGap = (0.8 + Math.random() * 0.4);
  const initialGap = 1.68;
  const inP = 2.5 + Math.random() * 0.5;
  const outP = inP + 0.3 + Math.random() * 0.4;
  
  return {
    power: power,
    currentGap: currentGap.toFixed(2),
    initialGap: initialGap,
    gapChange: (initialGap - currentGap).toFixed(2), 
    inPressure: inP.toFixed(2),
    outPressure: outP.toFixed(2),
    diffPressure: (outP - inP).toFixed(2), 
    flow: (2800 + Math.random() * 200).toFixed(0),
    temp: (45 + Math.random() * 5).toFixed(1),
    valveIn: Math.random() > 0.1, 
    valveOut: Math.random() > 0.1,
    direction: Math.random() > 0.5 ? 1 : -1,
    rpmSpeed: (power / 20),
    runTime: 132,
    lifePercent: 85, 
    installDate: "2025-09-17"
  };
};

// --- 3. 阀门组件 ---
const ValveIcon = ({ isOpen, vertical = false, colorClass }: any) => {
  const finalColor = colorClass || (isOpen ? "text-emerald-500 fill-emerald-500" : "text-slate-300 fill-slate-300");
  
  return (
    <div className={`relative flex flex-col items-center justify-center transition-all ${vertical ? 'rotate-90' : ''}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" className={finalColor}>
        <path d="M4 6 L12 12 L4 18 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M20 6 L12 12 L20 18 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
        <line x1="12" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
};

// --- 4. 总进浆节点 (Main Inlet Node) ---
const MainInletNode = () => {
  const [pressure, setPressure] = useState((2.8 + Math.random() * 0.1).toFixed(2));
  
  useEffect(() => {
    const interval = setInterval(() => setPressure((2.8 + Math.random() * 0.1).toFixed(2)), 2000);
    return () => clearInterval(interval);
  }, []);

  const topY = CONFIG.headerH + CONFIG.inletY; // 125px
  const bottomY = CONFIG.pipeBottomY;          // 420px
  const radius = 12;

  return (
    <div className="w-[110px] h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 relative overflow-hidden z-10">
      
      {/* Header */}
      <div className="px-2 py-2 border-b border-slate-100 flex justify-center items-center bg-white h-[45px] z-20 relative">
         <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <ArrowRightCircle size={14} className="text-emerald-500"/> 总进浆
         </span>
      </div>

      {/* 管道层 (Z=0) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         {/* 1. 底部水平段: 左(0) -> 中减半径 */}
         <div className="absolute h-[6px] bg-emerald-400 left-0" 
              style={{ top: bottomY, width: `calc(50% - ${radius}px + 3px)` }}></div>
         
         {/* 2. 下拐点 */}
         <div className="absolute border-b-[6px] border-r-[6px] border-emerald-400 rounded-br-xl"
              style={{
                 left: `calc(50% - ${radius}px - 3px)`,
                 top: bottomY - radius,
                 width: radius + 6,
                 height: radius + 6
              }}></div>
         
         {/* 3. 垂直段 */}
         <div className="absolute w-[6px] bg-emerald-400 left-1/2 -ml-[3px]"
              style={{
                 top: topY + radius,
                 height: bottomY - topY - (radius * 2) + 6
              }}></div>

         {/* 4. 上拐点 */}
         <div className="absolute border-t-[6px] border-l-[6px] border-emerald-400 rounded-tl-xl"
              style={{
                 left: `calc(50% - 3px)`, 
                 top: topY,
                 width: radius + 6,
                 height: radius + 6
              }}></div>

         {/* 5. 顶部水平段 */}
         <div className="absolute h-[6px] bg-emerald-400 right-0"
              style={{ top: topY, width: `calc(50% - ${radius}px + 3px)` }}></div>

         {/* 动画层 */}
         <svg className="w-full h-full absolute inset-0">
             <path d={`M -10 ${bottomY + 3} L 55 ${bottomY + 3} L 55 ${topY + 3} L 150 ${topY + 3}`} fill="none" stroke="none" id="mainInletPath" />
             <circle r="2" fill="white" className="opacity-90">
                 <animateMotion dur="3s" repeatCount="indefinite">
                    <mpath href="#mainInletPath" />
                 </animateMotion>
             </circle>
         </svg>
      </div>

      {/* Visual Alignment Area (Z=10) */}
      <div className="relative w-full bg-slate-50/30 z-10 pointer-events-none" style={{ height: `${CONFIG.visualHeight}px` }}>
         {/* 节点大圆点 */}
         <div className="absolute left-1/2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm -ml-2 -mt-[5px]" style={{ top: CONFIG.inletY }}></div>
         <div className="absolute right-[-20px] w-[20px] h-[6px] bg-emerald-400" style={{ top: CONFIG.inletY }}></div>
      </div>
      
      {/* Data & Valve Area */}
      <div className="flex-1 flex flex-col items-center p-3 gap-8 z-10 pointer-events-none">
         <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/95 border border-emerald-100 w-full shadow-sm z-20 mt-4">
            <span className="text-[10px] text-emerald-600 font-bold uppercase mb-1">总管压力</span>
            <span className="font-mono font-bold text-2xl text-slate-700 leading-none">{pressure}</span>
            <span className="text-[10px] text-slate-400">bar</span>
         </div>
         
         {/* 阀门 - 绝对居中 - 上移至 150 */}
         <div className="absolute bg-white p-1 rounded-full z-20 pointer-events-auto" 
              style={{ 
                 top: 150, 
                 left: '50%', 
                 transform: 'translate(-50%, -50%)' 
              }}>
             <ValveIcon isOpen={true} vertical={true} colorClass="text-emerald-500 fill-emerald-500" />
         </div>
      </div>
    </div>
  );
}

// --- 5. 总出浆节点 (Main Outlet Node) ---
const MainOutletNode = () => {
  const [flow, setFlow] = useState((2850 + Math.random() * 50).toFixed(0));
  
  useEffect(() => {
    const interval = setInterval(() => setFlow((2850 + Math.random() * 50).toFixed(0)), 2000);
    return () => clearInterval(interval);
  }, []);

  const topY = CONFIG.headerH + CONFIG.outletTopY; // 60px
  const bottomY = CONFIG.pipeBottomY;              // 420px
  const radius = 12;

  return (
    <div className="w-[110px] h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden relative z-10">
      
      {/* Header */}
      <div className="px-2 py-2 border-b border-slate-100 flex justify-center items-center bg-white h-[45px] z-20 relative">
         <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Droplet size={14} className="text-blue-500"/> 总出浆
         </span>
      </div>

      {/* 管道层 (Z=0) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         {/* 1. 顶部水平段 */}
         <div className="absolute h-[6px] bg-emerald-400 left-0" 
              style={{ top: topY, width: `calc(50% - ${radius}px + 3px)` }}></div>

         {/* 2. 上拐点 - 覆盖处理 */}
         <div className="absolute border-t-[6px] border-r-[6px] border-blue-400 rounded-tr-xl"
              style={{
                 left: `calc(50% - ${radius}px - 3px)`,
                 top: topY,
                 width: radius + 6,
                 height: radius + 6
              }}></div>
         <div className="absolute h-[6px] bg-emerald-400 rounded-tr-xl"
              style={{
                  left: `calc(50% - ${radius}px - 3px)`,
                  top: topY,
                  width: radius + 6,
                  clipPath: 'polygon(0 0, 80% 0, 0 100%)' 
              }}></div>

         {/* 3. 垂直段 */}
         <div className="absolute w-[6px] bg-blue-400 left-1/2 -ml-[3px]"
              style={{
                 top: topY + radius,
                 height: bottomY - topY - (radius * 2) + 6
              }}></div>

         {/* 4. 下拐点 */}
         <div className="absolute border-b-[6px] border-l-[6px] border-blue-400 rounded-bl-xl"
              style={{
                 left: `calc(50% - 3px)`, 
                 top: bottomY - radius,
                 width: radius + 6,
                 height: radius + 6
              }}></div>

         {/* 5. 底部水平段 */}
         <div className="absolute h-[6px] bg-blue-400 right-0"
              style={{ top: bottomY, width: `calc(50% - ${radius}px + 3px)` }}></div>

         {/* 动画层 */}
         <svg className="w-full h-full absolute inset-0">
             <path d={`M -10 ${topY + 3} L 55 ${topY + 3} L 55 ${bottomY + 3} L 150 ${bottomY + 3}`} fill="none" stroke="none" id="mainOutletPath" />
             <circle r="2" fill="white" className="opacity-90">
                 <animateMotion dur="4s" repeatCount="indefinite">
                    <mpath href="#mainOutletPath" />
                 </animateMotion>
             </circle>
         </svg>
      </div>

      {/* Visual Alignment Area */}
      <div className="relative w-full bg-slate-50/30 z-10 pointer-events-none" style={{ height: `${CONFIG.visualHeight}px` }}>
         <div className="absolute left-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm -ml-2 -mt-[5px]" style={{ top: CONFIG.outletTopY }}></div>
         <div className="absolute left-[-20px] w-[20px] h-[6px] bg-emerald-400" style={{ top: CONFIG.outletTopY }}></div>
      </div>

      {/* Data & Valve Area */}
      <div className="flex-1 flex flex-col items-center p-3 gap-8 z-10 pointer-events-none">
         <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/95 border border-blue-100 w-full shadow-sm z-20 mt-4">
            <span className="text-[10px] text-blue-600 font-bold uppercase mb-1">总管流量</span>
            <span className="font-mono font-bold text-xl text-slate-700 leading-none">{flow}</span>
            <span className="text-[10px] text-slate-400">L/m</span>
         </div>
         
         {/* 阀门 - 绝对居中 - 上移至 120 */}
         <div className="absolute bg-white p-1 rounded-full z-20 pointer-events-auto" 
              style={{ 
                 top: 120, 
                 left: '50%', 
                 transform: 'translate(-50%, -50%)' 
              }}>
             <ValveIcon isOpen={true} vertical={true} colorClass="text-blue-500 fill-blue-500"/>
         </div>
      </div>
    </div>
  );
}

// --- 6. 设备卡片 (Refiner Card) ---
const PipelineRefinerCard = ({ id, name, model, status, isFirst, isLast }: any) => {
  const [data, setData] = useState(generateData());
  
  useEffect(() => {
    const interval = setInterval(() => setData(generateData()), 2000);
    return () => clearInterval(interval);
  }, []);

  const isRun = status === 'RUN';
  const isOverload = data.power > 200;
  const isCW = data.direction === 1;
  const mainColorClass = isOverload ? 'text-red-600' : (isRun ? (isCW ? 'text-emerald-500' : 'text-blue-500') : 'text-slate-300');
  const pipeColorClass = isRun ? 'bg-emerald-400' : 'bg-slate-200';
  const pipeBorderClass = isRun ? 'border-emerald-400' : 'border-slate-200';
  const deviceName = name.startsWith(id) ? name : `${id}# ${name}`;
  const directionBadgeStyle = isCW ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200";

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative h-[480px] group w-full ${isOverload ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'}`}>
      
      {/* 1. 顶部标题栏 */}
      <div className={`px-4 py-2 border-b border-slate-100 flex justify-between items-center rounded-t-xl h-[45px] ${isOverload ? 'bg-red-50' : 'bg-white'}`}>
           <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <Monitor size={14} className="text-slate-400"/> {deviceName}
           </span>
           <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${isRun ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isRun ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              {isRun ? '运行中' : '停机'}
           </div>
      </div>

      {/* 1.2 可视化区 */}
      <div className="flex-none relative w-full overflow-hidden" style={{ height: `${CONFIG.visualHeight}px` }}>
          <div className="absolute inset-0 z-0 pointer-events-none">
             {/* 进浆管 */}
             <div className={`absolute h-[6px] -mt-[3px] transition-colors duration-500 ${pipeColorClass}`} 
                  style={{ top: CONFIG.inletY, left: 0, width: `calc(50% - ${CONFIG.discRadius - 4}px)` }} 
             />
             
             {/* 出浆管 */}
             <div className={`absolute border-t-[6px] border-l-[6px] rounded-tl-[20px] transition-colors duration-500 ${pipeBorderClass}`} 
                  style={{ top: CONFIG.outletTopY, left: `calc(50% - 3px)`, right: 0, height: (CONFIG.centerY - CONFIG.discRadius + 6) - CONFIG.outletTopY }} 
             />
          </div>
          {isRun && (
            <div className="absolute inset-0 z-0 pointer-events-none">
               <svg className="w-full h-full">
                  <path d={`M 0 ${CONFIG.inletY} L 120 ${CONFIG.inletY}`} fill="none" stroke="none" id={`pathIn-${id}`}/>
                  <circle r="2" fill="white" className="opacity-80"><animateMotion dur="1.5s" repeatCount="indefinite"><mpath href={`#pathIn-${id}`} /></animateMotion></circle>
                  <path d={`M 50% ${CONFIG.centerY - 40} L 50% ${CONFIG.outletTopY + 20} Q 50% ${CONFIG.outletTopY} 70% ${CONFIG.outletTopY} L 100% ${CONFIG.outletTopY}`} fill="none" stroke="none" id={`pathOut-${id}`}/>
                  <circle r="2" fill="white" className="opacity-80"><animateMotion dur="1.5s" repeatCount="indefinite" begin="0.5s"><mpath href={`#pathOut-${id}`} /></animateMotion></circle>
               </svg>
            </div>
          )}
          <div className="relative w-full h-full z-10">
             <div className="absolute flex flex-col items-center" style={{ top: CONFIG.inletY, left: 20, transform: 'translate(0, -50%)' }}>
                <div className="absolute -top-9 bg-white/95 backdrop-blur border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-center min-w-[45px] z-30">
                   <div className="text-[9px] text-slate-400">P-In</div>
                   <div className="text-xs font-mono font-bold text-slate-700">{data.inPressure}</div>
                </div>
                <div className="bg-white p-0.5 rounded-full border-none shadow-none z-20"><ValveIcon isOpen={data.valveIn} vertical={true} /></div>
             </div>
             <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: CONFIG.centerY }}>
                <div className={`relative p-1.5 rounded-full bg-white border-[4px] shadow-lg z-10 ${isOverload ? 'border-red-200 shadow-red-100' : 'border-slate-100'}`}>
                    <RotatingRefinerDisc isRunning={isRun} speed={data.rpmSpeed} direction={data.direction} isOverload={isOverload} colorClass={mainColorClass} />
                    {isRun && (
                      <div className={`absolute -bottom-2 -right-8 backdrop-blur border shadow-sm px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 z-20 ${directionBadgeStyle}`}>
                          {isCW ? <RotateCw size={10}/> : <RotateCcw size={10}/>}
                          {isCW ? 'CW' : 'CCW'}
                      </div>
                    )}
                </div>
             </div>
             <div className="absolute flex flex-col items-center" style={{ top: CONFIG.outletTopY, right: 30, transform: 'translate(0, -50%)' }}>
                <div className="absolute top-4 bg-white/95 backdrop-blur border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-center min-w-[45px] z-30">
                   <div className="text-[9px] text-slate-400">P-Out</div>
                   <div className="text-xs font-mono font-bold text-slate-700">{data.outPressure}</div>
                </div>
                <div className="bg-white p-0.5 rounded-full border-none shadow-none z-20"><ValveIcon isOpen={data.valveOut} /></div>
             </div>
          </div>
      </div>

      {/* 1.3 实时工艺数据条 */}
      <div className="px-3 pb-3 bg-white flex flex-col gap-2">
           <div className="flex justify-between items-end border-b border-slate-100 pb-2">
              <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Zap size={10} className={isOverload ? 'text-red-500' : 'text-blue-500'}/> 实时功率</span>
                 <span className={`font-mono font-bold text-2xl ${isOverload ? 'text-red-600' : 'text-slate-800'}`}>
                   {parseInt(data.power as any)} <span className="text-xs font-normal text-slate-400">KW</span>
                 </span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 font-bold">压差 (dP)</span>
                 <span className="font-mono font-bold text-lg text-slate-700">
                   {data.diffPressure} <span className="text-[10px] font-normal text-slate-400">bar</span>
                 </span>
              </div>
           </div>
           <div className="flex justify-between items-center text-xs">
               <div className="flex items-center gap-1 text-slate-600">
                  <Droplet size={10} className="text-blue-400"/>
                  <span className="font-mono font-bold">{data.flow}</span> <span className="scale-90 text-slate-400">L/m</span>
               </div>
               <div className="flex items-center gap-1 text-slate-600">
                  <Thermometer size={10} className="text-orange-400"/>
                  <span className="font-mono font-bold">{data.temp}</span> <span className="scale-90 text-slate-400">°C</span>
               </div>
           </div>
      </div>

      {/* PART 2: 耗材与寿命域 */}
      <div className="flex-1 bg-slate-50 border-t border-slate-200 rounded-b-xl p-3 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
             <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">当前刀盘型号</span>
                <span className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                   <Tag size={16} className="text-blue-600"/> {model}
                </span>
             </div>
          </div>

          <div className="flex flex-col gap-1.5 bg-white p-2 rounded border border-slate-200/60 shadow-sm">
             <div className="flex justify-between text-xs pb-1 border-b border-slate-50">
                <div className="flex items-center gap-1 text-slate-500">
                   <Calendar size={10}/> <span className="scale-90 origin-left">上机:</span> <span className="font-mono font-bold text-slate-600">{data.installDate}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                   <Clock size={10}/> <span className="scale-90 origin-left">累计:</span> <span className="font-mono font-bold text-blue-600">{data.runTime}h</span>
                </div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[8px] text-slate-400">
                   <span>健康度 (预测)</span>
                   <span>剩余约 400h</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 rounded-full" style={{width: `${data.lifePercent}%`}}></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center items-end">
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400">初始间隙</span>
                <span className="font-mono font-bold text-xs text-slate-500">{data.initialGap}</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400">当前间隙</span>
                <span className="font-mono font-bold text-xs text-slate-700">{data.currentGap}</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400">累计变化</span>
                <span className="font-mono font-bold text-xs text-slate-600 flex justify-center items-center">
                   <ArrowDown size={10} className="text-slate-400"/> {data.gapChange}
                </span>
             </div>
          </div>
      </div>
    </div>
  );
};

// --- 7. 值班信息卡片 ---
const ShiftInfoCard = () => {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm shadow-sm">
             甲
          </div>
          <div>
             <div className="font-bold text-sm text-slate-700">甲班组 (早班)</div>
             <div className="text-[10px] text-slate-400 font-mono">08:00 - 20:00</div>
          </div>
       </div>
    </div>
  );
};

// --- 8. 功能操作快捷区 ---
const FunctionShortcuts = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button className="relative group overflow-hidden bg-white border border-indigo-100 rounded-xl p-3 flex flex-col items-start gap-2 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 active:scale-[0.98]">
         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <History size={40} className="text-indigo-600"/>
         </div>
         <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Rewind size={18} fill="currentColor"/>
         </div>
         <div className="flex flex-col items-start h-5 justify-center">
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">工艺回溯</span>
         </div>
      </button>
      <button className="relative group overflow-hidden bg-white border border-blue-100 rounded-xl p-3 flex flex-col items-start gap-2 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 active:scale-[0.98]">
         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database size={40} className="text-blue-600"/>
         </div>
         <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <PackagePlus size={18}/>
         </div>
         <div className="flex flex-col items-start h-5 justify-center">
            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">物料投料</span>
         </div>
      </button>
    </div>
  );
};

// --- 9. 工艺标准卡片 ---
const CraftStandardCard = () => {
  const [standard, setStandard] = useState<ProcessIndicator | null>(null);

  useEffect(() => {
    // 获取工艺指标数据
    fetchCurrentProcessIndicator().then(res => setStandard(res.data));
  }, []);

  if (!standard) {
     return <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-[200px] animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col shrink-0">
      <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <FileText size={16} className="text-purple-600"/> 工艺标准
          </h2>
          <Edit3 size={14} className="text-slate-400 cursor-pointer hover:text-blue-500"/>
      </div>
      <div className="p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
             <div>
                <div className="text-slate-400 text-[10px] font-medium mb-0.5">当前产品</div>
                {/* 动态数据：产品代号 */}
                <div className="text-3xl font-bold text-slate-800 tracking-tighter leading-none">{standard.productCode}</div>
             </div>
             <div className="text-right">
                <div className="text-slate-400 text-[10px] mb-0.5">工艺开始时间</div>
                {/* 动态数据：开始时间 */}
                <div className="text-lg font-bold text-slate-700 font-mono leading-none bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                   {standard.startTime.slice(5)} {/* 展示 MM-dd HH:mm */}
                </div>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div className="bg-purple-50 rounded-lg p-2 border border-purple-100 flex flex-col justify-center shadow-sm">
                <span className="text-purple-600 text-[10px] font-bold mb-0.5">叩解度 (°SR)</span>
                <div className="flex items-end gap-1">
                   {/* 动态数据：叩解度 */}
                   <span className="text-xl font-bold text-slate-800 leading-none">{standard.freeness}</span>
                   <span className="text-[10px] text-slate-500 font-medium">±{standard.freenessDeviation}</span>
                </div>
             </div>
             <div className="bg-orange-50 rounded-lg p-2 border border-orange-100 flex flex-col justify-center shadow-sm">
                <span className="text-orange-600 text-[10px] font-bold mb-0.5">纤维长度 (mm)</span>
                <div className="flex items-end gap-1">
                   {/* 动态数据：纤维长度 */}
                   <span className="text-xl font-bold text-slate-800 leading-none">{standard.fiberLength}</span>
                   <span className="text-[10px] text-slate-500 font-medium">±{standard.fiberLengthDeviation}</span>
                </div>
             </div>
          </div>
          <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-1 h-2.5 bg-slate-300 rounded-full"></div>
                 <span className="text-slate-500 text-[10px] font-bold">刀盘转向设定</span>
              </div>
              <div className="flex justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {/* 动态数据：设备转向配置 */}
                  {standard.deviceConfigs.map((config, idx) => {
                      const isCW = config.rotation === '正转';
                      const colorClass = isCW 
                        ? 'text-emerald-600 bg-emerald-100 border-emerald-200' 
                        : 'text-blue-600 bg-blue-100 border-blue-200';
                      const Icon = isCW ? RotateCw : RotateCcw;
                      
                      return (
                        <div key={config.deviceId} className="flex flex-col items-center gap-0.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${colorClass} shadow-sm`}>
                               <Icon size={12} strokeWidth={2.5} />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono font-bold scale-90">{config.deviceId}#</span>
                        </div>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
};

// --- 10. ProductionExceptionList ---
const ProductionExceptionList = () => {
  const exceptions = [
    { id: 1, date: '2025-09-27', shift: '甲', content: '在线异常，清洗设备', duration: '11.37h' },
    { id: 2, date: '2025-07-21', shift: '乙', content: '更换精浆前池提浆泵叶片', duration: '6.34h' },
    { id: 3, date: '2025-04-02', shift: '丁', content: '4#箱浆机卡浆', duration: '3.18h' },
    { id: 4, date: '2025-03-20', shift: '丁', content: '提浆泵加装配件', duration: '0.58h' },
    { id: 5, date: '2025-03-18', shift: '丙', content: '处理2#送浆系统流量烟', duration: '1.2h' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
       <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
             <AlertTriangle size={16} className="text-red-500"/> 生产异常
          </h3>
          <button className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors">查看更多 &gt;</button>
       </div>
       <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {exceptions.map(ex => (
             <div key={ex.id} className="bg-white border border-slate-100 rounded-lg p-3 text-xs hover:border-red-200 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-400">
                   <span className="font-mono">{ex.date}</span>
                   <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{ex.shift}班</span>
                </div>
                <div className="font-bold text-slate-700 text-sm leading-tight">
                   {ex.content}
                </div>
                <div className="text-slate-400 flex items-center gap-1">
                   <Clock size={12}/> 持续时间: <span className="font-mono font-bold text-slate-600">{ex.duration}</span>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// --- 11. ProcessAlerts (New) ---
const ProcessAlerts = () => {
  const alerts = [
    { id: 1, time: '10:23', device: '1# 精浆', message: '功率瞬时偏高', level: 'warning' },
    { id: 2, time: '09:45', device: '3# 精浆', message: '流量轻微波动', level: 'info' },
    { id: 3, time: '08:12', device: '2# 精浆', message: '进浆压力低报警', level: 'error' },
    { id: 4, time: '06:30', device: '4# 精浆', message: '停机维护中', level: 'info' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center shrink-0">
         <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <Bell size={16} className="text-orange-500"/> 工艺报警
         </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
         {alerts.map(alert => (
            <div key={alert.id} className="bg-white border border-slate-100 rounded-lg p-2 flex items-start gap-2 hover:shadow-sm transition-all text-xs cursor-pointer">
               <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                   alert.level === 'error' ? 'bg-red-500' : 
                   alert.level === 'warning' ? 'bg-orange-500' : 'bg-blue-400'
               }`}></div>
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-slate-700">{alert.device}</span>
                     <span className="text-[10px] text-slate-400 font-mono">{alert.time}</span>
                  </div>
                  <div className="text-slate-500 leading-tight">{alert.message}</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

// --- 12. BladeHistoryList (New) ---
const BladeHistoryList = () => {
  const history = [
    { id: 1, date: '09-20 14:00', device: '1# 精浆', action: '换刀 (切)', operator: '王建国' },
    { id: 2, date: '09-15 09:30', device: '3# 精浆', action: '换刀 (磨)', operator: '李明' },
    { id: 3, date: '09-10 16:45', device: '2# 精浆', action: '调整间隙', operator: '张伟' },
    { id: 4, date: '09-08 08:20', device: '5# 精浆', action: '例行检查', operator: '赵强' },
    { id: 5, date: '09-05 11:10', device: '1# 精浆', action: '紧固螺栓', operator: '王建国' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-3 shrink-0">
         <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <RefreshCw className="text-blue-500" size={16}/> 换刀/调整记录
         </h3>
         <button className="text-[10px] text-blue-500 hover:underline">查看全部</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 rounded-lg border border-slate-100 p-0">
         <table className="w-full text-xs text-left">
            <thead className="text-slate-400 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
               <tr>
                  <th className="px-3 py-2 font-medium">时间</th>
                  <th className="px-2 py-2 font-medium">设备</th>
                  <th className="px-2 py-2 font-medium">动作</th>
                  <th className="px-3 py-2 font-medium text-right">操作人</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {history.map(item => (
                  <tr key={item.id} className="hover:bg-white transition-colors bg-white/50">
                     <td className="px-3 py-2 text-slate-500 font-mono text-[10px]">{item.date}</td>
                     <td className="px-2 py-2 text-slate-700 font-bold">{item.device}</td>
                     <td className="px-2 py-2 text-slate-600">{item.action}</td>
                     <td className="px-3 py-2 text-slate-500 text-right">{item.operator}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export const MonitorDashboard = () => {
  return (
    <div className="h-full w-full flex flex-col font-sans text-slate-800">
      
      {/* 移除顶部的 "智慧磨浆平台" Header，因为外部 ImmersiveLayout 已经提供了 Nav */}
      
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* 左侧边栏 - 20% */}
        <div className="col-span-2 flex flex-col gap-4 overflow-hidden h-full">
           <FunctionShortcuts />
           <ShiftInfoCard />
           <CraftStandardCard />
           <div className="flex-1 min-h-[200px] overflow-hidden">
              <ProductionExceptionList />
           </div>
        </div>

        {/* 右侧主内容 - 80% */}
        <div className="col-span-10 flex flex-col gap-4 overflow-hidden h-full">
          {/* 上半部分：磨浆机组 */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-none">
             <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                   <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Cpu size={20}/></div>
                   磨浆机组实时状态
                </h3>
             </div>
             <div className="flex gap-2 items-center">
                 <MainInletNode />
                 <div className="flex-1 grid grid-cols-5 gap-2">
                    <PipelineRefinerCard id="1" name="精浆" model="JQJC-01-XCI" status="RUN" isFirst={true} />
                    <PipelineRefinerCard id="2" name="精浆" model="TC2-PRO" status="RUN" />
                    <PipelineRefinerCard id="3" name="精浆" model="TC-STD" status="RUN" />
                    <PipelineRefinerCard id="4" name="精浆" model="TM-HVY" status="STOP" />
                    <PipelineRefinerCard id="5" name="精浆" model="JQJC-05" status="RUN" isLast={true} />
                 </div>
                 <MainOutletNode />
             </div>
          </section>

          {/* 下半部分：趋势与记录 */}
          <div className="flex gap-4 h-[280px] flex-none">
             {/* 趋势图 */}
             <section className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <Activity className="text-emerald-500" size={18}/> 工艺测量值趋势
                   </h3>
                   <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 叩解度</div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 纤维长度</div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200"><span className="w-3 h-0.5 border-t-2 border-dotted border-slate-500"></span> 软测量值</div>
                   </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                   <div className="flex-1 relative bg-white rounded border border-slate-100 overflow-hidden group">
                      <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-400 z-10">叩解度</div>
                      <div className="absolute top-1 right-2 text-[10px] font-mono text-purple-600 bg-purple-50 px-1 rounded z-10">当前软测量值: 55.66</div>
                      <svg className="w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <rect x="0" y="40" width="100" height="40" fill="#f3e8ff" className="opacity-50"/>
                         <path d="M0,60 Q20,50 40,54 T80,50" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
                         <path d="M80,50 Q90,45 100,52" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="opacity-60"/>
                         <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="0.5"/>
                      </svg>
                   </div>
                   <div className="flex-1 relative bg-white rounded border border-slate-100 overflow-hidden group">
                      <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-400 z-10">纤维长度</div>
                      <div className="absolute top-1 right-2 text-[10px] font-mono text-orange-600 bg-orange-50 px-1 rounded z-10">当前软测量值: 0.82</div>
                      <svg className="w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <rect x="0" y="25" width="100" height="50" fill="#ffedd5" className="opacity-50"/>
                         <path d="M0,45 Q20,60 40,30 T80,40" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                         <path d="M80,40 Q90,35 100,42" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="opacity-60"/>
                         <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="0.5"/>
                      </svg>
                   </div>
                </div>
             </section>
             
             {/* 异常列表 */}
             <div className="w-[260px] shrink-0">
                <ProcessAlerts />
             </div>
             
             {/* 换刀记录 */}
             <section className="w-[450px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <BladeHistoryList />
             </section>
          </div>
        </div>
      </div>
    </div>
  );
};
