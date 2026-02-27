
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { 
  fetchTwinStages, 
  fetchTwinMachines, 
  fetchStabilityDistribution, 
  fetchOptimalStartupTime, 
  fetchTrendData, 
  fetchQualifiedRates, 
  fetchShiftAbnormalStats, 
  TwinMachineStatus,
  TwinStageData
} from '../../services/twinService';
import { fetchProductionExceptions } from '../../services/monitorMockService';
import { DailyTeamQualifiedRate, ProductionExceptionRecord } from '../../types';
import { AlertCircle, Activity, Zap, Droplet, Layers, Timer, CheckCircle, Clock, List } from 'lucide-react';

// --- Sub-Components ---

// 1. 左侧阶段卡片 - 视觉修正版
const StageCard: React.FC<{ data: TwinStageData; isNext?: boolean }> = ({ data, isNext }) => {
  // 计算偏差 (简单逻辑)
  const freenessDev = (data.freeness.max - data.freeness.min) / 2;
  const fiberDev = (data.fiberLength.max - data.fiberLength.min) / 2;
  
  // 1. 数值颜色回归 (Values Back to Accent Colors)
  // 当前阶段用亮绿色，下阶段用亮紫色
  const valueColor = isNext ? 'text-[#a78bfa]' : 'text-[#34d399]'; 
  
  // 2. 标签颜色改为白色 (Labels to White)
  const labelClass = "text-[10px] font-bold text-white opacity-80 tracking-wide"; // 字体稍小

  // 装饰条颜色
  const barBg = isNext ? 'bg-purple-500' : 'bg-emerald-500';
  const glowShadow = isNext ? 'shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'shadow-[0_0_10px_rgba(16,185,129,0.4)]';

  // 时间拆分
  const [dateStr, timeStr] = data.time.split(' ');

  // 格式化标题文字 (换行处理)
  const titleChars = data.title.length > 2 
    ? [data.title.substring(0, 2), data.title.substring(2)] 
    : [data.title, ''];

  return (
    <div className="flex items-stretch gap-3 mb-6 select-none group relative pl-1">
      {/* 左侧：垂直标题与装饰条 */}
      <div className="w-8 flex flex-col items-center shrink-0 pt-1">
         <span className="text-sm font-black italic text-white/80 leading-tight tracking-widest drop-shadow-md text-center opacity-70">
            {titleChars[0]}<br/>{titleChars[1]}
         </span>
         {/* 装饰光条 */}
         <div className={`w-1 h-10 mt-2 rounded-full ${barBg} ${glowShadow} opacity-80`}></div>
      </div>

      {/* 右侧：数据内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
         
         {/* 1. 时间行 (保持白色大字体) */}
         <div className="flex items-baseline gap-2 mb-2 border-b border-white/10 pb-1">
            <span className="text-2xl font-bold font-mono text-white tracking-tighter leading-none drop-shadow-sm">
               {timeStr}
            </span>
            <span className="text-[10px] text-white/40 font-mono font-medium tracking-wide">
               {dateStr}
            </span>
         </div>
         
         {/* 2. 核心指标行 - 紧凑布局 */}
         <div className="flex items-start gap-3">
            
            {/* 产品代号 */}
            <div className="flex flex-col gap-0.5 min-w-[50px]">
               <span className={labelClass}>产品代号</span>
               <span className={`text-2xl font-black italic leading-none tracking-tighter drop-shadow-md ${valueColor}`}>
                  {data.productCode}
               </span>
            </div>

            {/* 叩解度 */}
            <div className="flex flex-col gap-0.5 pl-3 border-l border-white/10">
               <span className={labelClass}>叩解度</span>
               <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold font-mono leading-none ${valueColor}`}>
                    {data.freeness.value}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 -translate-y-0.5">
                    ±{freenessDev}
                  </span>
               </div>
            </div>

            {/* 纤维长度 */}
            <div className="flex flex-col gap-0.5 pl-3 border-l border-white/10">
               <span className={labelClass}>纤维长度</span>
               <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold font-mono leading-none ${valueColor}`}>
                    {data.fiberLength.value}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 -translate-y-0.5">
                    ±{fiberDev.toFixed(1)}
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// 2. 趋势图组件 (适配孪生风格：白色文字、透明背景)
const TwinTrendChart: React.FC<{ 
  title: string; 
  unit: string; 
  color: string; 
  lightColor: string; 
  currentSoftValue: number; 
  dataHistory: { time: string; value: number }[]; 
  standardValue?: number; 
  standardDev?: number;
  className?: string;
}> = ({ 
  title, 
  unit, 
  color, 
  lightColor, 
  currentSoftValue, 
  dataHistory,
  standardValue,
  standardDev,
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }
    const chart = instanceRef.current;

    // 构造时间轴 (包含未来预测点)
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
    
    // 实线数据
    const solidData = measureValues; 
    
    // 虚线数据 (连接最后一点 -> 软测量)
    const dashedData = [
      ...Array(measureValues.length - 1).fill(undefined), 
      measureValues[measureValues.length - 1], 
      currentSoftValue
    ];

    // 计算 Y 轴范围
    let yMin = Math.min(...measureValues, currentSoftValue);
    let yMax = Math.max(...measureValues, currentSoftValue);
    if (standardValue !== undefined && standardDev !== undefined) {
      yMin = Math.min(yMin, standardValue - standardDev);
      yMax = Math.max(yMax, standardValue + standardDev);
    }
    const padding = (yMax - yMin) * 0.2;
    // 防止除零
    if (padding === 0) { yMin -= 1; yMax += 1; } 
    else { yMin -= padding; yMax += padding; }

    const option: echarts.EChartsOption = {
      grid: { top: 30, right: 10, bottom: 5, left: 5, containLabel: true },
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: (params: any) => {
          // 适配暗色主题的 Tooltip
          let html = `<div class="text-xs font-sans bg-black/90 p-1">
            <div class="text-slate-400 mb-1">${params[0].axisValue}</div>`;
          params.forEach((p: any) => {
             if (p.value !== undefined) {
               const displayName = p.seriesName.includes('软测量') ? '软测量 (预测)' : p.seriesName;
               html += `<div class="flex items-center gap-2">
                 <span class="w-1.5 h-1.5 rounded-full" style="background:${p.color}"></span>
                 <span class="text-slate-300">${displayName}:</span>
                 <span class="font-bold text-white">${p.value}</span>
               </div>`;
             }
          });
          html += `</div>`;
          return html;
        },
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, interval: 1 } // 白色半透明文字
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } }, // 白色虚线网格
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, formatter: (v: number) => v.toFixed(unit === 'mm' ? 2 : 0) } 
      },
      series: [
        {
          name: '测量值',
          type: 'line',
          data: [...solidData, undefined],
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color },
              { offset: 1, color: 'transparent' }
            ]),
            opacity: 0.15
          },
          markArea: (standardValue !== undefined && standardDev !== undefined) ? {
             silent: true,
             itemStyle: { color: lightColor, opacity: 0.1 }, 
             data: [[{ yAxis: standardValue - standardDev }, { yAxis: standardValue + standardDev }]]
          } : undefined
        },
        {
          name: '软测量',
          type: 'line',
          data: dashedData,
          smooth: true,
          showSymbol: true,
          symbol: 'emptyCircle',
          symbolSize: 4,
          itemStyle: { color: color, borderColor: color, borderWidth: 2 },
          lineStyle: { width: 2, color: color, type: 'dashed' },
          z: 10
        }
      ]
    };

    chart.setOption(option);
    // Use requestAnimationFrame to avoid ResizeObserver loop limit exceeded
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => chart.resize()));
    resizeObserver.observe(chartRef.current);
    return () => { resizeObserver.disconnect(); chart.dispose(); instanceRef.current = null; };
  }, [dataHistory, currentSoftValue, color, lightColor, standardValue, standardDev]);

  // 修改：移除固定高度 h-[230px]，改为 flex-1 自适应，并接收外部 className
  return (
    <div className={`relative bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex flex-col ${className}`}>
       <div className="absolute top-2 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          <div className="text-xs font-bold text-slate-300">{title}</div>
          <div className="flex flex-col items-end">
             <div className="text-[9px] text-slate-500">当前软测量</div>
             <div className="text-sm font-mono font-bold px-1.5 rounded" style={{ color: color }}>
               {currentSoftValue} <span className="text-[9px] scale-90">{unit}</span>
             </div>
          </div>
       </div>
       <div ref={chartRef} className="w-full h-full pt-4"></div>
    </div>
  );
};

