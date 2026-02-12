
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
  fetchAbnormalRecords,
  TwinMachineStatus,
  TwinStageData
} from '../../services/twinService';
import { AlertCircle, Activity, Zap, Droplet } from 'lucide-react';

// --- Sub-Components ---

// 1. 左侧阶段卡片 - 去除卡片背景，保持无边框风格
const StageCard: React.FC<{ data: TwinStageData; isNext?: boolean }> = ({ data, isNext }) => {
  // 计算偏差 (简单逻辑)
  const freenessDev = (data.freeness.max - data.freeness.min) / 2;
  const fiberDev = (data.fiberLength.max - data.fiberLength.min) / 2;
  
  // 颜色主题
  const themeColor = isNext ? 'text-[#8b5cf6]' : 'text-[#10b981]'; // Purple for next, Green for current
  const titleColor = 'text-white';
  
  // 样式：透明背景，仅保留布局结构
  const containerClass = "flex-1 bg-transparent relative"; 
  // 时间栏：改为底部微弱边框，去除深色背景块
  const timeHeaderClass = "py-1 px-2 text-center border-b border-white/10 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent";

  // 格式化标题文字 (换行)
  const titleChars = data.title.length > 2 
    ? [data.title.substring(0, 2), data.title.substring(2)] 
    : [data.title, ''];

  return (
    <div className="flex items-stretch gap-3 mb-6 select-none group">
      {/* 左侧标题 */}
      <div className="w-12 flex flex-col justify-center items-center shrink-0">
         <span className={`text-lg font-black italic tracking-widest leading-tight ${titleColor} opacity-90 drop-shadow-md`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {titleChars[0]}<br/>{titleChars[1]}
         </span>
         {/* 装饰线：增加视觉引导，弥补去除边框后的结构感 */}
         <div className={`w-1 h-6 mt-2 rounded-full opacity-60 ${isNext ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
      </div>

      {/* 右侧数据区域 (无卡片背景) */}
      <div className={containerClass}>
         {/* 顶部时间条 */}
         <div className={timeHeaderClass}>
            <span className="text-blue-200/60 text-[10px] font-medium font-sans tracking-wide italic">
               {data.time}
            </span>
         </div>
         
         {/* 数据内容区 */}
         <div className="flex justify-between items-center py-3 px-2">
            {/* 产品代号 */}
            <div className="flex flex-col items-center gap-1">
               <span className={`text-2xl font-black italic ${themeColor} leading-none`}>
                  {data.productCode}
               </span>
               <span className="text-[10px] text-slate-500 font-medium">产品代号</span>
            </div>

            {/* 叩解度 */}
            <div className="flex flex-col items-center gap-1">
               <div className={`flex items-baseline ${themeColor}`}>
                  <span className="text-2xl font-black font-mono leading-none">{data.freeness.value}</span>
                  <span className="text-sm font-medium ml-0.5 opacity-80">±{freenessDev}</span>
               </div>
               <span className="text-[10px] text-slate-500 font-medium">叩解度</span>
            </div>

            {/* 纤维长度 */}
            <div className="flex flex-col items-center gap-1">
               <div className={`flex items-baseline ${themeColor}`}>
                  <span className="text-2xl font-black font-mono leading-none">{data.fiberLength.value}</span>
                  <span className="text-sm font-medium ml-0.5 opacity-80">±{fiberDev.toFixed(1)}</span>
               </div>
               <span className="text-[10px] text-slate-500 font-medium">纤维长度</span>
            </div>
         </div>
         
         {/* 底部装饰线 (极淡，用于视觉分割) */}
         <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>
    </div>
  );
};

// 3. 3D 设备卡片 (悬浮) - 无边框黑底
const MachineCard = ({ data }: { data: TwinMachineStatus }) => (
  <div className="absolute transform -translate-x-1/2 -translate-y-full pb-6 group cursor-pointer"
       style={{ top: '60%', left: '50%' }}>
    
    {/* 锚点连接线 - 调暗 */}
    <div className="absolute bottom-0 left-1/2 w-px h-6 bg-white/20"></div>
    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2"></div>

    {/* 卡片主体 - 纯黑半透明底 + 无边框 */}
    <div className="w-40 bg-black/80 backdrop-blur-sm p-2 text-[10px] shadow-2xl relative overflow-hidden transition-all hover:scale-105 hover:bg-black z-10 rounded">
        <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
            <span className="font-bold text-white text-xs">{data.name}</span>
            <span className={`font-bold ${data.status === 'run' ? 'text-green-500' : 'text-red-500'}`}>
                {data.status === 'run' ? 'RUN' : 'STOP'}
            </span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-1 gap-y-1 text-slate-400">
            <div className="flex justify-between"><span>In:</span><span className="font-mono text-slate-200">{data.pressureIn}</span></div>
            <div className="flex justify-between"><span>Out:</span><span className="font-mono text-slate-200">{data.pressureOut}</span></div>
            <div className="flex justify-between col-span-2 mt-0.5 pt-0.5 border-t border-white/5">
                <span>Power:</span><span className="font-mono text-yellow-500 font-bold">{data.power} KW</span>
            </div>
        </div>
    </div>
  </div>
);

// 4. 通用图表容器 - 强化标题栏
const ChartBox = ({ title, children, className = '', height = 'h-full' }: any) => (
  <div className={`flex flex-col relative ${className} ${height} bg-transparent rounded-xl overflow-hidden transition-colors`}>
    {/* 标题栏 - 增加渐变背景、发光装饰条 */}
    <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-900/30 via-transparent to-transparent border-b border-white/10 mb-1">
        <div className="flex items-center gap-2">
            {/* 左侧装饰条 */}
            <div className="w-1 h-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span className="text-blue-100 font-bold text-sm tracking-wide drop-shadow-sm">{title}</span>
        </div>
        {/* 右侧装饰点阵 - 增加科技感 */}
        <div className="flex gap-0.5 opacity-40">
            <div className="w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
        </div>
    </div>
    {/* 内容区 */}
    <div className="flex-1 min-h-0 relative p-1">
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
  const [trendFreeness, setTrendFreeness] = useState<any[]>([]);
  const [trendFiber, setTrendFiber] = useState<any[]>([]);
  const [qualifiedRates, setQualifiedRates] = useState<any>(null);
  const [shiftAbnormal, setShiftAbnormal] = useState<any[]>([]);
  const [abnormalList, setAbnormalList] = useState<any[]>([]);

  // Refs for Charts
  const stabilityRef = useRef<HTMLDivElement>(null);
  const optimalTimeRef = useRef<HTMLDivElement>(null);
  const trendFreenessRef = useRef<HTMLDivElement>(null);
  const trendFiberRef = useRef<HTMLDivElement>(null);
  const qualifiedRateRef = useRef<HTMLDivElement>(null);
  const shiftAbnormalRef = useRef<HTMLDivElement>(null);

  // Load Data
  useEffect(() => {
    fetchTwinStages().then(res => setStages(res.data));
    fetchTwinMachines().then(res => setMachines(res.data));
    fetchStabilityDistribution().then(res => setStabilityData(res.data));
    fetchOptimalStartupTime().then(res => setOptimalTimeData(res.data));
    fetchTrendData('freeness').then(res => setTrendFreeness(res.data));
    fetchTrendData('fiber').then(res => setTrendFiber(res.data));
    fetchQualifiedRates().then(res => setQualifiedRates(res.data));
    fetchShiftAbnormalStats().then(res => setShiftAbnormal(res.data));
    fetchAbnormalRecords().then(res => setAbnormalList(res.data));
  }, []);

  // Initialize Charts
  useEffect(() => {
    // 调整图表轴线颜色为更暗的颜色，适应无边框风格
    const axisLineColor = 'rgba(255,255,255,0.1)'; 
    const splitLineColor = 'rgba(255,255,255,0.05)';
    const textColor = 'rgba(255,255,255,0.4)';
    const tooltipStyle = { backgroundColor: '#000', borderColor: '#333', textStyle: { color: '#fff', fontSize: 10 }, padding: 8 };
    
    // 1. Stability Pie (Right Top)
    if (stabilityRef.current && stabilityData.length) {
      const chart = echarts.init(stabilityRef.current);
      chart.setOption({
        tooltip: { ...tooltipStyle, trigger: 'item' },
        legend: { show: false },
        series: [{
          type: 'pie',
          radius: ['45%', '65%'],
          center: ['40%', '50%'],
          itemStyle: { borderRadius: 3, borderColor: '#000', borderWidth: 2 },
          label: { show: true, position: 'outside', color: '#ccc', fontSize: 10, formatter: '{b}\n{c}' },
          labelLine: { length: 10, length2: 10, lineStyle: { color: '#444' } },
          data: stabilityData.map(d => ({ value: d.value, name: d.label, itemStyle: { color: d.color } }))
        }]
      });
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
    }

    // 3. Bottom Left: Trends
    const initTrend = (dom: HTMLDivElement | null, data: any[], color: string) => {
      if (dom && data.length) {
        const chart = echarts.init(dom);
        chart.setOption({
          tooltip: { ...tooltipStyle, trigger: 'axis' },
          grid: { top: 5, bottom: 20, left: 35, right: 5 },
          xAxis: { 
            type: 'category', 
            data: data.map(d => d.time),
            axisLine: { lineStyle: { color: axisLineColor } },
            axisLabel: { color: textColor, fontSize: 9 }
          },
          yAxis: { 
            type: 'value', 
            splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
            axisLabel: { color: textColor, fontSize: 9 },
            min: (value: any) => Math.floor(value.min),
            max: (value: any) => Math.ceil(value.max)
          },
          series: [
            { type: 'line', data: data.map(d => d.measure), smooth: true, lineStyle: { width: 1.5, color }, symbol: 'none' },
            { type: 'line', data: data.map(d => d.soft), smooth: true, lineStyle: { width: 1, type: 'dashed', color: '#fbbf24' }, symbol: 'none' }
          ]
        });
      }
    };
    initTrend(trendFreenessRef.current, trendFreeness, '#06b6d4');
    initTrend(trendFiberRef.current, trendFiber, '#f97316');

    // 4. Bottom Center: Qualified Rates
    if (qualifiedRateRef.current && qualifiedRates) {
      const chart = echarts.init(qualifiedRateRef.current);
      chart.setOption({
        tooltip: { ...tooltipStyle, trigger: 'axis' },
        grid: { top: 25, bottom: 20, left: 30, right: 10 },
        legend: { textStyle: { color: textColor, fontSize: 9 }, top: 0, right: 0, itemWidth: 8, itemHeight: 8 },
        xAxis: { 
          type: 'category', 
          data: qualifiedRates.dates,
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { color: textColor, fontSize: 9 }
        },
        yAxis: { 
          type: 'value', 
          min: 90,
          splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
          axisLabel: { color: textColor, fontSize: 9 }
        },
        series: [
          { name: '叩解度', type: 'line', data: qualifiedRates.freeness, smooth: true, itemStyle: { color: '#34d399' }, symbolSize: 4 },
          { name: '纤长', type: 'line', data: qualifiedRates.fiber, smooth: true, itemStyle: { color: '#60a5fa' }, symbolSize: 4 }
        ]
      });
    }

    // 5. Bottom Right: Shift Abnormal Pie
    if (shiftAbnormalRef.current && shiftAbnormal.length) {
      const chart = echarts.init(shiftAbnormalRef.current);
      chart.setOption({
        tooltip: { ...tooltipStyle, trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['40%', '50%'],
          label: { show: false },
          itemStyle: { borderColor: '#000', borderWidth: 2 },
          data: shiftAbnormal.map(d => ({ value: d.value, name: d.label, itemStyle: { color: d.color } }))
        }],
        legend: {
          orient: 'vertical',
          right: 0,
          top: 'center',
          textStyle: { color: textColor, fontSize: 9 },
          itemWidth: 8,
          itemHeight: 8
        }
      });
    }

  }, [stabilityData, optimalTimeData, trendFreeness, trendFiber, qualifiedRates, shiftAbnormal]);

  return (
    <div className="w-full h-full bg-black text-slate-100 overflow-hidden relative font-sans select-none">
      
      {/* ================= BACKGROUND LAYER ================= */}
      {/* 
          核心修正：
          1. 父容器背景为纯黑 (bg-black)，保证四周无图片。
          2. 图片容器 (z-0) 严格限制在中央视窗区域，不覆盖四周图表。
             - Left: 360px (为左侧列表预留空间)
             - Right: 340px (为右侧图表预留空间)
             - Bottom: 260px (为底部图表预留空间)
             - Top: 100px (为标题栏预留空间)
          3. 图片容器使用 Mask 实现边缘羽化，自然融入黑色背景。
          4. 修正 Mask 为矩形渐变 (linear-gradient composite) 而非圆形/椭圆，以符合用户 "矩形中心" 的要求。
      */}
      <div className="absolute inset-0 z-0 bg-black">
         {/* 1. 中央视窗图片容器 */}
         <div 
            className="absolute z-0"
            style={{ 
               top: '100px',
               bottom: '260px',
               left: '360px',
               right: '340px',
               // Mask: 使用双向线性渐变交集，创建矩形羽化效果 (Rectangular Vignette)
               // 15% 的边缘渐变区域
               maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
               maskComposite: 'intersect',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
               WebkitMaskComposite: 'source-in', // WebKit 下 source-in 等同于 intersect
            }}
         >
             <div 
                className="w-full h-full"
                style={{
                   backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop")',
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   opacity: 1
                }}
             ></div>
         </div>
      </div>

      {/* ================= 顶部中央通知 ================= */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
         {/* 通知改为无边框深色背景 */}
         <div className="bg-black/90 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
            <AlertCircle size={16} className="text-yellow-500 animate-pulse" />
            <span className="text-sm font-bold tracking-wide text-white">当前叩解度高于标准值，建议适当降低磨浆功率</span>
         </div>
      </div>

      {/* ================= 3D设备层 (悬浮在视窗区域) ================= */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
             {machines.map((m, i) => {
                 // 调整设备水平分布，使其集中在视窗区域 (25% -> 75%)
                 // 原来是 18 + i*16，现在调整为更紧凑一点，适配中间视窗
                 const leftPos = 25 + i * 12.5; 
                 return (
                    <div key={m.id} className="absolute" style={{ top: '45%', left: `${leftPos}%` }}>
                        <MachineCard data={m} />
                    </div>
                 );
              })}
          </div>
      </div>

      {/* ================= HUD LAYOUT (Absolute Positioning) ================= */}
      
      {/* 1. 左侧面板 (HUD) - 背景纯黑 */}
      <div className="absolute top-20 left-4 w-[340px] z-20 flex flex-col gap-4">
         {stages.map((stage, idx) => (
            <StageCard key={idx} data={stage} isNext={idx > 0} />
         ))}
      </div>

      {/* 2. 右侧面板 (HUD) - 背景纯黑 */}
      <div className="absolute top-20 right-4 w-[320px] z-20 flex flex-col gap-4">
         <ChartBox title="开机稳定时间分布" height="h-[200px]">
            <div ref={stabilityRef} className="w-full h-full" />
         </ChartBox>
         
         <ChartBox title="最优开机时间" height="h-[200px]">
            <div ref={optimalTimeRef} className="w-full h-full" />
         </ChartBox>
      </div>

      {/* 3. 底部面板 (GRID 布局) - 背景纯黑 */}
      <div className="absolute bottom-4 left-4 right-4 h-[240px] z-20 grid grid-cols-4 gap-4">
         
         {/* Col 1: 测量值趋势 (上下两图) */}
         <div className="flex flex-col gap-2">
            <ChartBox title="叩解度测量值" height="flex-1">
               <div ref={trendFreenessRef} className="w-full h-full" />
            </ChartBox>
            <ChartBox title="纤维长度测量值" height="flex-1">
               <div ref={trendFiberRef} className="w-full h-full" />
            </ChartBox>
         </div>

         {/* Col 2: 合格率统计 */}
         <ChartBox title="合格率统计">
            <div className="flex flex-col h-full">
               <div className="grid grid-cols-2 gap-2 mb-2 pt-2">
                  <div className="text-center border-r border-white/10">
                     <div className="text-[10px] text-slate-500">叩解度</div>
                     <div className="text-2xl font-bold text-emerald-400 font-mono">98.5%</div>
                  </div>
                  <div className="text-center">
                     <div className="text-[10px] text-slate-500">纤维长度</div>
                     <div className="text-2xl font-bold text-blue-400 font-mono">99.0%</div>
                  </div>
               </div>
               <div ref={qualifiedRateRef} className="flex-1 w-full" />
            </div>
         </ChartBox>

         {/* Col 3: 班组异常时长 */}
         <ChartBox title="班组累计工艺异常时长">
            <div ref={shiftAbnormalRef} className="w-full h-full" />
         </ChartBox>

         {/* Col 4: 异常列表 */}
         <ChartBox title="异常情况列表">
            <div className="overflow-auto custom-scrollbar h-full pr-1">
               <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="text-slate-500 border-b border-white/10 sticky top-0 bg-black">
                     <tr><th className="pb-1 pl-1 font-normal">序号</th><th className="pb-1 font-normal">时间</th><th className="pb-1 font-normal">事件</th></tr>
                  </thead>
                  <tbody className="text-slate-300">
                     {abnormalList.map((item, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                           <td className="py-2 pl-1 text-slate-600 font-mono">{item.id}</td>
                           <td className="py-2 font-mono text-blue-500">{item.date}</td>
                           <td className="py-2 truncate max-w-[80px]" title={item.desc}>{item.desc}</td>
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
