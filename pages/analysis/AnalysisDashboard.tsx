import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
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
  Check,
  Calendar,
  ChevronDown,
  LineChart,
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { fetchMultiAnalysisData, AnalysisDataPoint } from '../../services/analysisDataService';
import { RECORD_LIST } from '../../services/traceabilityService';

const DEVICES = ['1', '2', '3', '4', '5'];
const PARAMS = [
  { id: 'beatingDegree', name: '叩解度测量值', unit: '°SR', color: '#06b6d4', min: 53, max: 57 },
  { id: 'fiberLength', name: '纤维长度测量值', unit: 'mm', color: '#f97316', min: 0.7, max: 0.9 },
  { id: 'dyn-01', name: '电机功率', unit: 'kW', color: '#3b82f6', min: 300, max: 500 },
  { id: 'dyn-07', name: '刀盘间隙', unit: 'mm', color: '#8b5cf6', min: 0, max: 2 },
  { id: 'dyn-05', name: '流量', unit: 'm³/h', color: '#ec4899', min: 100, max: 200 },
  { id: 'dyn-06', name: '浓度', unit: '%', color: '#10b981', min: 2, max: 6 },
];

const PROCESS_ALERTS = [
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

const scrollbarStyle = `
  /* Override global dark scrollbars for this page */
  .page-light-scroll ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .page-light-scroll ::-webkit-scrollbar-track {
    background: transparent;
  }
  .page-light-scroll ::-webkit-scrollbar-thumb {
    background: rgba(203, 213, 225, 0.6);
    border-radius: 3px;
  }
  .page-light-scroll ::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }
`;

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
    <div className="w-full px-4 py-3">
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

export const AnalysisDashboard: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  // 新增：Gantt 图表引用
  const ganttChartRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<echarts.ECharts | null>(null);

  const [activeParams, setActiveParams] = useState<string[]>(['beatingDegree', 'fiberLength']);
  const [showKnifeDetails, setShowKnifeDetails] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true); // 控制面板展开/收起
  const [selectedDataType, setSelectedDataType] = useState('全部'); // 数据类型选择
  const [isDataTypeDropdownOpen, setIsDataTypeDropdownOpen] = useState(false); // 数据类型下拉框状态
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // 日期范围状态
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 日期选择器状态
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, Record<string, AnalysisDataPoint[]>>>({});
  
  const DATA_TYPES = ['全部', '工艺异常', '工艺回溯'];

  // 辅助函数：格式化显示日期 (yyyy-mm-dd hh:mm)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.replace('T', ' ');
  };

  // 处理开始时间变更
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    let newEnd = dateRange.end;

    if (newStart) {
      const startTime = new Date(newStart).getTime();
      
      // 如果存在结束时间，进行校验
      if (newEnd) {
        const endTime = new Date(newEnd).getTime();
        // 1. 结束时间不能早于开始时间
        if (endTime < startTime) {
          newEnd = newStart;
        } 
        // 2. 时间跨度不能超过1小时
        else if (endTime - startTime > 3600 * 1000) {
          newEnd = new Date(startTime + 3600 * 1000).toISOString().slice(0, 16);
        }
      }
    }
    
    setDateRange({ start: newStart, end: newEnd });
  };

  // 处理结束时间变更
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    const startStr = dateRange.start;
    
    if (startStr && newEnd) {
       const startTime = new Date(startStr).getTime();
       const endTime = new Date(newEnd).getTime();

       // 校验：不能早于开始时间
       if (endTime < startTime) {
         return; // 或者设为 startTime
       }
       
       // 校验：不能超过1小时
       if (endTime - startTime > 3600 * 1000) {
         // 自动修正为开始时间+1小时
         const maxEnd = new Date(startTime + 3600 * 1000).toISOString().slice(0, 16);
         setDateRange(prev => ({ ...prev, end: maxEnd }));
         return;
       }
    }
    setDateRange(prev => ({ ...prev, end: newEnd }));
  };

  // 视图范围 (0-100)
  const [viewRange, setViewRange] = useState({ start: 0, end: 100 });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetchMultiAnalysisData(DEVICES, PARAMS.map(p => p.id), 30);
        if (response.code === 200 && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // 初始化主图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
        chartInstance.current.group = 'group1'; // 设置组名用于联动
      }
    }

    // 初始化 Gantt 图表
    if (ganttChartRef.current) {
      if (!ganttInstance.current) {
        ganttInstance.current = echarts.init(ganttChartRef.current);
        ganttInstance.current.group = 'group1'; // 设置组名用于联动
      }
    }

    // 建立联动
    if (chartInstance.current && ganttInstance.current) {
        echarts.connect('group1');
    }
    
    updateChart();
    updateGanttChart();
    
    const handleResize = () => {
      chartInstance.current?.resize();
      ganttInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, activeParams, showKnifeDetails, viewRange]);

  const updateChart = () => {
    if (!chartInstance.current || Object.keys(data).length === 0) return;

    // 获取所有时间点 (以 1# 设备的第一个参数为基准)
    const baseData = data['1'][PARAMS[0].id];
    if (!baseData || baseData.length === 0) return;

    // 使用完整数据，通过 dataZoom 控制显示范围
    const times = baseData.map(d => {
      const date = new Date(d.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    const gridCount = activeParams.length;
    const gridHeight = `${100 / gridCount - 15}%`; // 调整高度留出间距

    const grids: echarts.GridComponentOption[] = [];
    const xAxes: echarts.XAXisComponentOption[] = [];
    const yAxes: echarts.YAXisComponentOption[] = [];
    const series: echarts.SeriesOption[] = [];
    const titles: echarts.TitleComponentOption[] = [];

    let gridIndex = 0;

    // 渲染选中的参数图表
    activeParams.forEach((paramId) => {
      const paramInfo = PARAMS.find(p => p.id === paramId);
      if (!paramInfo) return;

      const top = `${gridIndex * (100 / gridCount) + 8}%`;

      grids.push({
        show: true,
        borderWidth: 0,
        backgroundColor: '#ffffff', // 改为纯白背景
        top,
        height: gridHeight,
        left: '50px',
        right: '20px',
      });

      titles.push({
        text: paramInfo.name,
        top: `${gridIndex * (100 / gridCount) + 2}%`,
        left: '50px',
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333'
        }
      });

      xAxes.push({
        type: 'category',
        gridIndex,
        data: times,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: true, lineStyle: { color: '#cbd5e1' } },
        axisLabel: { 
          show: gridIndex === activeParams.length - 1, // 只在最后一个图表显示 X 轴标签
          color: '#64748b',
          fontSize: 10,
          interval: Math.floor(times.length / 10) // 控制标签密度
        }
      });

      yAxes.push({
        type: 'value',
        gridIndex,
        min: paramInfo.min,
        max: paramInfo.max,
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 10 }
      });

      // 默认展示 1# 设备的数据作为代表
      const paramData = data['1'][paramId].map(d => d.value);

      // 添加阈值线 (markLine)
      let markLine = undefined;
      if (paramId === 'beatingDegree') {
         markLine = {
            symbol: 'none',
            data: [
               { yAxis: 53, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { show: false } }, // 下限
               { yAxis: 55, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { show: false } }  // 上限
            ]
         };
      } else if (paramId === 'fiberLength') {
         markLine = {
            symbol: 'none',
            data: [
               { yAxis: 0.75, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { show: false } }, // 下限
               { yAxis: 0.85, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { show: false } }  // 上限
            ]
         };
      }

      series.push({
        name: paramInfo.name,
        type: 'line',
        xAxisIndex: gridIndex,
        yAxisIndex: gridIndex,
        data: paramData,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: paramInfo.color,
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${paramInfo.color}15` },
            { offset: 1, color: `${paramInfo.color}00` }
          ])
        },
        markLine: markLine
      });

      gridIndex++;
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: '#cbd5e1', type: 'solid' } }
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }]
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: xAxes.map((_, i) => i),
          start: viewRange.start,
          end: viewRange.end
        },
        {
          type: 'slider', // 隐藏的 slider 用于同步状态
          show: false,
          xAxisIndex: xAxes.map((_, i) => i),
          start: viewRange.start,
          end: viewRange.end
        }
      ],
      title: titles,
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series: series
    };

    chartInstance.current.setOption(option, true);
  };

  const updateGanttChart = () => {
      if (!ganttInstance.current || Object.keys(data).length === 0) return;

      // 使用完整数据
      const baseData = data['1'][PARAMS[0].id];
      if (!baseData || baseData.length === 0) return;

      const times = baseData.map(d => {
        const date = new Date(d.timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      });

      // 模拟甘特图数据 (使用绝对索引映射到完整时间轴)
      const totalLen = times.length;
      const ganttData = [
        // [设备index, 开始时间index, 结束时间index, 值, 颜色]
        [2, Math.floor(totalLen * 0.05), Math.floor(totalLen * 0.15), '0.01', '#22d3ee'], // 1# cyan
        [1, Math.floor(totalLen * 0.65), Math.floor(totalLen * 0.75), '0.03', '#22d3ee'], // 3# cyan
        [1, Math.floor(totalLen * 0.8), Math.floor(totalLen * 0.9), '0.5', '#22d3ee'], // 3# cyan
        [0, Math.floor(totalLen * 0.85), Math.floor(totalLen * 0.95), '0.02', '#fb923c'], // 4# orange
      ];

      const option: echarts.EChartsOption = {
          tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'line', lineStyle: { color: '#cbd5e1', type: 'solid' } },
              formatter: (params: any) => {
                  if (Array.isArray(params) && params.length > 0) {
                      return params[0].axisValue;
                  }
                  return '';
              }
          },
          dataZoom: [
            {
              type: 'inside',
              xAxisIndex: 0,
              start: viewRange.start,
              end: viewRange.end
            },
            {
              type: 'slider',
              show: false,
              xAxisIndex: 0,
              start: viewRange.start,
              end: viewRange.end
            }
          ],
          grid: {
              top: 5,
              bottom: 5,
              left: '50px',
              right: '20px',
              height: 'auto'
          },
          xAxis: {
              type: 'category',
              data: times,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false } // 隐藏 X 轴标签，因为下方有时间轴
          },
          yAxis: {
              type: 'category',
              data: ['4#', '3#', '1#'],
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: '#64748b', fontSize: 10 }
          },
          series: [{
              type: 'custom',
              renderItem: function (params: any, api: any) {
                  const categoryIndex = api.value(0);
                  const start = api.coord([api.value(1), categoryIndex]);
                  const end = api.coord([api.value(2), categoryIndex]);
                  const height = 12;

                  return {
                      type: 'group',
                      children: [
                          {
                              type: 'rect',
                              shape: {
                                  x: start[0],
                                  y: start[1] - height / 2,
                                  width: end[0] - start[0],
                                  height: height,
                                  r: height / 2
                              },
                              style: api.style({
                                  fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                      { offset: 0, color: api.value(4) },
                                      { offset: 1, color: api.value(4) + '88' }
                                  ])
                              })
                          },
                          {
                              type: 'text',
                              style: {
                                  text: api.value(3),
                                  x: start[0],
                                  y: start[1] + height / 2 + 4,
                                  fill: '#64748b',
                                  fontSize: 10
                              }
                          }
                      ]
                  };
              },
              data: ganttData
          }]
      };

      ganttInstance.current.setOption(option, true);
  };

  const toggleParam = (id: string) => {
    setActiveParams(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full h-full bg-white flex overflow-hidden text-slate-800 page-light-scroll">
      <style>{scrollbarStyle}</style>
      
      {/* 左侧大区域：拆分为两列 */}
      <div className="flex h-full shrink-0 border-r border-slate-200">
        
        {/* 第一列：工艺标准要求 + 工艺参数 */}
        <div className="w-[240px] border-r border-slate-200 flex flex-col h-full bg-slate-50/30 overflow-y-auto">
          {/* 1. 工艺标准要求 */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-slate-700"/>
              <span className="font-bold text-slate-800">工艺标准要求</span>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              工艺时间: <br/>
              <span className="text-slate-700 mt-1 block">2025-06-06 19:48~02-14 10:10</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 text-center">产品代号</span>
                <div className="bg-white border border-slate-200 p-2 rounded flex items-center justify-center h-10">
                  <span className="font-bold text-slate-800">7T</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 text-center">叩解度</span>
                <div className="bg-white border border-slate-200 p-2 rounded flex items-center justify-center h-10">
                  <span className="font-bold text-slate-800">54±1</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 text-center">纤维长度</span>
                <div className="bg-white border border-slate-200 p-2 rounded flex items-center justify-center h-10">
                  <span className="font-bold text-slate-800 text-xs text-center leading-tight">0.8±0.0<br/>5</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">刀盘转向:</div>
            <div className="flex justify-between items-center px-1">
              {[
                { id: '1#', dir: '正', color: 'text-cyan-500' },
                { id: '2#', dir: '反', color: 'text-orange-500' },
                { id: '3#', dir: '反', color: 'text-orange-500' },
                { id: '4#', dir: '正', color: 'text-cyan-500' },
                { id: '5#', dir: '正', color: 'text-cyan-500' },
              ].map(item => (
                <div key={item.id} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-700">{item.dir}</span>
                  <RefreshCw size={14} className={item.color} />
                  <span className="text-[10px] text-slate-400">{item.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 工艺参数 */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <LineChart size={16} className="text-slate-700"/>
              <span className="font-bold text-slate-800">工艺参数</span>
            </div>
            <div className="space-y-2.5">
              {PARAMS.map(param => {
                const isActive = activeParams.includes(param.id);
                return (
                  <label key={param.id} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isActive ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 group-hover:border-blue-400'
                    }`}>
                      {isActive && <Check size={12} className="text-white"/>}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>
                      {param.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* 第二列：进退刀汇总 + 工艺操作 */}
        <div className="w-[240px] flex flex-col h-full bg-white overflow-y-auto border-r border-slate-200">
          {/* 3. 进退刀汇总 (统一使用新样式) */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-purple-600"/>
              <span className="font-bold text-slate-800">进退刀汇总</span>
            </div>
            <div className="space-y-2">
               {[
                 { id: '1', deviceName: '1#', accumulatedInFeed: 0.01, inFeedDuration: 32 },
                 { id: '2', deviceName: '2#', accumulatedInFeed: 0.03, inFeedDuration: 16 },
                 { id: '3', deviceName: '3#', accumulatedOutFeed: 0.02, outFeedDuration: 12 }
               ].map(item => {
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
                           <div className="flex flex-col items-end w-8">
                              <span className="text-[10px] text-slate-400">时长</span>
                              <span className="font-mono text-slate-600">{duration}s</span>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
          </div>

          {selectedDataType === '工艺回溯' ? (
            <>
              {/* 4. 操作记录 (Traceability Style) */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <ListIcon size={16} className="text-purple-600"/>
                  <span className="font-bold text-slate-800">操作记录</span>
                </div>
                
                {/* Table Header */}
                <div className="flex text-[10px] text-slate-400 pb-2 px-2 border-b border-slate-200 mb-1">
                   <span className="w-12">时间</span>
                   <span className="w-8 text-center">设备</span>
                   <span className="w-8 text-center">类型</span>
                   <span className="w-10 text-center">数值</span>
                   <span className="w-8 text-right">时长</span>
                   <span className="flex-1 text-right">来源</span>
                </div>

                {/* Table Body */}
                <div className="space-y-0">
                   {[
                     { id: 'l1', startTime: '2025-10-02 15:10:49', deviceName: '1#', type: '累计进刀', gapChange: 0.01, duration: '2s', source: '人工操作' },
                     { id: 'l2', startTime: '2025-10-02 17:21:12', deviceName: '3#', type: '累计进刀', gapChange: 0.03, duration: '6s', source: '人工操作' },
                     { id: 'l3', startTime: '2025-10-02 17:24:31', deviceName: '3#', type: '累计进刀', gapChange: 0.05, duration: '6s', source: '自动操作' },
                     { id: 'l4', startTime: '2025-10-02 17:24:31', deviceName: '4#', type: '累计退刀', gapChange: -0.03, duration: '4s', source: '自动操作' },
                   ].map((log, idx, arr) => {
                      const isAdvance = log.type === '累计进刀';
                      const timeDisplay = log.startTime.split(' ')[1];

                      return (
                          <div 
                              key={log.id}
                              className={`flex items-center text-xs py-2.5 px-2 transition-all rounded-md group border-l-4 border-transparent hover:bg-slate-50 hover:shadow-sm hover:border-slate-200 cursor-default
                                  ${idx !== arr.length-1 ? 'border-b-slate-100 border-b-[1px]' : ''}
                              `}
                          >
                             <span className="w-12 font-mono text-slate-500 scale-90 origin-left">{timeDisplay}</span>
                             <span className="w-8 text-center font-bold text-slate-700">{log.deviceName.replace('精浆机','')}</span>
                             <span className={`w-8 text-center font-bold ${isAdvance ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {isAdvance ? '进刀' : '退刀'}
                             </span>
                             <span className="w-10 text-center font-mono text-slate-800">{log.gapChange > 0 ? `+${log.gapChange}` : log.gapChange}</span>
                             <span className="w-8 text-right font-mono text-slate-500">{log.duration}</span>
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
            </>
          ) : (
            <>
              {/* 4. 工艺操作 (Original Style) */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[10px]">!</div>
                  <span className="font-bold text-slate-800">工艺操作</span>
                </div>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200">
                  {[
                    { time: '15:10:49~15:10:51', device: '1#', action: '累计进刀', val: '0.01', dur: '2S', icon: <User size={12}/>, color: 'text-cyan-500' },
                    { time: '17:21:12~17:21:18', device: '3#', action: '累计进刀', val: '0.03', dur: '6S', icon: <User size={12}/>, color: 'text-cyan-500' },
                    { time: '17:24:31~17:25:07', device: '3#', action: '累计进刀', val: '0.05', dur: '6S', icon: <div className="flex"><RefreshCw size={12}/><User size={12}/></div>, color: 'text-cyan-500' },
                    { time: '17:24:31~17:25:07', device: '4#', action: '累计退刀', val: '0.03', dur: '4S', icon: <RefreshCw size={12}/>, color: 'text-orange-500' },
                  ].map((op, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute left-[8px] top-1 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-white"></div>
                      <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                        <Calendar size={10}/> {op.time}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className={`font-bold ${op.color}`}>●</span>
                          <span className="font-bold text-slate-800">{op.device}</span>
                          <span className="text-slate-600">{op.action}</span>
                          <span className="font-bold text-slate-800">{op.val}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-[10px]">时长{op.dur}</span>
                          {op.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Top Controls Area - Moved out of absolute to prevent overlap */}
        <div className="flex items-center gap-6 px-6 pt-4 pb-2 z-10 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div 
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                showKnifeDetails ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 group-hover:border-blue-400'
              }`}
              onClick={() => setShowKnifeDetails(!showKnifeDetails)}
            >
              {showKnifeDetails && <Check size={12} className="text-white"/>}
            </div>
            <span className="text-sm text-slate-600">显示刀盘动作详情</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              showTimeline ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 group-hover:border-blue-400'
            }`}>
              {showTimeline && <Check size={12} className="text-white"/>}
            </div>
            <span className="text-sm text-slate-600">显示时间轴</span>
          </label>
        </div>

        {/* Right Top "Select Data" Panel (Floating Card) */}
        <div 
          className={`absolute top-4 right-4 z-20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-visible ${
            isPanelExpanded ? 'w-[320px] bg-white/40 p-4' : 'w-[120px] bg-white/40 p-3 hover:bg-white/60 cursor-pointer'
          }`}
          onClick={() => !isPanelExpanded && setIsPanelExpanded(true)}
        >
           <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold text-slate-800 transition-opacity duration-300 ${isPanelExpanded ? 'opacity-100' : 'opacity-80'}`}>选择数据</span>
              <div 
                className="cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPanelExpanded(!isPanelExpanded);
                  setIsDataTypeDropdownOpen(false);
                }}
              >
                {isPanelExpanded ? (
                  <span className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">
                    收起 <ChevronDown size={14} className="rotate-180 -rotate-90"/>
                  </span>
                ) : (
                  <ChevronDown size={16} className="text-slate-500"/>
                )}
              </div>
           </div>
           
           {/* Content - Only visible when expanded */}
           <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
             isPanelExpanded ? 'max-h-[600px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
           }`}>
             {/* Data Type Dropdown */}
             <div className="mb-3 relative">
                <div 
                  className="flex items-center justify-between bg-white/30 border border-white/40 rounded-xl px-3 py-2 w-full cursor-pointer hover:bg-white/50 transition-all duration-200"
                  onClick={() => setIsDataTypeDropdownOpen(!isDataTypeDropdownOpen)}
                >
                  <span className="text-xs font-medium text-slate-700">{selectedDataType}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isDataTypeDropdownOpen ? 'rotate-180' : ''}`}/>
                </div>
                
                {/* Dropdown Menu */}
                {isDataTypeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
                    {DATA_TYPES.map((type) => (
                      <div 
                        key={type}
                        className={`px-4 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${selectedDataType === type ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'}`}
                        onClick={() => {
                          setSelectedDataType(type);
                          setIsDataTypeDropdownOpen(false);
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Date Range & Search Row */}
             <div className="flex items-center gap-2">
                {/* Date Inputs Container (Pill Shape) */}
                <div className="flex-1 flex items-center justify-between bg-white/30 border border-white/40 rounded-full px-3 py-2 relative">
                  {/* Start Time */}
                  <div className="flex items-center gap-1.5 relative z-10 max-w-[100px]">
                    <Calendar size={14} className="text-blue-600 shrink-0"/>
                    <span className={`text-[10px] font-medium whitespace-nowrap truncate ${dateRange.start ? 'text-slate-700' : 'text-slate-400'}`}>
                        {formatDisplayDate(dateRange.start) || '开始时间'}
                    </span>
                    <input 
                      type="datetime-local" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      value={dateRange.start}
                      onChange={handleStartTimeChange}
                    />
                  </div>
                  
                  <span className="text-slate-400 font-bold text-xs z-10">~</span>
                  
                  {/* End Time */}
                  <div className="flex items-center gap-1.5 relative z-10 max-w-[100px]">
                    <Calendar size={14} className="text-blue-600 shrink-0"/>
                    <span className={`text-[10px] font-medium whitespace-nowrap truncate ${dateRange.end ? 'text-slate-700' : 'text-slate-400'}`}>
                        {formatDisplayDate(dateRange.end) || '结束时间'}
                    </span>
                    <input 
                      type="datetime-local" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      value={dateRange.end}
                      onChange={handleEndTimeChange}
                      min={dateRange.start}
                      max={dateRange.start ? new Date(new Date(dateRange.start).getTime() + 3600 * 1000).toISOString().slice(0, 16) : undefined}
                    />
                  </div>
                </div>

                {/* Search Button (Circle) */}
                <button 
                  className="w-9 h-9 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-full flex items-center justify-center text-white transition-all shadow-lg shadow-purple-500/30 active:scale-95 shrink-0"
                  onClick={() => {
                    console.log('Searching with:', { selectedDataType, dateRange });
                    setIsPanelExpanded(false); // 搜索后自动收起
                  }}
                >
                  <Search size={16} strokeWidth={2.5}/>
                </button>
             </div>

             {/* Conditional List Content */}
             {selectedDataType === '工艺异常' && (
                <div className="mt-3 max-h-[300px] overflow-y-auto pr-1 space-y-2">
                   {PROCESS_ALERTS.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/60 p-2 rounded-lg border border-white/50 relative group hover:bg-white/80 transition-all">
                         <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center justify-between mr-2">
                               <div className="flex items-center text-[10px] text-slate-500 gap-1 font-mono">
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

                            <div className="flex items-center gap-2">
                               <span className="font-mono font-bold text-slate-700 text-xs">{item.startVal}</span>
                               <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-cyan-100 text-cyan-600">
                                 <ArrowRight size={8} strokeWidth={3} />
                               </div>
                               <span className="font-mono font-bold text-slate-700 text-xs">{item.endVal}</span>
                            </div>
                         </div>
                         
                         <div className="flex flex-col gap-1 pl-2 border-l border-slate-200/50">
                            <div className={`p-1 rounded ${item.isManual ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-300 opacity-50'}`}>
                               <User size={10} />
                            </div>
                            <div className={`p-1 rounded ${item.isAuto ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300 opacity-50'}`}>
                               <RefreshCw size={10} /> 
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}

             {selectedDataType === '工艺回溯' && (
                <div className="mt-3 max-h-[300px] overflow-y-auto pr-1 space-y-2">
                   {RECORD_LIST.map((record) => {
                      const isPurpleTheme = record.operationType === '开机操作';
                      return (
                        <div 
                           key={record.id}
                           className="flex flex-col p-2.5 cursor-pointer transition-all rounded-lg relative group border bg-white/60 border-white/50 hover:bg-white/80 hover:border-blue-300 hover:shadow-sm"
                        >
                           <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-2">
                                 <div className={`p-1 rounded ${isPurpleTheme ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {isPurpleTheme ? <Zap size={12}/> : <ListIcon size={12}/>}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{record.operationType}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{record.date}</span>
                                 </div>
                              </div>
                              <div className="flex gap-1">
                                 {record.source.includes('人工操作') && <div className="p-1 bg-white rounded shadow-sm text-slate-500"><User size={10}/></div>}
                                 {record.source.includes('自动操作') && <div className="p-1 bg-white rounded shadow-sm text-blue-500"><RefreshCw size={10}/></div>}
                              </div>
                           </div>
                           <div className="flex items-center justify-center bg-slate-50/50 rounded py-1 border border-slate-100/50">
                              <span className="font-mono font-bold text-slate-700 text-xs tracking-wide">{record.timeRange}</span>
                           </div>
                        </div>
                      );
                   })}
                </div>
             )}
           </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 w-full relative pb-[160px]"> {/* 增加底部 padding 防止遮挡 */}
           {loading && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
           )}
           <div ref={chartRef} className="w-full h-full" />
        </div>

        {/* Bottom Floating Panel: Gantt Chart + Time Slider */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border border-slate-100 z-10 flex flex-col overflow-hidden">
           {/* Gantt Chart Area */}
           {showKnifeDetails && (
              <div className="w-full h-[80px] border-b border-slate-50 relative">
                 <div ref={ganttChartRef} className="w-full h-full" />
              </div>
           )}
           
           {/* Time Slider Area */}
           <div className="bg-slate-50/50">
              <TimeRangeSlider 
                 range={viewRange} 
                 onChange={setViewRange} 
              />
           </div>
        </div>

      </div>
    </div>
  );
};
