
import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts'; // 引入 ECharts
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
  TrendingUp, // 新增图标
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
import { fetchCurrentProcessIndicator, fetchProductionExceptions } from '../../services/monitorMockService'; // 引入接口
import { fetchLatestKnifeChanges } from '../../services/knifeChangeService'; // 引入换刀服务
import { ProcessIndicator, ProductionExceptionRecord, KnifeChangeRecord, ProcessIndicatorDeviceConfig } from '../../types'; // 引入实体类
import { ProductionExceptionModal } from './ProductionExceptionModal'; // 引入异常弹窗
import { ProcessIndicatorModal } from './ProcessIndicatorModal'; // 引入指标下发弹窗
import { KnifeChangeRecordModal } from './KnifeChangeRecordModal'; // 引入换刀记录弹窗
import { GapTrendModal } from './GapTrendModal'; // 引入间隙趋势弹窗
import { MaterialFeedingModal } from './MaterialFeedingModal'; // 引入物料投料弹窗
import { PasswordVerificationModal } from './PasswordVerificationModal'; // 新增：引入口令验证弹窗
import { KnifeSelectionModal } from './KnifeSelectionModal'; // 新增：引入刀盘选择弹窗
import { ProcessTraceabilityModal } from './ProcessTraceabilityModal'; // 新增：引入工艺回溯弹窗

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

// --- ECharts 趋势图组件 ---
interface TrendChartProps {
  title: string;
  unit: string;
  color: string; // 主题色 hex
  lightColor: string; // 浅色背景 hex
  currentSoftValue: number;
  dataHistory: { time: string; value: number }[]; // 历史 30 分钟数据
  // 新增：工艺标准阈值配置
  standardValue?: number; 
  standardDev?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  title, 
  unit, 
  color, 
  lightColor, 
  currentSoftValue, 
  dataHistory,
  standardValue,
  standardDev
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }
    
    const chart = instanceRef.current;

    // 构造 X 轴时间标签：历史时间 + 软测量预测时间 (未来5分钟)
    const times = dataHistory.map(d => d.time);
    if (times.length > 0) {
      const lastTimeStr = times[times.length - 1];
      const [hh, mm] = lastTimeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hh);
      date.setMinutes(mm + 5);
      const nextTimeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      times.push(nextTimeStr);
    }

    const measureValues = dataHistory.map(d => d.value);
    
    // 构造显示数据：
    // 1. 实线部分: 对应所有历史测量点
    const solidData = measureValues; 
    
    // 2. 虚线部分: 连接最后一个实测点 -> 软测量点
    // 补齐前面的空位 (undefined) 以便对应 x 轴索引
    const dashedData = [
      ...Array(measureValues.length - 1).fill(undefined), 
      measureValues[measureValues.length - 1], 
      currentSoftValue
    ];

    // 计算 Y 轴范围，确保 markArea 完整显示且曲线居中
    let yMin = Math.min(...measureValues, currentSoftValue);
    let yMax = Math.max(...measureValues, currentSoftValue);
    
    // 如果有标准值，扩大 Y 轴范围以包含标准区域
    if (standardValue !== undefined && standardDev !== undefined) {
      yMin = Math.min(yMin, standardValue - standardDev);
      yMax = Math.max(yMax, standardValue + standardDev);
    }
    
    // 增加一点上下余量
    const padding = (yMax - yMin) * 0.2;
    // 防止数据全是 0 或相等导致的范围错误
    if (padding === 0) {
        yMin -= 1;
        yMax += 1;
    } else {
        yMin -= padding;
        yMax += padding;
    }

    const option: echarts.EChartsOption = {
      grid: {
        top: 30,
        right: 20,
        bottom: 5,
        left: 5,
        containLabel: true // 自动计算 Label 宽度，防止遮挡
      },
      tooltip: {
        trigger: 'axis',
        confine: true, // 关键修复：将 tooltip 限制在图表容器内，解决被遮挡问题
        formatter: (params: any) => {
          let html = `<div class="text-xs font-sans">
            <div class="text-slate-400 mb-1">${params[0].axisValue}</div>`;
          params.forEach((p: any) => {
             if (p.value !== undefined) {
               const name = p.seriesName;
               // 软测量显示为 "预测值" 提示
               const displayName = p.seriesName.includes('软测量') ? '软测量 (预测)' : p.seriesName;
               html += `<div class="flex items-center gap-2">
                 <span class="w-1.5 h-1.5 rounded-full" style="background:${p.color}"></span>
                 <span class="text-slate-200">${displayName}:</span>
                 <span class="font-bold text-white">${p.value}</span>
               </div>`;
             }
          });
          html += `</div>`;
          return html;
        },
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); z-index: 999;'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: '#94a3b8', 
          fontSize: 10, 
          interval: 1, // 隔一个显示一个时间，防止拥挤
          formatter: (val: string) => val
        }
      },
      yAxis: {
        type: 'value',
        min: yMin, // 修复：使用计算后的 min (包含标准差范围)，替代 Math.floor
        max: yMax, // 修复：使用计算后的 max，替代 Math.ceil
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        },
        axisLabel: { 
          show: true,
          color: '#94a3b8',
          fontSize: 9,
          formatter: (value: number) => value.toFixed(unit === 'mm' ? 2 : 0) // 根据单位格式化精度
        } 
      },
      series: [
        {
          name: '测量值',
          type: 'line',
          data: [...solidData, undefined], // 只要前面的实测数据 (最后一个位置留给虚线延伸)
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: color
          },
          // 区域填充
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color },
              { offset: 1, color: '#ffffff' }
            ]),
            opacity: 0.15
          },
          // 增加标准阈值区域 (markArea)
          markArea: (standardValue !== undefined && standardDev !== undefined) ? {
             silent: true, // 不响应鼠标事件
             itemStyle: {
                color: lightColor, // 使用传入的浅色
                opacity: 0.6       // 调整透明度使其柔和
             },
             data: [
               [
                 {
                   name: '标准范围',
                   yAxis: standardValue - standardDev,
                   label: {
                      show: true,
                      position: 'insideRight',
                      color: color,
                      fontSize: 9,
                      opacity: 0.7,
                      formatter: 'STD'
                   }
                 },
                 {
                   yAxis: standardValue + standardDev
                 }
               ]
             ]
          } : undefined
        },
        {
          name: '软测量值',
          type: 'line',
          data: dashedData,
          smooth: true,
          showSymbol: true,
          symbol: 'emptyCircle', // 空心圆点，突出预测性质
          symbolSize: 5,
          itemStyle: {
            color: color,
            borderColor: color,
            borderWidth: 2
          },
          lineStyle: {
            width: 2,
            color: color,
            type: 'dashed' // 明确指定为虚线
          },
          z: 10
        }
      ]
    };

    chart.setOption(option);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      // 修复：ResizeObserver loop completed with undelivered notifications.
      requestAnimationFrame(() => {
        chart.resize();
      });
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      instanceRef.current = null;
    };
  }, [dataHistory, currentSoftValue, color, lightColor, standardValue, standardDev]);

  return (
    <div className="flex-1 relative bg-white rounded border border-slate-100 overflow-hidden flex flex-col">
       {/* 标题与当前值 */}
       <div className="absolute top-2 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          <div className="text-xs font-bold text-slate-500">{title}</div>
          <div className="flex flex-col items-end">
             <div className="text-[10px] text-slate-400">当前软测量</div>
             <div 
               className="text-sm font-mono font-bold px-1.5 rounded"
               style={{ color: color, backgroundColor: lightColor }}
             >
               {currentSoftValue} <span className="text-[10px] scale-90">{unit}</span>
             </div>
          </div>
       </div>
       {/* 图表容器 */}
       <div ref={chartRef} className="w-full h-full pt-6"></div>
    </div>
  );
};