// 3. 3D 设备卡片 (悬浮) - Ultra-Transparent iOS Style
const MachineCard = ({ data }: { data: TwinMachineStatus }) => (
  <div className="absolute transform -translate-x-1/2 -translate-y-full pb-8 group cursor-pointer transition-all duration-500 ease-out hover:-translate-y-[calc(100%+10px)]"
       style={{ top: '60%', left: '50%' }}>
    
    {/* 锚点连接线 - 极其微弱的连接 */}
    <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white/30 rounded-full -translate-x-1/2 shadow-[0_0_8px_rgba(255,255,255,0.2)]"></div>

    {/* 卡片主体 - Ultra-Transparent iOS Style */}
    {/* 调整：背景透明度调至极低 (bg-black/10), 模糊度适中 (backdrop-blur-md) 以保持通透感 */}
    <div className="w-[180px] bg-black/10 backdrop-blur-md border border-white/5 rounded-2xl p-3 shadow-lg transition-all duration-300 hover:bg-black/30 hover:border-white/10 hover:shadow-2xl hover:scale-105 relative overflow-hidden group-hover:backdrop-blur-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-white/90 text-xs tracking-wide drop-shadow-sm">{data.name}</span>
            <div className={`flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'run' ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : 'bg-red-400'}`}></div>
                <span className={`text-[10px] font-medium leading-none ${data.status === 'run' ? 'text-green-300' : 'text-red-300'}`}>
                    {data.status === 'run' ? '运行' : '停机'}
                </span>
            </div>
        </div>
        
        {/* Divider - Extremely subtle */}
        <div className="h-px w-full bg-white/5 mb-2"></div>

        {/* Model Info */}
        <div className="mb-2">
            <div className="text-[9px] text-white/40 mb-0.5">刀盘型号</div>
            <div className="text-xs text-white/90 font-medium truncate tracking-tight drop-shadow-sm">{data.model}</div>
        </div>

        {/* 2x2 Grid for Metrics - Enhanced contrast for text */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[10px]">
           <div>
              <div className="text-white/50 scale-90 origin-left">入口压力</div>
              <div className="font-mono text-white font-medium drop-shadow-sm">{data.pressureIn}</div>
           </div>
           <div className="text-right">
              <div className="text-white/50 scale-90 origin-right">出口压力</div>
              <div className="font-mono text-white font-medium drop-shadow-sm">{data.pressureOut}</div>
           </div>
           <div>
              <div className="text-white/50 scale-90 origin-left">压差</div>
              <div className="font-mono text-cyan-300 font-medium drop-shadow-sm">{data.diff}</div>
           </div>
           <div className="text-right">
              <div className="text-white/50 scale-90 origin-right">间隙</div>
              <div className="font-mono text-orange-300 font-medium drop-shadow-sm">{data.gap}</div>
           </div>
        </div>

        {/* Footer: Power */}
        <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-end">
            <span className="text-[9px] text-white/40">功率</span>
            <div className="font-mono text-yellow-400 text-xs font-semibold drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                {data.power} <span className="text-[8px] opacity-60 text-white">KW</span>
            </div>
        </div>
    </div>
  </div>
);

// 4. 通用图表容器 - 样式统一更新
// 修改：支持 contentClass 属性以控制内边距，默认 p-2
const ChartBox = ({ title, icon: Icon, children, className = '', height = 'h-full', contentClass = 'p-2' }: any) => (
  <div className={`flex flex-col ${className} ${height}`}>
    {/* Header: 统一左侧 HUD 风格 */}
    <div className="flex items-center gap-2 mb-2 pl-1 flex-shrink-0">
        {Icon && <Icon size={18} className="text-blue-500" />}
        <span className="text-lg font-bold text-white tracking-widest text-shadow-sm">{title}</span>
    </div>
    {/* Content: 半透明背景容器 */}
    <div className={`flex-1 min-h-0 relative bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex flex-col ${contentClass}`}>
      {children}
    </div>
  </div>
);

// --- Main Page Component ---

const TwinDashboard: React.FC = () => {
  // State
  const [stages, setStages] = useState<TwinStageData[]>([]);
  const [machines, setMachines] = useState<TwinMachineStatus[]>([]);
  const [stabilityData, setStabilityData] = useState<any[]>([]);
  const [optimalTimeData, setOptimalTimeData] = useState<any[]>([]);
  
  // Update: use DailyTeamQualifiedRate[] from entity
  const [qualifiedRates, setQualifiedRates] = useState<DailyTeamQualifiedRate[]>([]);
  const [shiftAbnormal, setShiftAbnormal] = useState<any[]>([]);
  const [abnormalList, setAbnormalList] = useState<ProductionExceptionRecord[]>([]);

  // Refs for Charts
  const stabilityRef = useRef<HTMLDivElement>(null);
  const optimalTimeRef = useRef<HTMLDivElement>(null);
  // 拆分为两个 Ref
  const freenessRateRef = useRef<HTMLDivElement>(null);
  const fiberRateRef = useRef<HTMLDivElement>(null);
  
  const shiftAbnormalRef = useRef<HTMLDivElement>(null);

  // Mock Data for Trends (Synced with Monitor Dashboard)
  const freenessHistory = [
    { time: '10:00', value: 53.5 },
    { time: '10:05', value: 54.2 },
    { time: '10:10', value: 55.0 },
    { time: '10:15', value: 54.8 },
    { time: '10:20', value: 55.3 },
    { time: '10:25', value: 55.6 },
  ];
  const currentFreenessSoft = 55.66;

  const fiberHistory = [
    { time: '10:00', value: 0.78 },
    { time: '10:05', value: 0.79 },
    { time: '10:10', value: 0.81 },
    { time: '10:15', value: 0.80 },
    { time: '10:20', value: 0.82 },
    { time: '10:25', value: 0.81 },
  ];
  const currentFiberSoft = 0.82;

  // Load Data
  useEffect(() => {
    fetchTwinStages().then(res => setStages(res.data));
    fetchTwinMachines().then(res => setMachines(res.data));
    fetchStabilityDistribution().then(res => setStabilityData(res.data));
    fetchOptimalStartupTime().then(res => setOptimalTimeData(res.data));
    // trendData fetches removed as we use hardcoded history for demo consistency
    fetchQualifiedRates().then(res => setQualifiedRates(res.data));
    fetchShiftAbnormalStats().then(res => setShiftAbnormal(res.data));
    fetchProductionExceptions().then(res => setAbnormalList(res.data));
  }, []);

  // Initialize Charts
  useEffect(() => {
    // 调整图表轴线颜色为更暗的颜色，适应无边框风格
    const axisLineColor = 'rgba(255,255,255,0.1)'; 
    const splitLineColor = 'rgba(255,255,255,0.05)';
    const textColor = 'rgba(255,255,255,0.4)';
    const tooltipStyle = { backgroundColor: '#000', borderColor: '#333', textStyle: { color: '#fff', fontSize: 10 }, padding: 8 };
    const resizeObservers: ResizeObserver[] = [];

    // 1. Stability Pie (Right Top) - 修正：居中显示，使用环形图风格
    if (stabilityRef.current && stabilityData.length) {
      const chart = echarts.init(stabilityRef.current);
      chart.setOption({
        tooltip: { ...tooltipStyle, trigger: 'item' },
        legend: { show: false },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'], // 环形图，内径加大
          center: ['50%', '55%'], // 修正：完全水平居中，垂直略下移以避开标题
          itemStyle: { borderRadius: 5, borderColor: '#000', borderWidth: 2 },
          label: { 
              show: true, 
              position: 'outside', 
              color: '#ccc', 
              fontSize: 10, 
              formatter: '{b}\n{c}次' // 格式修正：添加"次"
          },
          labelLine: { length: 10, length2: 10, lineStyle: { color: '#444' } },
          data: stabilityData.map(d => ({ value: d.value, name: d.label, itemStyle: { color: d.color } }))
        }]
      });
      // Add ResizeObserver for robustness
      const ro = new ResizeObserver(() => {
          requestAnimationFrame(() => chart.resize());
      });
      ro.observe(stabilityRef.current);
      resizeObservers.push(ro);
    }

    // 2. Optimal Time Bar (Right Middle)
    if (optimalTimeRef.current && optimalTimeData.length) {
      const chart = echarts.init(optimalTimeRef.current);
      chart.setOption({
        tooltip: { ...tooltipStyle, trigger: 'axis' },
        grid: { top: 10, bottom: 20, left: 30, right: 10 },
        xAxis: { 
          type: 'category', 
          data: optimalTimeData.map(d => d.label),
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { color: textColor, fontSize: 9 }
        },
        yAxis: { 
          type: 'value', 
          splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
          axisLabel: { color: textColor, fontSize: 9 }
        },
        series: [{
          type: 'bar',
          barWidth: '60%',
          data: optimalTimeData.map(d => d.value),
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#3b82f6'}, {offset: 1, color: 'rgba(59,130,246,0.1)'}]) }
        }]
      });
      const ro = new ResizeObserver(() => {
          requestAnimationFrame(() => chart.resize());
      });
      ro.observe(optimalTimeRef.current);
      resizeObservers.push(ro);
    }

    // 4. Bottom Center: Qualified Rates (Split into 2 charts)
    // Update logic: map data from DailyTeamQualifiedRate[] entities
    if (qualifiedRates && qualifiedRates.length > 0) {
        // Extract data arrays from Entity list
        const dates = qualifiedRates.map(item => item.date.slice(5)); // Extract MM-DD
        const freenessData = qualifiedRates.map(item => item.freeness.total);
        const fiberData = qualifiedRates.map(item => item.fiberLength.total);

        // Chart A: Freeness
        if (freenessRateRef.current) {
            // Dispose logic to prevent double init if strict mode
            const chartA = echarts.getInstanceByDom(freenessRateRef.current) || echarts.init(freenessRateRef.current);
            chartA.setOption({
                title: { 
                    text: '叩解度', 
                    left: 'center', 
                    top: 10, 
                    textStyle: { color: '#94a3b8', fontSize: 10, fontWeight: 'normal' } 
                },
                tooltip: { ...tooltipStyle, trigger: 'axis' },
                // FIX: Tighten grid to fill the container completely
                grid: { top: 30, bottom: 5, left: 5, right: 15, containLabel: true },
                xAxis: { 
                    type: 'category', 
                    data: dates,
                    axisLine: { lineStyle: { color: axisLineColor } },
                    axisLabel: { color: textColor, fontSize: 8, interval: 1 }
                },
                yAxis: { 
                    type: 'value', 
                    min: 90,
                    splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
                    axisLabel: { show: false } 
                },
                series: [{ 
                    name: '叩解度', 
                    type: 'line', 
                    data: freenessData, 
                    smooth: true, 
                    itemStyle: { color: '#34d399' }, 
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#34d399'}, {offset: 1, color: 'transparent'}]),
                        opacity: 0.1
                    },
                    symbolSize: 4 
                }]
            });
            // CRITICAL FIX: Add ResizeObserver specifically for this chart
            const roA = new ResizeObserver(() => {
                requestAnimationFrame(() => chartA.resize());
            });
            roA.observe(freenessRateRef.current);
            resizeObservers.push(roA);
        }

        // Chart B: Fiber Length
        if (fiberRateRef.current) {
            const chartB = echarts.getInstanceByDom(fiberRateRef.current) || echarts.init(fiberRateRef.current);
            chartB.setOption({
                title: { 
                    text: '纤维长度', 
                    left: 'center', 
                    top: 10, 
                    textStyle: { color: '#94a3b8', fontSize: 10, fontWeight: 'normal' } 
                },
                tooltip: { ...tooltipStyle, trigger: 'axis' },
                // FIX: Tighten grid to fill the container completely
                grid: { top: 30, bottom: 5, left: 5, right: 15, containLabel: true },
                xAxis: { 
                    type: 'category', 
                    data: dates,
                    axisLine: { lineStyle: { color: axisLineColor } },
                    axisLabel: { color: textColor, fontSize: 8, interval: 1 }
                },
                yAxis: { 
                    type: 'value', 
                    min: 90,
                    splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
                    axisLabel: { show: false }
                },
                series: [{ 
                    name: '纤维长度', 
                    type: 'line', 
                    data: fiberData, 
                    smooth: true, 
                    itemStyle: { color: '#60a5fa' }, 
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#60a5fa'}, {offset: 1, color: 'transparent'}]),
                        opacity: 0.1
                    },
                    symbolSize: 4 
                }]
            });
            // CRITICAL FIX: Add ResizeObserver specifically for this chart
            const roB = new ResizeObserver(() => {
                requestAnimationFrame(() => chartB.resize());
            });
            roB.observe(fiberRateRef.current);
            resizeObservers.push(roB);
        }
    }

    // 5. Bottom Right: Shift Abnormal Pie
    if (shiftAbnormalRef.current && shiftAbnormal.length) {
      const chart = echarts.init(shiftAbnormalRef.current);
      chart.setOption({
        tooltip: { ...tooltipStyle, trigger: 'item' },
        legend: { show: false }, // Hide Legend
        series: [{
          type: 'pie',
          radius: ['45%', '70%'], // Donut style
          center: ['50%', '55%'], // Centered
          itemStyle: { borderRadius: 5, borderColor: '#000', borderWidth: 2 }, // Rounded sectors
          label: { 
            show: true, 
            position: 'outside', 
            color: '#ccc', 
            fontSize: 10,
            formatter: (params: any) => params.name.replace(' ', '\n') // Format: "Name\nDuration"
          },
          labelLine: { length: 10, length2: 10, lineStyle: { color: '#444' } },
          data: shiftAbnormal.map(d => ({ value: d.value, name: d.label, itemStyle: { color: d.color } }))
        }]
      });
      const ro = new ResizeObserver(() => {
          requestAnimationFrame(() => chart.resize());
      });
      ro.observe(shiftAbnormalRef.current);
      resizeObservers.push(ro);
    }

    return () => {
        resizeObservers.forEach(ro => ro.disconnect());
    };

  }, [stabilityData, optimalTimeData, qualifiedRates, shiftAbnormal]);

  return (
    <div className="w-full h-full bg-black text-slate-100 overflow-hidden relative font-sans select-none">
      
      {/* ================= BACKGROUND LAYER ================= */}
      <div className="absolute inset-0 z-0 bg-black">
         <div 
            className="absolute z-0"
            style={{ 
               top: '0px',     
               bottom: '260px', 
               left: '360px',
               right: '340px',
            }}
         >
             {/* 1. 底层图片 */}
             <div 
                className="absolute inset-0 w-full h-full"
                style={{
                   backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop")',
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                }}
             ></div>

             {/* 2. 顶层渐变遮罩 (Enhanced Gradient Vignette) */}
             <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                   background: `
                      linear-gradient(to right, #000 0%, transparent 5%, transparent 95%, #000 100%),
                      linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.85) 12%, rgba(0,0,0,0.4) 20%, transparent 35%, transparent 85%, #000 100%)
                   `
                }}
             ></div>
         </div>
      </div>

      {/* ================= 顶部中央通知 (z-30) ================= */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
         <div className="bg-black/90 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
            <AlertCircle size={16} className="text-yellow-500 animate-pulse" />
            <span className="text-sm font-bold tracking-wide text-white">当前叩解度高于标准值，建议适当降低磨浆功率</span>
         </div>
      </div>

      {/* ================= 3D设备层 (z-10: 位于 HUD z-20 之下) ================= */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
             {machines.map((m, i) => {
                 // 恢复较宽的分布，允许设备卡片延伸到左右图表区域下方
                 // 之前缩进到 32% (i*9)，现在恢复到更宽的 25% (i*12.5) 以填满空间
                 const leftPos = 25 + i * 12.5; 
                 return (
                    <div key={m.id} className="absolute" style={{ top: '45%', left: `${leftPos}%` }}>
                        <MachineCard data={m} />
                    </div>
                 );
              })}
          </div>
      </div>

      {/* ================= HUD LAYOUT (z-20: 覆盖在设备之上) ================= */}
      
      {/* 1. 左侧面板 (HUD) - 垂直高度自适应布局 (Top to Bottom-4) */}
      <div className="absolute top-36 left-6 bottom-4 w-[340px] z-20 flex flex-col pointer-events-none">
         
         {/* Top Section: 工艺标准 (Fixed Height Content) */}
         <div className="flex-shrink-0 pointer-events-auto">
            {/* 模块标题 [工艺标准] */}
            <div className="flex items-center gap-2 mb-2 pl-1">
                <Layers size={18} className="text-blue-500" />
                <span className="text-lg font-bold text-white tracking-widest text-shadow-sm">工艺标准</span>
            </div>

            {/* 阶段卡片 */}
            {stages.map((stage, idx) => (
                <StageCard key={idx} data={stage} isNext={idx > 0} />
            ))}
         </div>

         {/* Middle Section: 新增标题与间距 (Spacing + Title) */}
         <div className="mt-8 mb-3 flex items-center gap-2 pl-1 animate-in slide-in-from-left-4 duration-500 pointer-events-auto">
            <Activity size={18} className="text-purple-500" />
            <span className="text-lg font-bold text-white tracking-widest text-shadow-sm">工艺测量值趋势</span>
         </div>

         {/* Bottom Section: 趋势图 (Flexible Height to fill down to bottom-4) */}
         <div className="flex-1 flex flex-col gap-3 min-h-0 pointer-events-auto">
            <TwinTrendChart 
                title="叩解度测量值" 
                unit="°SR" 
                color="#a855f7" 
                lightColor="#a855f7" 
                currentSoftValue={currentFreenessSoft} 
                dataHistory={freenessHistory} 
                standardValue={54} 
                standardDev={1}
                className="flex-1" // 自动填充一半高度
            />
            <TwinTrendChart 
                title="纤维长度测量值" 
                unit="mm" 
                color="#f97316" 
                lightColor="#f97316"
                currentSoftValue={currentFiberSoft} 
                dataHistory={fiberHistory} 
                standardValue={0.80} 
                standardDev={0.05}
                className="flex-1" // 自动填充另一半高度
            />
         </div>
      </div>

      {/* 2. 右侧面板 (HUD) - 背景纯黑 - 布局调整：填满垂直空间 */}
      <div className="absolute top-20 right-4 w-[320px] bottom-[260px] z-20 flex flex-col gap-4 pointer-events-none">
         <ChartBox title="开机稳定时间分布" icon={Timer} height="flex-1" className="pointer-events-auto min-h-0">
            <div ref={stabilityRef} className="w-full h-full" />
         </ChartBox>
         
         <ChartBox title="最优开机时间" icon={Zap} height="flex-1" className="pointer-events-auto min-h-0">
            <div ref={optimalTimeRef} className="w-full h-full" />
         </ChartBox>
      </div>

      {/* 3. 底部面板 (GRID 布局) - 调整为 4 列网格以分配宽度 */}
      {/* 保持 left-[370px] 以避开左侧面板，bottom-4 确保对齐 */}
      <div className="absolute bottom-4 left-[370px] right-4 h-[240px] z-20 grid grid-cols-4 gap-4">
         
         {/* Col 1 (原 Col 2): 合格率统计 - 拆分为两个图表 - 占据 2 列宽度 (50%) */}
         {/* 修改：contentClass="p-0" 移除内边距，最大化空间 */}
         <ChartBox title="合格率统计" icon={CheckCircle} contentClass="p-0" className="col-span-2">
            <div className="flex h-full w-full">
                {/* 叩解度合格率 */}
                <div className="flex-1 flex flex-col border-r border-white/5 relative overflow-hidden">
                    {/* 移除：顶部汇总统计 Header */}
                    <div ref={freenessRateRef} className="absolute inset-0 w-full h-full" />
                </div>
                
                {/* 纤维长度合格率 */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* 移除：顶部汇总统计 Header */}
                    <div ref={fiberRateRef} className="absolute inset-0 w-full h-full" />
                </div>
            </div>
         </ChartBox>

         {/* Col 2 (原 Col 3): 班组异常时长 - 占据 1 列宽度 (25%) */}
         <ChartBox title="班组累计工艺异常时长" icon={Clock}>
            <div ref={shiftAbnormalRef} className="w-full h-full" />
         </ChartBox>

         {/* Col 3 (原 Col 4): 异常列表 - 占据 1 列宽度 (25%) */}
         <ChartBox title="生产异常" icon={List}>
            <div className="overflow-auto custom-scrollbar h-full pr-1">
               <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="text-slate-500 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-sm">
                     <tr>
                        <th className="pb-1 pl-1 font-normal whitespace-nowrap">序号</th>
                        <th className="pb-1 font-normal whitespace-nowrap">时间</th>
                        <th className="pb-1 font-normal">异常情况描述</th>
                        <th className="pb-1 font-normal whitespace-nowrap text-right">持续时间</th>
                     </tr>
                  </thead>
                  <tbody className="text-slate-300">
                     {abnormalList.map((item, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                           <td className="py-2 pl-1 text-slate-600 font-mono">{item.id}</td>
                           <td className="py-2 font-mono text-blue-500 whitespace-nowrap">{item.date}</td>
                           <td className="py-2 truncate max-w-[120px]" title={item.description}>{item.description}</td>
                           <td className="py-2 text-right font-mono text-orange-400 whitespace-nowrap">{item.duration}h</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </ChartBox>

      </div>

    </div>
  );
};

export default TwinDashboard;