// --- 1. 独立封装的旋转刀盘组件 ---
// 更新：大幅降低动画速度，营造厚重的工业设备感
const RotatingRefinerDisc = ({ isRunning, direction, isOverload, colorClass, power = 150 }: any) => {
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number>();
  
  const animate = () => {
    if (isRunning) {
      setRotation(prev => {
        // 速度逻辑优化 (v2)：更慢，更稳
        // 功率系数: 满功率(200KW)增加 2.5度/帧
        const baseSpeed = 0.5; 
        const powerFactor = (power / 200) * 2.5;
        const speed = baseSpeed + powerFactor;
        
        const delta = direction * speed;
        // 修复：不再使用 % 360 取模，防止数值从 360->0 时触发 CSS 反向旋转动画
        return prev + delta; 
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
  }, [isRunning, power, direction]);

  return (
    <div 
      // 修复：移除 transition-transform duration-75，使用 rAF 驱动更平滑，且避免 reset 时的回弹
      className="relative rounded-full"
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

// --- 2. 模拟数据生成 (更新：支持平滑更新与高功率演示) ---
// elapsedMs: 页面加载后的毫秒数，用于控制演示脚本
const updateRefinerData = (prevData: any, isRunning: boolean, simulateOverload: boolean = false, elapsedMs: number = 0) => {
  // 1. 处理停机状态
  if (!isRunning) {
    return {
      ...prevData,
      power: 0,
      flow: 0,
      inPressure: 0.00,
      outPressure: 0.00,
      diffPressure: 0.00,
      temp: (prevData.temp * 0.99).toFixed(1), // 温度缓慢下降
      valveIn: false,
      valveOut: false,
      gapChange: prevData.gapChange
    };
  }

  // 2. 处理运行状态
  let newPower = prevData.power;

  if (simulateOverload) {
      // --- 高功率演示脚本 ---
      // 0s - 5s: 正常波动 (150-170KW)
      // 5s - 15s: 线性爬升，目标突破 190KW
      // 15s+: 维持高位 (192-200KW) 触发报警

      if (elapsedMs < 5000) {
          // 初始阶段：正常波动
          newPower += (Math.random() - 0.5) * 4;
          if (newPower < 150) newPower = 150 + Math.random() * 5;
          if (newPower > 170) newPower = 170 - Math.random() * 5;
      } else if (elapsedMs < 15000) {
          // 爬升阶段：每秒约提升 3-5 KW
          newPower += 2 + Math.random() * 2; 
      } else {
          // 报警阶段：维持在 192KW 以上
          newPower += (Math.random() - 0.5) * 4;
          if (newPower < 192) newPower = 192 + Math.random();
          if (newPower > 200) newPower = 200;
      }
  } else {
      // --- 正常运行模式 ---
      // 在 140 - 185 之间波动，避免误触发报警
      let deltaPower = (Math.random() - 0.5) * 3;
      newPower += deltaPower;
      
      // 边界约束
      if (newPower > 185) newPower = 185; 
      if (newPower < 140) newPower = 140 + Math.random() * 10;
  }

  const newGap = (parseFloat(prevData.currentGap) + (Math.random() - 0.5) * 0.002).toFixed(2);
  const initialGap = 1.68;
  const inP = 2.5 + Math.random() * 0.1;
  const outP = inP + 0.3 + Math.random() * 0.1;
  
  return {
    ...prevData,
    power: newPower, // 保持浮点数精度供内部计算，展示时取整
    currentGap: newGap,
    initialGap: initialGap,
    gapChange: (initialGap - parseFloat(newGap)).toFixed(2), 
    inPressure: inP.toFixed(2),
    outPressure: outP.toFixed(2),
    diffPressure: (outP - inP).toFixed(2), 
    flow: (2800 + Math.random() * 50).toFixed(0),
    temp: (45 + Math.random() * 2).toFixed(1),
    valveIn: true, 
    valveOut: true,
    runTime: 132,
    lifePercent: 85, 
    installDate: "2025-09-17"
  };
};

// 初始数据生成器
const createInitialData = () => ({
    power: 160 + Math.random() * 20,
    currentGap: '1.20',
    initialGap: 1.68,
    gapChange: '0.48',
    inPressure: '2.60',
    outPressure: '3.10',
    diffPressure: '0.50',
    flow: '2800',
    temp: '46.5',
    valveIn: true,
    valveOut: true,
    runTime: 132,
    lifePercent: 85,
    installDate: "2025-09-17"
});

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
// 更新：显式展示关联设备 VIRT-IN-001 和动态参数 AI_PRESS_IN
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
    <div className="w-[110px] h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 relative overflow-hidden z-10 group/inlet">
      
      {/* Header */}
      <div className="px-2 py-2 border-b border-slate-100 flex justify-center items-center bg-white h-[45px] z-20 relative">
         <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-help" title="设备: VIRT-IN-001 (入口处点位)">
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
         
         {/* 设备关联信息 (Hover显示) */}
         <div className="absolute top-1 left-0 w-full text-center opacity-0 group-hover/inlet:opacity-100 transition-opacity bg-slate-800/80 text-white py-1">
             <div className="text-[9px] font-mono">ID:6</div>
         </div>
      </div>
      
      {/* Data & Valve Area */}
      <div className="flex-1 flex flex-col items-center p-3 gap-8 z-10 pointer-events-none">
         <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/95 border border-emerald-100 w-full shadow-sm z-20 mt-4 relative group/tooltip">
            <span className="text-[10px] text-emerald-600 font-bold uppercase mb-1 flex items-center gap-1">
               总管压力
            </span>
            <span className="font-mono font-bold text-2xl text-slate-700 leading-none">{pressure}</span>
            <span className="text-[10px] text-slate-400">bar</span>

            {/* 参数关联提示 */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap transition-opacity">
               Source: AI_PRESS_IN
            </div>
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
// 更新：显式展示关联设备 VIRT-OUT-001 和动态参数 AI_FLOW_OUT
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
    <div className="w-[110px] h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden relative z-10 group/outlet">
      
      {/* Header */}
      <div className="px-2 py-2 border-b border-slate-100 flex justify-center items-center bg-white h-[45px] z-20 relative">
         <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-help" title="设备: VIRT-OUT-001 (出口处点位)">
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
         
         {/* 设备关联信息 (Hover显示) */}
         <div className="absolute top-1 left-0 w-full text-center opacity-0 group-hover/outlet:opacity-100 transition-opacity bg-slate-800/80 text-white py-1">
             <div className="text-[9px] font-mono">ID:7</div>
         </div>
      </div>

      {/* Data & Valve Area */}
      <div className="flex-1 flex flex-col items-center p-3 gap-8 z-10 pointer-events-none">
         <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/95 border border-blue-100 w-full shadow-sm z-20 mt-4 relative group/tooltip">
            <span className="text-[10px] text-blue-600 font-bold uppercase mb-1">总管流量</span>
            <span className="font-mono font-bold text-xl text-slate-700 leading-none">{flow}</span>
            <span className="text-[10px] text-slate-400">L/m</span>

            {/* 参数关联提示 */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap transition-opacity">
               Source: AI_FLOW_OUT
            </div>
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
interface PipelineRefinerCardProps {
  id: string;
  name: string;
  model: string;
  status: 'RUN' | 'STOP';
  assignedRotation?: '正转' | '反转'; // 新增：接收分配的转向
  simulateOverload?: boolean; // 新增：是否进行高功率演示
  isFirst?: boolean;
  isLast?: boolean;
  onViewTrend?: () => void; // 新增：查看趋势回调
  onKnifeClick?: () => void; // 新增：换刀操作回调
}

const PipelineRefinerCard = ({ id, name, model, status, assignedRotation = '正转', simulateOverload = false, isFirst, isLast, onViewTrend, onKnifeClick }: PipelineRefinerCardProps) => {
  const [data, setData] = useState(createInitialData());
  // 记录组件挂载时间，用于控制演示脚本
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    // 定时器：平滑更新状态
    const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setData(prev => updateRefinerData(prev, status === 'RUN', simulateOverload, elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [id, status, simulateOverload]); // 添加 id 依赖

  const isRun = status === 'RUN';
  // 功率 > 190 红色警告
  const isOverload = data.power > 190;
  // 使用传入的 assignedRotation 决定动画方向
  const isCW = assignedRotation === '正转';
  const directionMultiplier = isCW ? 1 : -1;

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
             {/* 进浆压力 (关联逻辑) */}
             <div className="absolute flex flex-col items-center" style={{ top: CONFIG.inletY, left: 20, transform: 'translate(0, -50%)' }}>
                <div className="absolute -top-9 bg-white/95 backdrop-blur border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-center min-w-[45px] z-30 group transition-all hover:border-blue-300 hover:shadow-md">
                   <div className="text-[9px] text-slate-400">P-In</div>
                   <div className="text-xs font-mono font-bold text-slate-700">{data.inPressure}</div>
                </div>
                <div className="bg-white p-0.5 rounded-full border-none shadow-none z-20"><ValveIcon isOpen={data.valveIn} vertical={true} /></div>
             </div>

             <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: CONFIG.centerY }}>
                {/* 增加换刀点击事件 */}
                <div 
                  onClick={onKnifeClick}
                  className={`relative p-1.5 rounded-full bg-white border-[4px] shadow-lg z-10 cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-300 transition-all active:scale-95 ${isOverload ? 'border-red-200 shadow-red-100' : 'border-slate-100'}`}
                  title="点击进行换刀操作"
                >
                    <RotatingRefinerDisc 
                        isRunning={isRun} 
                        power={data.power} // 传入功率控制速度
                        direction={directionMultiplier} // 传入转向控制方向
                        isOverload={isOverload} 
                        colorClass={mainColorClass} 
                    />
                    {isRun && (
                      <div className={`absolute -bottom-2 -right-8 backdrop-blur border shadow-sm px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 z-20 ${directionBadgeStyle}`}>
                          {isCW ? <RotateCw size={10}/> : <RotateCcw size={10}/>}
                          {isCW ? 'CW' : 'CCW'}
                      </div>
                    )}
                </div>
             </div>

             {/* 出浆压力 (关联逻辑) */}
             <div className="absolute flex flex-col items-center" style={{ top: CONFIG.outletTopY, right: 30, transform: 'translate(0, -50%)' }}>
                <div className="absolute top-4 bg-white/95 backdrop-blur border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-center min-w-[45px] z-30 group transition-all hover:border-blue-300 hover:shadow-md">
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
                   {Math.round(data.power)} <span className="text-xs font-normal text-slate-400">KW</span>
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
             <div className="flex flex-col gap-1 relative group/item">
                <div className="flex items-center justify-center gap-1">
                    <span className="text-[9px] text-slate-400">累计变化</span>
                    {/* 
                        FIX: 纯图标按钮，深色背景，无文字 
                        - w-5 h-5 控制尺寸
                        - bg-slate-700 深色背景
                        - text-white 白色图标
                        - TrendingUp size={12} 图标放大
                        - 移除 scale/transform 交互
                    */}
                    <button 
                       onClick={(e) => { e.stopPropagation(); onViewTrend && onViewTrend(); }}
                       className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white rounded shadow-sm transition-colors cursor-pointer"
                       title="查看趋势"
                    >
                       <TrendingUp size={12} strokeWidth={2.5} />
                    </button>
                </div>
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
const FunctionShortcuts = ({ onOpenFeed, onOpenTraceability }: { onOpenFeed: () => void, onOpenTraceability: () => void }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button 
         onClick={onOpenTraceability}
         className="relative group overflow-hidden bg-white border border-indigo-100 rounded-xl p-3 flex flex-col items-start gap-2 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 active:scale-[0.98]"
      >
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
      <button 
         onClick={onOpenFeed}
         className="relative group overflow-hidden bg-white border border-blue-100 rounded-xl p-3 flex flex-col items-start gap-2 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 active:scale-[0.98]"
      >
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
const CraftStandardCard = ({ onEdit }: { onEdit?: () => void }) => {
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
          {/* 编辑按钮：点击触发下发弹窗 */}
          <Edit3 
            size={14} 
            className="text-slate-400 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={onEdit} 
          />
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
const ProductionExceptionList = ({ onViewMore }: { onViewMore: () => void }) => {
  const [exceptions, setExceptions] = useState<ProductionExceptionRecord[]>([]);

  useEffect(() => {
    fetchProductionExceptions().then(res => setExceptions(res.data));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
       <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
             <AlertTriangle size={16} className="text-red-500"/> 生产异常
          </h3>
          <button 
            className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
            onClick={onViewMore}
          >
            查看更多 &gt;
          </button>
       </div>
       <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {exceptions.map(ex => (
             <div key={ex.id} className="bg-white border border-slate-100 rounded-lg p-3 text-xs hover:border-red-200 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-400">
                   <span className="font-mono">{ex.date}</span>
                   <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{ex.team}班</span>
                </div>
                <div className="font-bold text-slate-700 text-sm leading-tight">
                   {ex.description}
                </div>
                <div className="text-slate-400 flex items-center gap-1">
                   <Clock size={12}/> 持续时间: <span className="font-mono font-bold text-slate-600">{ex.duration}h</span>
                </div>
             </div>
          ))}
          {exceptions.length === 0 && (
             <div className="text-center text-slate-400 py-4 text-xs">暂无异常记录</div>
          )}
       </div>
    </div>
  );
};

// --- 11. ProcessAlerts ---
const ProcessAlerts = () => {
  const alerts = [
    {
      startDate: '09-27', startTime: '10:15', endTime: '10:20',
      startVal: 55.2, endVal: 54.0,
      isManual: true, isAuto: false, 
      exceptionType: '叩解度异常'
    },
    {
      startDate: '09-27', startTime: '09:30', endTime: '09:42',
      startVal: 0.76, endVal: 0.81,
      isManual: false, isAuto: true,
      exceptionType: '纤维长度异常'
    },
    {
      startDate: '09-27', startTime: '08:12', endTime: '08:18',
      startVal: 2.65, endVal: 2.80,
      isManual: true, isAuto: false,
      exceptionType: '纤维长度异常'
    },
    {
      startDate: '09-26', startTime: '23:50', endTime: '00:05',
      startVal: 52.8, endVal: 54.5,
      isManual: false, isAuto: true,
      exceptionType: '叩解度异常'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full p-3">
       <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
             <AlertCircle size={14} className="text-red-500" /> 工艺异常
          </span>
       </div>
       <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {alerts.map((item, i) => (
             <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100 relative group hover:shadow-sm transition-all">
                <div className="flex flex-col gap-1.5 flex-1">
                   <div className="flex items-center justify-between mr-2">
                      <div className="flex items-center text-[10px] text-slate-400 gap-2">
                         <span>{item.startDate} {item.startTime}</span>
                         <span className="text-slate-300">→</span>
                         <span>{item.endTime}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 rounded border scale-90 origin-right ${
                        item.exceptionType === '叩解度异常'
                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                         {item.exceptionType}
                      </span>
                   </div>

                   <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-700 text-sm">{item.startVal}</span>
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-500">
                        <ArrowRight size={10} strokeWidth={3} />
                      </div>
                      <span className="font-mono font-bold text-slate-700 text-sm">{item.endVal}</span>
                   </div>
                </div>
                
                <div className="flex flex-col gap-1 pl-2 border-l border-slate-200">
                   <div className={`p-1 rounded ${item.isManual ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-300 opacity-50'}`}>
                      <User size={12} />
                   </div>
                   <div className={`p-1 rounded ${item.isAuto ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300 opacity-50'}`}>
                      <RefreshCw size={12} /> 
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// --- 12. BladeHistoryList ---
const BladeHistoryList = ({ onViewMore }: { onViewMore: () => void }) => {
  const [logs, setLogs] = useState<KnifeChangeRecord[]>([]);

  useEffect(() => {
    fetchLatestKnifeChanges().then(res => setLogs(res.data));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3 px-1">
         <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
           <History size={16} className="text-blue-500"/> 换刀记录
         </h4>
         <button 
           className="text-[10px] text-slate-400 hover:text-blue-500 cursor-pointer"
           onClick={onViewMore}
         >
           查看更多 &gt;
         </button>
      </div>
      <div className="grid grid-cols-[90px_1fr_1fr_1fr_1fr_1fr] gap-1 px-3 mb-2 text-[10px] font-bold text-slate-400 text-center">
         <div className="text-left">时间</div>
         <div>1#</div>
         <div>2#</div>
         <div>3#</div>
         <div>4#</div>
         <div>5#</div>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="grid grid-cols-[90px_1fr_1fr_1fr_1fr_1fr] gap-1 items-center bg-white rounded border border-slate-100 py-2 px-3 text-[10px] hover:border-blue-300 transition-colors cursor-pointer group">
             <div className="flex flex-col text-left">
                <span className="font-bold text-slate-600 group-hover:text-blue-600">{log.date.slice(5)}</span> {/* 仅展示 MM-DD */}
                <span className="text-slate-400 scale-90 origin-left">{log.time}</span>
             </div>
             {[1,2,3,4,5].map(id => {
                const isChanged = log.changedDeviceIds.includes(id);
                // 映射对应的刀盘型号字段名
                const modelKey = `device${id}_knife` as keyof KnifeChangeRecord;
                const knifeModel = log[modelKey] as string;

                return (
                  <div key={id} className={`flex flex-col items-center justify-center rounded py-1.5 ${isChanged ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'text-slate-400'}`}>
                     {isChanged ? (
                        <div className="flex items-center gap-0.5">
                           <span className="font-bold text-xs">{knifeModel}</span>
                           <ArrowUp size={10} className="text-orange-400 animate-bounce"/> 
                        </div>
                     ) : (
                        <span className="scale-90 opacity-80">{knifeModel}</span>
                     )}
                  </div>
                );
             })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonitorDashboard = () => {
  // 状态：控制生产异常详情弹窗
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  // 状态：控制工艺指标下发弹窗
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  // 状态：控制换刀记录弹窗
  const [isKnifeChangeModalOpen, setIsKnifeChangeModalOpen] = useState(false);
  // 状态：控制物料投料弹窗 (新增)
  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
  // 状态：控制工艺回溯弹窗 (新增)
  const [isTraceabilityModalOpen, setIsTraceabilityModalOpen] = useState(false);
  
  // 新增：换刀操作相关状态
  const [targetDeviceForChange, setTargetDeviceForChange] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isKnifeSelectionModalOpen, setIsKnifeSelectionModalOpen] = useState(false);

  // 新增：父组件获取工艺配置，以同步设备转向
  const [deviceConfigs, setDeviceConfigs] = useState<ProcessIndicatorDeviceConfig[]>([]);

  // 新增：从后台管理数据源同步当前刀盘配置 (动态)
  const [currentKnives, setCurrentKnives] = useState<{ [key: string]: string }>({
    '1': 'Loading...',
    '2': 'Loading...',
    '3': 'Loading...',
    '4': 'Loading...',
    '5': 'Loading...'
  });

  // 新增：控制间隙趋势弹窗
  const [gapTrendData, setGapTrendData] = useState<{name: string, model: string} | null>(null);

  // 场景控制：随机全停机 与 高功率演示
  const [scenario, setScenario] = useState<{ allStopped: boolean; overloadTargetId: string | null }>({
    allStopped: false,
    overloadTargetId: null
  });

  // ... (Existing useEffects remain unchanged) ...
  useEffect(() => {
    // 初始加载工艺配置
    fetchCurrentProcessIndicator().then(res => {
      setDeviceConfigs(res.data.deviceConfigs);
    });

    // 关键修复：获取最新的换刀记录，以同步刀盘型号
    fetchLatestKnifeChanges(1).then(res => {
      if (res.data && res.data.length > 0) {
        const latest = res.data[0];
        setCurrentKnives({
          '1': latest.device1_knife,
          '2': latest.device2_knife,
          '3': latest.device3_knife,
          '4': latest.device4_knife,
          '5': latest.device5_knife,
        });
      }
    });

    // 随机生成演示场景：
    // 20% 概率全停机
    const isAllStopped = Math.random() < 0.2;
    let targetId = null;

    if (!isAllStopped) {
       // 如果非全停机，随机选择一台常开设备 (1, 2, 3, 5) 进行高功率演示
       // 新增：将 4# 也加入候选，因为它默认是 RUN 了
       const candidates = ['1', '2', '3', '4', '5'];
       const idx = Math.floor(Math.random() * candidates.length);
       targetId = candidates[idx];
    }
    
    setScenario({ allStopped: isAllStopped, overloadTargetId: targetId });
  }, []);

  // 换刀触发逻辑：第一步，点击触发，打开口令验证
  const initiateKnifeChange = (deviceId: string) => {
    setTargetDeviceForChange(deviceId);
    setIsPasswordModalOpen(true);
  };

  // 换刀逻辑：第二步，口令验证成功，打开选择弹窗
  const onPasswordVerified = () => {
    setIsPasswordModalOpen(false);
    setIsKnifeSelectionModalOpen(true);
  };

  // 换刀逻辑：第三步，选择并确认后，更新本地状态
  const onKnifeChangedSuccess = (newModel: string) => {
    if (targetDeviceForChange) {
      setCurrentKnives(prev => ({
        ...prev,
        [targetDeviceForChange]: newModel
      }));
    }
    setTargetDeviceForChange(null);
  };

  // 辅助函数：获取指定设备的转向配置，默认正转
  const getDeviceRotation = (id: string) => {
    const config = deviceConfigs.find(c => c.deviceId === id);
    return config?.rotation || '正转';
  };

  // 辅助函数：根据场景计算最终状态
  const getDeviceStatus = (defaultStatus: 'RUN' | 'STOP') => {
      if (scenario.allStopped) return 'STOP';
      return defaultStatus;
  };

  // Mock 数据：过去 30 分钟 (5分钟间隔，7个点)
  const freenessData = [
    { time: '10:00', value: 53.5 },
    { time: '10:05', value: 54.2 },
    { time: '10:10', value: 55.0 },
    { time: '10:15', value: 54.8 },
    { time: '10:20', value: 55.3 },
    { time: '10:25', value: 55.6 }, // T-5 (Last Measured)
  ];
  const currentFreenessSoft = 55.66; // T-0 (Soft Sensor)

  const fiberData = [
    { time: '10:00', value: 0.78 },
    { time: '10:05', value: 0.79 },
    { time: '10:10', value: 0.81 },
    { time: '10:15', value: 0.80 },
    { time: '10:20', value: 0.82 },
    { time: '10:25', value: 0.81 }, // T-5
  ];
  const currentFiberSoft = 0.82; // T-0

  return (
    <div className="h-full w-full flex flex-col font-sans text-slate-800">
      
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* 左侧边栏 - 20% */}
        <div className="col-span-2 flex flex-col gap-4 overflow-hidden h-full">
           <FunctionShortcuts 
              onOpenFeed={() => setIsFeedingModalOpen(true)} 
              onOpenTraceability={() => setIsTraceabilityModalOpen(true)} 
           />
           <ShiftInfoCard />
           <CraftStandardCard onEdit={() => setIsIndicatorModalOpen(true)} />
           <div className="flex-1 min-h-[200px] overflow-hidden">
              <ProductionExceptionList onViewMore={() => setIsExceptionModalOpen(true)} />
           </div>
        </div>

        {/* 右侧主内容 - 80% */}
        <div className="col-span-10 flex flex-col gap-4 overflow-hidden h-full">
          {/* ... (Main Content: Refiners and Charts remain unchanged) ... */}
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
                    <PipelineRefinerCard 
                        id="1" name="精浆" 
                        model={currentKnives['1']} // 动态绑定
                        status={getDeviceStatus('RUN')} 
                        assignedRotation={getDeviceRotation('1')}
                        simulateOverload={scenario.overloadTargetId === '1'}
                        isFirst={true}
                        onViewTrend={() => setGapTrendData({ name: '1# 精浆', model: currentKnives['1'] })}
                        onKnifeClick={() => initiateKnifeChange('1')} // 绑定换刀触发
                    />
                    <PipelineRefinerCard 
                        id="2" name="精浆" 
                        model={currentKnives['2']} // 动态绑定
                        status={getDeviceStatus('RUN')} 
                        assignedRotation={getDeviceRotation('2')}
                        simulateOverload={scenario.overloadTargetId === '2'}
                        onViewTrend={() => setGapTrendData({ name: '2# 精浆', model: currentKnives['2'] })}
                        onKnifeClick={() => initiateKnifeChange('2')} // 绑定换刀触发
                    />
                    <PipelineRefinerCard 
                        id="3" name="精浆" 
                        model={currentKnives['3']} // 动态绑定
                        status={getDeviceStatus('RUN')} 
                        assignedRotation={getDeviceRotation('3')}
                        simulateOverload={scenario.overloadTargetId === '3'}
                        onViewTrend={() => setGapTrendData({ name: '3# 精浆', model: currentKnives['3'] })}
                        onKnifeClick={() => initiateKnifeChange('3')} // 绑定换刀触发
                    />
                    <PipelineRefinerCard 
                        id="4" name="精浆" 
                        model={currentKnives['4']} // 动态绑定
                        status={getDeviceStatus('RUN')} 
                        assignedRotation={getDeviceRotation('4')}
                        simulateOverload={scenario.overloadTargetId === '4'}
                        onViewTrend={() => setGapTrendData({ name: '4# 精浆', model: currentKnives['4'] })}
                        onKnifeClick={() => initiateKnifeChange('4')} // 绑定换刀触发
                    />
                    <PipelineRefinerCard 
                        id="5" name="精浆" 
                        model={currentKnives['5']} // 动态绑定
                        status={getDeviceStatus('RUN')} 
                        assignedRotation={getDeviceRotation('5')}
                        simulateOverload={scenario.overloadTargetId === '5'}
                        isLast={true}
                        onViewTrend={() => setGapTrendData({ name: '5# 精浆', model: currentKnives['5'] })}
                        onKnifeClick={() => initiateKnifeChange('5')} // 绑定换刀触发
                    />
                 </div>
                 <MainOutletNode />
             </div>
          </section>

          {/* 下半部分：趋势与记录 */}
          <div className="flex gap-4 h-[280px] flex-none">
             {/* 趋势图 (独立卡片) */}
             <section className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <Activity className="text-emerald-500" size={18}/> 工艺测量值趋势
                   </h3>
                   <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 叩解度</div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 纤维长度</div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200"><span className="w-3 h-0.5 border-t-2 border-dotted border-slate-400"></span> 软测量 (预测)</div>
                   </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                   {/* 叩解度图表 */}
                   <TrendChart 
                      title="叩解度" 
                      unit="°SR" 
                      color="#a855f7" 
                      lightColor="#f3e8ff"
                      currentSoftValue={currentFreenessSoft} 
                      dataHistory={freenessData} 
                      standardValue={54}
                      standardDev={1}
                   />
                   {/* 纤维长度图表 */}
                   <TrendChart 
                      title="纤维长度" 
                      unit="mm" 
                      color="#f97316" 
                      lightColor="#ffedd5"
                      currentSoftValue={currentFiberSoft} 
                      dataHistory={fiberData} 
                      standardValue={0.80}
                      standardDev={0.05}
                   />
                </div>
             </section>
             
             {/* 异常列表 (独立卡片) */}
             <div className="w-[280px] shrink-0">
                <ProcessAlerts />
             </div>
             
             {/* 换刀记录 (独立卡片) */}
             <section className="w-[450px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <BladeHistoryList onViewMore={() => setIsKnifeChangeModalOpen(true)} />
             </section>
          </div>
        </div>
      </div>

      {/* 弹窗层 */}
      {isExceptionModalOpen && (
        <ProductionExceptionModal onClose={() => setIsExceptionModalOpen(false)} />
      )}
      {isIndicatorModalOpen && (
        <ProcessIndicatorModal onClose={() => setIsIndicatorModalOpen(false)} />
      )}
      {isKnifeChangeModalOpen && (
        <KnifeChangeRecordModal onClose={() => setIsKnifeChangeModalOpen(false)} />
      )}
      {/* 新增：间隙趋势弹窗 */}
      {gapTrendData && (
        <GapTrendModal 
          deviceName={gapTrendData.name}
          knifeModel={gapTrendData.model}
          onClose={() => setGapTrendData(null)} 
        />
      )}
      {/* 新增：物料投料弹窗 */}
      {isFeedingModalOpen && (
        <MaterialFeedingModal onClose={() => setIsFeedingModalOpen(false)} />
      )}
      
      {/* 新增：工艺回溯弹窗 */}
      {isTraceabilityModalOpen && (
        <ProcessTraceabilityModal onClose={() => setIsTraceabilityModalOpen(false)} />
      )}
      
      {/* 换刀流程弹窗 */}
      {isPasswordModalOpen && (
        <PasswordVerificationModal 
          onSuccess={onPasswordVerified}
          onClose={() => { setIsPasswordModalOpen(false); setTargetDeviceForChange(null); }}
        />
      )}
      {isKnifeSelectionModalOpen && targetDeviceForChange && (
        <KnifeSelectionModal
          targetDeviceId={targetDeviceForChange}
          onClose={() => { setIsKnifeSelectionModalOpen(false); setTargetDeviceForChange(null); }}
          onSuccess={onKnifeChangedSuccess}
        />
      )}
    </div>
  );
};
