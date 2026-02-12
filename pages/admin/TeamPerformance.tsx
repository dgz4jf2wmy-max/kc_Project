
import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Medal } from 'lucide-react'; // 引入图标
import { 
  AdminPageWrapper, 
  SearchFilterCard, 
  FilterItem, 
  STD_INPUT_CLASS,
  StandardDrawer, 
  DataListCard,   
  StdTable       
} from '../../components/admin/StandardLayouts';
import { 
    fetchOverallStats, 
    fetchDailyStartupDurations, 
    fetchDailyAvgStartupDurations,
    fetchDailyStartupDurationDetails, 
    fetchDailyAvgStartupDurationDetails,
    fetchTeamStartupStabilityDetails, 
    fetchStartupDurationDistributionDetails,
    fetchQualifiedRateDetails // 仅保留获取详细数据的接口
} from '../../services/teamPerformanceService';
import { 
  OverallStats, 
  TeamRateItem, 
  DailyStartupDuration, 
  DailyAvgStartupDuration,
  DailyStartupDurationDetail, 
  DailyAvgStartupDurationDetail,
  TeamStartupStabilityDetail, 
  StartupDurationDistributionDetail,
  DailyTeamQualifiedRate,
  QualifiedRateStatsDetail,
  TeamStartupStability,
  StartupDurationDistribution,
  QualifiedRateStats // 引入实体类
} from '../../types';

// --- 辅助组件 ---

// 排名徽章组件
const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  // 1st Place - 金牌
  if (rank === 1) {
    return <Medal size={20} className="text-yellow-500 fill-yellow-100" strokeWidth={2} />;
  }
  // 2nd Place - 银牌
  if (rank === 2) {
    return <Medal size={20} className="text-slate-400 fill-slate-100" strokeWidth={2} />;
  }
  // 3rd Place - 铜牌
  if (rank === 3) {
    return <Medal size={20} className="text-orange-500 fill-orange-100" strokeWidth={2} />;
  }
  // 4名以后不显示任何图标
  return null;
};

// 合格率列表项组件
const RateItemView: React.FC<{ item: TeamRateItem; allItems: TeamRateItem[] }> = ({ item, allItems }) => {
  // 动态计算排名：按 value 降序排列
  const sortedValues = [...allItems].sort((a, b) => b.value - a.value).map(i => i.value);
  // 获取当前值的排名索引
  const rank = sortedValues.indexOf(item.value) + 1;
  const isTop3 = rank <= 3;

  return (
    <div className={`flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-colors ${isTop3 ? 'bg-slate-50/50' : ''}`}>
       {/* 上半部分：奖牌 + 数值 (并排排列) */}
       <div className="flex items-center gap-1.5 mb-1 h-7"> 
          {rank <= 3 && <RankBadge rank={rank} />}
          <span className={`text-xl font-bold tracking-tight ${isTop3 ? 'text-gray-900' : 'text-gray-500'}`}>
            {/* 关联实体类定义：保留两位小数 */}
            {item.value.toFixed(2)}
          </span>
       </div>
       
       {/* 下半部分：班组名称 */}
       <div className="text-xs text-gray-500 font-medium bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm">
         {item.team}
       </div>
    </div>
  );
};

// 通用卡片容器 (支持自定义 className 以控制 Grid 跨度)
const StatCard: React.FC<{ children: React.ReactNode; title: string; subTitle?: string; className?: string }> = ({ children, title, subTitle, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between min-h-[120px] hover:shadow-md transition-shadow relative overflow-hidden group ${className}`}>
     {/* 装饰背景 */}
     <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full opacity-50 group-hover:from-blue-50 transition-colors"></div>
     
     <div className="text-gray-500 text-sm font-medium flex justify-between items-center relative z-10">
        <span>{title}</span>
        {subTitle && <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{subTitle}</span>}
     </div>
     
     <div className="flex items-end mt-3 relative z-10 w-full">
        {children}
     </div>
  </div>
);

// --- 图表组件 1: 每日开机统计 ---

type ChartType = 'daily_startup' | 'daily_avg';

const StartupChartsSection: React.FC = () => {
    const [chartType, setChartType] = useState<ChartType>('daily_startup');
    const chartRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<echarts.ECharts | null>(null);
    const [stackedData, setStackedData] = useState<DailyStartupDuration[]>([]);
    const [avgData, setAvgData] = useState<DailyAvgStartupDuration[]>([]);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [detailData, setDetailData] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailFilters, setDetailFilters] = useState({ date: '', team: '', shift: '', durationMin: '', avgDurationMin: '' });

    useEffect(() => {
        fetchDailyStartupDurations().then(res => setStackedData(res.data));
        fetchDailyAvgStartupDurations().then(res => setAvgData(res.data));
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;
        if (!instanceRef.current) { instanceRef.current = echarts.init(chartRef.current); }
        const chart = instanceRef.current;
        const commonGrid = { left: '3%', right: '4%', bottom: '15%', top: '20%', containLabel: true };
        const commonDataZoom = [{ type: 'slider', show: true, xAxisIndex: [0], start: 0, end: 100, bottom: 10, height: 20, borderColor: 'transparent', backgroundColor: '#f1f5f9', fillerColor: 'rgba(59, 130, 246, 0.1)', handleStyle: { color: '#3b82f6', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 } }];
        
        let option: echarts.EChartsOption = {};

        if (chartType === 'daily_startup') {
            const dateMap = new Map<string, DailyStartupDuration[]>();
            const allDatesSet = new Set<string>(stackedData.map(d => d.date));
            const dates: string[] = Array.from(allDatesSet).sort();
            stackedData.forEach(d => { if (!dateMap.has(d.date)) dateMap.set(d.date, []); dateMap.get(d.date)?.push(d); });
            const series1: any[] = []; const series2: any[] = []; const series3: any[] = [];
            dates.forEach(date => {
                const items = dateMap.get(date) || [];
                if (items[0]) series1.push({ value: items[0].duration, labelText: `${items[0].team}: ${items[0].duration}m` }); else series1.push({ value: 0, labelText: '' });
                if (items[1]) series2.push({ value: items[1].duration, labelText: `${items[1].team}: ${items[1].duration}m` }); else series2.push({ value: 0, labelText: '' });
                if (items[2]) series3.push({ value: items[2].duration, labelText: `${items[2].team}: ${items[2].duration}m` }); else series3.push({ value: 0, labelText: '' });
            });
            const labelOption = { show: true, position: 'inside', formatter: (params: any) => params.data.labelText || '', color: '#fff', fontSize: 10 };
            option = {
                title: { text: '每日开机时长统计', subtext: '各值班班组开机时长', left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#334155' } },
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['初次开机', '第2次开机', '第3次开机'], top: 40, right: 20, icon: 'roundRect' },
                grid: commonGrid, dataZoom: commonDataZoom,
                xAxis: { type: 'category', data: dates.map((d: string) => d.slice(5)), axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#64748b' } },
                yAxis: { type: 'value', name: '耗时(分钟)', nameTextStyle: { color: '#94a3b8', padding: [0, 0, 0, 20] }, splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { color: '#64748b' } },
                series: [
                    { name: '初次开机', type: 'bar', stack: 'total', barMaxWidth: 30, itemStyle: { color: '#5470c6', borderRadius: [0, 0, 2, 2] }, label: labelOption, data: series1 },
                    { name: '第2次开机', type: 'bar', stack: 'total', barMaxWidth: 30, itemStyle: { color: '#91cc75' }, label: labelOption, data: series2 },
                    { name: '第3次开机', type: 'bar', stack: 'total', barMaxWidth: 30, itemStyle: { color: '#fac858', borderRadius: [2, 2, 0, 0] }, label: labelOption, data: series3 }
                ]
            };
        } else {
            const dates = avgData.map(d => d.date);
            const values = avgData.map(d => d.avgDuration);
            const totalAvg = values.length > 0 ? (values.reduce((a,b)=>a+b,0) / values.length).toFixed(2) : '0';
            option = {
                title: { text: '班组每日平均开机时长', subtext: `${dates[0] || ''} 至 ${dates[dates.length - 1] || ''}`, left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#334155' } },
                tooltip: { trigger: 'axis' },
                grid: commonGrid, dataZoom: commonDataZoom,
                xAxis: { type: 'category', data: dates.map(d => d.slice(5)), axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#64748b' } },
                yAxis: { type: 'value', name: '时长(分钟)', nameTextStyle: { color: '#94a3b8', padding: [0, 0, 0, 20] }, splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { color: '#64748b' } },
                series: [ { name: '平均时长', type: 'bar', barMaxWidth: 30, itemStyle: { color: '#5470c6', borderRadius: [2, 2, 0, 0] }, data: values, markPoint: { data: [{ type: 'max', name: 'Max' }, { type: 'min', name: 'Min' }] }, markLine: { data: [{ name: '平均值', yAxis: Number(totalAvg), label: { formatter: `avg: ${totalAvg}`, position: 'end', color: 'red' }, lineStyle: { color: 'red', type: 'dashed' } }], symbol: ['none', 'arrow'] } } ]
            };
        }
        chart.setOption(option, true);
        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); chart.dispose(); instanceRef.current = null; };
    }, [chartType, stackedData, avgData]);

    const handleViewData = () => {
        setLoadingDetails(true); setDetailDrawerOpen(true); setDetailFilters({ date: '', team: '', shift: '', durationMin: '', avgDurationMin: '' });
        if (chartType === 'daily_startup') { fetchDailyStartupDurationDetails().then(res => { setDetailData(res.data); setLoadingDetails(false); }); } else { fetchDailyAvgStartupDurationDetails().then(res => { setDetailData(res.data); setLoadingDetails(false); }); }
    };

    const filteredDetails = detailData.filter(item => {
        if (chartType === 'daily_startup') {
            const d = item as DailyStartupDurationDetail; return (!detailFilters.date || d.time.includes(detailFilters.date)) && (!detailFilters.team || d.team === detailFilters.team) && (!detailFilters.shift || d.shiftType === detailFilters.shift) && (!detailFilters.durationMin || d.duration >= Number(detailFilters.durationMin));
        } else {
            const d = item as DailyAvgStartupDurationDetail; return (!detailFilters.date || d.time.includes(detailFilters.date)) && (!detailFilters.avgDurationMin || d.avgDuration >= Number(detailFilters.avgDurationMin));
        }
    });

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4 min-h-[450px] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-800 font-bold text-lg">开机时长统计</div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select className="appearance-none bg-white border border-blue-200 text-gray-700 py-1.5 pl-4 pr-8 rounded text-sm focus:outline-none focus:border-blue-500 font-medium cursor-pointer hover:bg-gray-50 transition-colors" value={chartType} onChange={(e) => setChartType(e.target.value as ChartType)}>
                                <option value="daily_startup">每日开机时长统计</option>
                                <option value="daily_avg">每日开机平均时长</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-500"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                        </div>
                        <button onClick={handleViewData} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">查看数据</button>
                    </div>
                </div>
                <div ref={chartRef} className="flex-1 w-full h-[400px]"></div>
            </div>
            {detailDrawerOpen && (
                <StandardDrawer title={chartType === 'daily_startup' ? '每日开机时长统计 - 详细数据' : '每日开机平均时长 - 详细数据'} onClose={() => setDetailDrawerOpen(false)} width="w-[800px]" footer={<button className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors" onClick={() => setDetailDrawerOpen(false)}>关闭</button>}>
                    <div className="flex flex-col h-full space-y-4 p-6">
                        <SearchFilterCard actions={<div className="text-gray-400 text-xs self-center">实时过滤</div>}>
                            <FilterItem label="日期/时间"><input type="text" placeholder="YYYY-MM-DD" className={STD_INPUT_CLASS} value={detailFilters.date} onChange={e => setDetailFilters({...detailFilters, date: e.target.value})} /></FilterItem>
                            {chartType === 'daily_startup' && (<><FilterItem label="班组"><select className={STD_INPUT_CLASS} value={detailFilters.team} onChange={e => setDetailFilters({...detailFilters, team: e.target.value})}><option value="">全部</option><option value="甲">甲</option><option value="乙">乙</option><option value="丙">丙</option><option value="丁">丁</option></select></FilterItem><FilterItem label="值班类型"><select className={STD_INPUT_CLASS} value={detailFilters.shift} onChange={e => setDetailFilters({...detailFilters, shift: e.target.value})}><option value="">全部</option><option value="早班">早班</option><option value="中班">中班</option><option value="晚班">晚班</option></select></FilterItem><FilterItem label="开机时长(≥)"><input type="number" placeholder="分钟" className={STD_INPUT_CLASS} value={detailFilters.durationMin} onChange={e => setDetailFilters({...detailFilters, durationMin: e.target.value})} /></FilterItem></>)}
                            {chartType === 'daily_avg' && (<FilterItem label="平均时长(≥)"><input type="number" placeholder="分钟" className={STD_INPUT_CLASS} value={detailFilters.avgDurationMin} onChange={e => setDetailFilters({...detailFilters, avgDurationMin: e.target.value})} /></FilterItem>)}
                        </SearchFilterCard>
                        <DataListCard>
                            <table className={StdTable.Table}>
                                <thead className={StdTable.Thead}>
                                    <tr><th className={StdTable.Th}>时间</th>{chartType === 'daily_startup' && (<><th className={StdTable.Th}>开机时长 (分钟)</th><th className={StdTable.Th}>班组</th><th className={StdTable.Th}>值班类型</th></>)}{chartType === 'daily_avg' && (<th className={StdTable.Th}>平均开机时长 (分钟)</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {loadingDetails ? (<tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>) : filteredDetails.length > 0 ? (filteredDetails.map((item, idx) => (<tr key={idx} className={StdTable.Tr}><td className={`${StdTable.Td} font-mono text-gray-600`}>{(item as any).time}</td>{chartType === 'daily_startup' && (<><td className={`${StdTable.Td} font-bold text-gray-800`}>{(item as DailyStartupDurationDetail).duration}</td><td className={StdTable.Td}><span className={`px-2 py-0.5 rounded text-xs font-bold border ${(item as any).team === '甲' ? 'bg-blue-50 text-blue-700 border-blue-100' : (item as any).team === '乙' ? 'bg-green-50 text-green-700 border-green-100' : (item as any).team === '丙' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>{(item as DailyStartupDurationDetail).team}</span></td><td className={`${StdTable.Td} text-gray-600`}>{(item as DailyStartupDurationDetail).shiftType}</td></>)}{chartType === 'daily_avg' && (<td className={`${StdTable.Td} font-bold text-blue-600`}>{(item as DailyAvgStartupDurationDetail).avgDuration}</td>)}</tr>))) : (<tr><td colSpan={4} className={StdTable.Empty}>暂无匹配数据</td></tr>)}
                                </tbody>
                            </table>
                        </DataListCard>
                    </div>
                </StandardDrawer>
            )}
        </>
    );
};

// --- 图表组件 2: 班组开机稳定性与时长分布 ---

const StabilityDistributionSection: React.FC = () => {
    const stabilityChartRef = useRef<HTMLDivElement>(null);
    const distributionChartRef = useRef<HTMLDivElement>(null);
    const stabilityInstance = useRef<echarts.ECharts | null>(null);
    const distributionInstance = useRef<echarts.ECharts | null>(null);

    // 原始详情数据
    const [stabilityDetails, setStabilityDetails] = useState<TeamStartupStabilityDetail[]>([]);
    const [distributionDetails, setDistributionDetails] = useState<StartupDurationDistributionDetail[]>([]);

    // 转换后的实体类数据 (用于图表渲染)
    const [stabilityEntities, setStabilityEntities] = useState<TeamStartupStability[]>([]);
    const [distributionEntity, setDistributionEntity] = useState<StartupDurationDistribution | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'stability' | 'distribution'>('stability');
    const [filters, setFilters] = useState({ date: '', team: '', shift: '', durationMin: '', durationMax: '' });

    useEffect(() => {
        // 获取详细数据
        fetchTeamStartupStabilityDetails().then(res => setStabilityDetails(res.data));
        fetchStartupDurationDistributionDetails().then(res => setDistributionDetails(res.data));
    }, []);

    // 关键步骤：将详情数据转换为实体类数据 (Entities)
    useEffect(() => {
        // 1. 转换稳定性数据 (Details -> TeamStartupStability[])
        const derivedStability: TeamStartupStability[] = stabilityDetails.map(d => ({
            team: d.team,
            duration: d.duration,
            isOutlier: d.duration > 60 // 简单逻辑：大于60分钟标记为异常值(示例)
        }));
        setStabilityEntities(derivedStability);

    }, [stabilityDetails]);

    useEffect(() => {
        // 2. 转换分布数据 (Details -> StartupDurationDistribution)
        const buckets = { range0to20: 0, range20to40: 0, range40to60: 0, rangeOver60: 0 };
        distributionDetails.forEach(d => {
            if (d.duration <= 20) buckets.range0to20++;
            else if (d.duration <= 40) buckets.range20to40++;
            else if (d.duration <= 60) buckets.range40to60++;
            else buckets.rangeOver60++;
        });
        
        const derivedDistribution: StartupDurationDistribution = {
            ...buckets,
            totalCount: distributionDetails.length
        };
        setDistributionEntity(derivedDistribution);

    }, [distributionDetails]);

    // 渲染散点图 - 使用 stabilityEntities 实体
    useEffect(() => {
        if (!stabilityChartRef.current) return;
        if (!stabilityInstance.current) { stabilityInstance.current = echarts.init(stabilityChartRef.current); }
        const teams = ['甲', '乙', '丙', '丁'];
        const colors = ['#5470c6', '#91cc75', '#73c0de', '#fac858']; 
        
        const series = teams.map((team, idx) => {
            return { 
                name: `${team}班`, 
                type: 'scatter', 
                symbolSize: 12, 
                itemStyle: { color: colors[idx], opacity: 0.8 }, 
                // 使用实体类数据进行映射
                data: stabilityEntities
                    .filter(d => d.team === team)
                    .map(d => [`${team}班`, d.duration]) 
            };
        });

        const option: echarts.EChartsOption = {
            title: { text: '班组开机稳定性分析', subtext: '各班组开机稳定性分析', left: 'center', top: 5, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#334155' } },
            legend: { data: teams.map(t => `${t}班`), top: 35, right: 10, icon: 'circle', itemWidth: 10, itemHeight: 10 },
            tooltip: { trigger: 'item', formatter: (params: any) => `${params.seriesName}<br/>开机耗时: <b>${params.value[1]}</b> 分` },
            grid: { left: '10%', right: '10%', top: '25%', bottom: '15%', },
            xAxis: { type: 'category', data: teams.map(t => `${t}班`), axisLine: { lineStyle: { color: '#64748b' } }, axisTick: { show: false }, splitLine: { show: false } },
            yAxis: { type: 'value', name: '开机耗时(分)', min: 0, max: 70, nameTextStyle: { align: 'left', padding: [0, 0, 0, -20] }, splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }, axisLabel: { color: '#64748b' } },
            series: series as any
        };
        stabilityInstance.current.setOption(option);
    }, [stabilityEntities]); 

    // 渲染饼图 - 使用 distributionEntity 实体
    // 样式更新：严格对标截图 (Labels outside, No Legend, Specific Colors)
    useEffect(() => {
        if (!distributionChartRef.current || !distributionEntity) return;
        if (!distributionInstance.current) { distributionInstance.current = echarts.init(distributionChartRef.current); }
        
        // 直接从实体类取值
        const data = [ 
            { value: distributionEntity.range0to20, name: '0-20分钟' }, 
            { value: distributionEntity.range20to40, name: '20-40分钟' }, 
            { value: distributionEntity.range40to60, name: '40-60分钟' }, 
            { value: distributionEntity.rangeOver60, name: '60分钟以上' } 
        ];
        
        const option: echarts.EChartsOption = {
            title: { 
                text: '开机时长分布', 
                subtext: '开机时长档位分布', 
                left: 'center', 
                top: 10,
                textStyle: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
                subtextStyle: { fontSize: 12, color: '#94a3b8' }
            },
            tooltip: { 
                trigger: 'item', 
                formatter: '{b}: {c}次 ({d}%)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                textStyle: { color: '#334155' },
                padding: 10
            },
            legend: {
                show: false // Hide legend to match image
            },
            series: [ 
                { 
                    name: '开机时长分布', 
                    type: 'pie', 
                    // CHANGE: 内径缩小至 30%
                    radius: ['30%', '68%'], 
                    center: ['50%', '55%'], 
                    avoidLabelOverlap: true, 
                    itemStyle: { 
                        // CHANGE: 圆角加大至 12
                        borderRadius: 12, 
                        borderColor: '#fff', 
                        borderWidth: 3 
                    }, 
                    label: { 
                        show: true, 
                        position: 'outside',
                        formatter: '{b} {c}次', // Format: "Range Count次"
                        color: '#475569',
                        fontSize: 13,
                        fontWeight: 500
                    }, 
                    labelLine: {
                        show: true,
                        length: 20,
                        length2: 20,
                        lineStyle: {
                            color: '#cbd5e1'
                        }
                    },
                    emphasis: { 
                        label: { 
                            show: true, 
                            fontSize: 14, 
                            fontWeight: 'bold',
                            color: '#334155'
                        },
                        scale: true,
                        scaleSize: 6
                    }, 
                    data: data, 
                    // Colors from image: Blue, Lime Green, Dark Grey, Orange
                    color: ['#5b75f0', '#b0e34f', '#465063', '#ff9f57'] 
                } 
            ]
        };
        distributionInstance.current.setOption(option);
    }, [distributionEntity]); 

    useEffect(() => {
        const handleResize = () => { stabilityInstance.current?.resize(); distributionInstance.current?.resize(); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleViewData = (mode: 'stability' | 'distribution') => {
        setDrawerMode(mode); setLoadingDetails(true); setDetailOpen(true); setFilters({ date: '', team: '', shift: '', durationMin: '', durationMax: '' });
        setTimeout(() => setLoadingDetails(false), 200);
    };

    const currentList = drawerMode === 'stability' ? stabilityDetails : distributionDetails;
    const filteredDetails = currentList.filter(item => { const matchDate = !filters.date || item.startTime.includes(filters.date); const matchTeam = !filters.team || item.team === filters.team; const matchShift = !filters.shift || item.shiftType === filters.shift; const matchMin = !filters.durationMin || item.duration >= Number(filters.durationMin); const matchMax = !filters.durationMax || item.duration <= Number(filters.durationMax); return matchDate && matchTeam && matchShift && matchMin && matchMax; });
    const drawerTitle = drawerMode === 'stability' ? "班组开机稳定性分布 - 详细数据" : "开机时长分布 - 详细数据";

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 min-h-[380px]">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative flex flex-col"><div className="absolute top-4 right-4 z-10"><button onClick={() => handleViewData('stability')} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">查看数据</button></div><div ref={stabilityChartRef} className="flex-1 w-full min-h-[320px]"></div></div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative flex flex-col"><div className="absolute top-4 right-4 z-10"><button onClick={() => handleViewData('distribution')} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">查看数据</button></div><div ref={distributionChartRef} className="flex-1 w-full min-h-[320px]"></div></div>
            </div>
            {detailOpen && (
                <StandardDrawer title={drawerTitle} onClose={() => setDetailOpen(false)} width="w-[800px]" footer={<button className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors" onClick={() => setDetailOpen(false)}>关闭</button>}>
                    <div className="flex flex-col h-full space-y-4 p-6">
                        <SearchFilterCard actions={<div className="text-gray-400 text-xs self-center">实时过滤</div>}><FilterItem label="日期/时间"><input type="text" placeholder="YYYY-MM-DD" className={STD_INPUT_CLASS} value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} /></FilterItem><FilterItem label="班组"><select className={STD_INPUT_CLASS} value={filters.team} onChange={e => setFilters({...filters, team: e.target.value})}><option value="">全部</option><option value="甲">甲</option><option value="乙">乙</option><option value="丙">丙</option><option value="丁">丁</option></select></FilterItem><FilterItem label="值班类型"><select className={STD_INPUT_CLASS} value={filters.shift} onChange={e => setFilters({...filters, shift: e.target.value})}><option value="">全部</option><option value="早班">早班</option><option value="中班">中班</option><option value="晚班">晚班</option></select></FilterItem><FilterItem label="开机耗时(分)"><div className="flex items-center gap-1"><input type="number" placeholder="Min" className={`${STD_INPUT_CLASS} text-center`} value={filters.durationMin} onChange={e => setFilters({...filters, durationMin: e.target.value})} /><span className="text-gray-400">-</span><input type="number" placeholder="Max" className={`${STD_INPUT_CLASS} text-center`} value={filters.durationMax} onChange={e => setFilters({...filters, durationMax: e.target.value})} /></div></FilterItem></SearchFilterCard>
                        <DataListCard>
                            <table className={StdTable.Table}>
                                <thead className={StdTable.Thead}><tr><th className={StdTable.Th}>开机时间</th><th className={StdTable.Th}>班组</th><th className={StdTable.Th}>值班类型</th><th className={StdTable.Th}>开机耗时 (分钟)</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {loadingDetails ? (<tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>) : filteredDetails.length > 0 ? (filteredDetails.map((item, idx) => (<tr key={idx} className={StdTable.Tr}><td className={`${StdTable.Td} font-mono text-gray-600`}>{item.startTime}</td><td className={StdTable.Td}><span className={`px-2 py-0.5 rounded text-xs font-bold border ${item.team === '甲' ? 'bg-blue-50 text-blue-700 border-blue-100' : item.team === '乙' ? 'bg-green-50 text-green-700 border-green-100' : item.team === '丙' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>{item.team}</span></td><td className={`${StdTable.Td} text-gray-600`}>{item.shiftType}</td><td className={`${StdTable.Td} font-bold text-gray-800`}>{item.duration}</td></tr>))) : (<tr><td colSpan={4} className={StdTable.Empty}>暂无匹配数据</td></tr>)}
                                </tbody>
                            </table>
                        </DataListCard>
                    </div>
                </StandardDrawer>
            )}
        </>
    );
};

// --- 新增图表组件 3: 合格率统计 (New Feature) ---

const QualifiedRateSection: React.FC = () => {
    const freenessChartRef = useRef<HTMLDivElement>(null);
    const fiberChartRef = useRef<HTMLDivElement>(null);
    const freenessInstance = useRef<echarts.ECharts | null>(null);
    const fiberInstance = useRef<echarts.ECharts | null>(null);

    // 状态管理
    const [chartData, setChartData] = useState<DailyTeamQualifiedRate[]>([]);
    const [detailList, setDetailList] = useState<QualifiedRateStatsDetail[]>([]);
    
    // 汇总实体类数据 (QualifiedRateStats)
    const [summaryStats, setSummaryStats] = useState<QualifiedRateStats | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailType, setDetailType] = useState<'freeness' | 'fiber'>('freeness'); // 当前查看的详情类型
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    // 筛选状态
    const [filters, setFilters] = useState({ date: '', team: '' });

    // 初始化获取详细数据
    useEffect(() => {
        setLoadingDetails(true);
        // 使用详细数据接口作为源数据
        fetchQualifiedRateDetails().then(res => {
            setDetailList(res.data);
            setLoadingDetails(false);
        });
    }, []);

    // 核心逻辑：基于详细数据聚合生成图表数据 (Client-side Aggregation)
    useEffect(() => {
        if (detailList.length === 0) return;

        // 1. 聚合逻辑
        const aggregationMap = new Map<string, { 
            freeness: { [key: string]: { sum: number, count: number } },
            fiber: { [key: string]: { sum: number, count: number } }
        }>();

        detailList.forEach(item => {
            // 过滤掉 '平均' 类型的行，只统计具体班组
            if (item.team === '平均') return;

            const dateStr = item.time.slice(0, 10); // YYYY-MM-DD
            if (!aggregationMap.has(dateStr)) {
                aggregationMap.set(dateStr, { freeness: {}, fiber: {} });
            }
            const entry = aggregationMap.get(dateStr)!;
            
            // 初始化班组桶
            if (!entry.freeness[item.team]) entry.freeness[item.team] = { sum: 0, count: 0 };
            if (!entry.fiber[item.team]) entry.fiber[item.team] = { sum: 0, count: 0 };

            // 累加
            entry.freeness[item.team].sum += item.freenessQualifiedRate;
            entry.freeness[item.team].count += 1;
            entry.fiber[item.team].sum += item.fiberLengthQualifiedRate;
            entry.fiber[item.team].count += 1;
        });

        // 2. 转换为 DailyTeamQualifiedRate[]
        const aggregatedData: DailyTeamQualifiedRate[] = [];
        // 按日期排序
        const sortedDates = Array.from(aggregationMap.keys()).sort();

        let totalFreenessSum = 0;
        let totalFreenessCount = 0;
        let totalFiberSum = 0;
        let totalFiberCount = 0;

        sortedDates.forEach(date => {
            const entry = aggregationMap.get(date)!;
            
            // 辅助计算函数
            const calcAvg = (bucket: any, team: string) => 
                bucket[team] ? parseFloat((bucket[team].sum / bucket[team].count).toFixed(2)) : 0; 

            // 计算该日总合格率 (所有班组平均)
            const dailyTotalF = Object.values(entry.freeness).reduce((acc: any, cur: any) => acc + cur.sum, 0) / 
                                Object.values(entry.freeness).reduce((acc: any, cur: any) => acc + cur.count, 0) || 0;
            
            const dailyTotalL = Object.values(entry.fiber).reduce((acc: any, cur: any) => acc + cur.sum, 0) / 
                                Object.values(entry.fiber).reduce((acc: any, cur: any) => acc + cur.count, 0) || 0;

            // 全局累加用于计算 SummaryStats
            Object.values(entry.freeness).forEach((v: any) => { totalFreenessSum += v.sum; totalFreenessCount += v.count; });
            Object.values(entry.fiber).forEach((v: any) => { totalFiberSum += v.sum; totalFiberCount += v.count; });

            aggregatedData.push({
                date: date,
                freeness: {
                    teamA: calcAvg(entry.freeness, '甲'),
                    teamB: calcAvg(entry.freeness, '乙'),
                    teamC: calcAvg(entry.freeness, '丙'),
                    teamD: calcAvg(entry.freeness, '丁'),
                    total: parseFloat(dailyTotalF.toFixed(2))
                },
                fiberLength: {
                    teamA: calcAvg(entry.fiber, '甲'),
                    teamB: calcAvg(entry.fiber, '乙'),
                    teamC: calcAvg(entry.fiber, '丙'),
                    teamD: calcAvg(entry.fiber, '丁'),
                    total: parseFloat(dailyTotalL.toFixed(2))
                }
            });
        });

        setChartData(aggregatedData);

        // 3. 生成 QualifiedRateStats 实体数据 (全局汇总)
        const stats: QualifiedRateStats = {
            teamFreenessQualifiedRate: parseFloat((totalFreenessSum / totalFreenessCount).toFixed(2)) || 0,
            avgFreenessQualifiedRate: parseFloat((totalFreenessSum / totalFreenessCount).toFixed(2)) || 0,
            teamFiberLengthQualifiedRate: parseFloat((totalFiberSum / totalFiberCount).toFixed(2)) || 0,
            avgFiberLengthQualifiedRate: parseFloat((totalFiberSum / totalFiberCount).toFixed(2)) || 0
        };
        setSummaryStats(stats); 

    }, [detailList]);

    // 绘图通用配置生成器 (增加 dataZoom 并修复布局)
    const getChartOption = (title: string, dataKey: 'freeness' | 'fiberLength', yMin: number = 85): echarts.EChartsOption => {
        const dates = chartData.map(d => d.date.slice(5)); // MM-DD
        const seriesData = (key: 'teamA'|'teamB'|'teamC'|'teamD'|'total') => chartData.map(d => d[dataKey][key]);

        return {
            title: {
                text: title,
                left: 'center',
                top: 5,
                textStyle: { fontSize: 16, fontWeight: 'bold', color: '#334155' }
            },
            tooltip: { trigger: 'axis' },
            legend: {
                data: ['甲班', '乙班', '丙班', '丁班', '总合格率'],
                top: 30,
                icon: 'roundRect'
            },
            // FIX: Increase bottom margin to 80px to accommodate dataZoom and labels comfortably
            grid: { left: '3%', right: '4%', bottom: 80, top: '20%', containLabel: true }, 
            // 添加 DataZoom (时间轴)
            dataZoom: [{
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                start: 0,
                end: 100,
                bottom: 25, // Move slider up from the absolute bottom edge
                height: 20,
                borderColor: 'transparent',
                backgroundColor: '#f1f5f9',
                fillerColor: 'rgba(59, 130, 246, 0.1)',
                handleStyle: {
                    color: '#3b82f6',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                axisLabel: { color: '#64748b' }
            },
            yAxis: {
                type: 'value',
                name: '合格率%',
                min: yMin,
                max: 100,
                splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
                axisLabel: { color: '#64748b' }
            },
            series: [
                { name: '甲班', type: 'line', smooth: true, showSymbol: true, symbol: 'circle', symbolSize: 6, data: seriesData('teamA'), itemStyle: { color: '#5470c6' } },
                { name: '乙班', type: 'line', smooth: true, showSymbol: true, symbol: 'circle', symbolSize: 6, data: seriesData('teamB'), itemStyle: { color: '#91cc75' } },
                { name: '丙班', type: 'line', smooth: true, showSymbol: true, symbol: 'circle', symbolSize: 6, data: seriesData('teamC'), itemStyle: { color: '#fac858' } },
                { name: '丁班', type: 'line', smooth: true, showSymbol: true, symbol: 'circle', symbolSize: 6, data: seriesData('teamD'), itemStyle: { color: '#ee6666' } },
                { 
                    name: '总合格率', 
                    type: 'line', 
                    smooth: true, 
                    symbol: 'circle', 
                    symbolSize: 8,
                    itemStyle: { color: '#fff', borderColor: '#333', borderWidth: 2 },
                    lineStyle: { color: '#333', width: 3 },
                    label: {
                        show: true,
                        position: 'top',
                        color: '#333',
                        fontWeight: 'bold',
                        formatter: '{c}',
                        backgroundColor: '#fff',
                        padding: [2, 4],
                        borderRadius: 2
                    },
                    data: seriesData('total'),
                    z: 10 
                }
            ]
        };
    };

    // 渲染图表
    useEffect(() => {
        if (!freenessChartRef.current || !fiberChartRef.current || chartData.length === 0) return;

        if (!freenessInstance.current) freenessInstance.current = echarts.init(freenessChartRef.current);
        if (!fiberInstance.current) fiberInstance.current = echarts.init(fiberChartRef.current);

        freenessInstance.current.setOption(getChartOption('每日叩解度合格率统计', 'freeness', 90));
        fiberInstance.current.setOption(getChartOption('每日纤维长度合格率', 'fiberLength', 94));

        const handleResize = () => {
            freenessInstance.current?.resize();
            fiberInstance.current?.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [chartData]);

    const handleViewDetails = (type: 'freeness' | 'fiber') => {
        setDetailType(type);
        setDetailOpen(true);
        setFilters({ date: '', team: '' });
    };

    // 过滤详细数据 (抽屉列表使用)
    const filteredDetails = detailList.filter(item => {
        const matchDate = !filters.date || item.time.includes(filters.date);
        const matchTeam = !filters.team || item.team === filters.team;
        return matchDate && matchTeam;
    });

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4 min-h-[450px] flex flex-col">
                {/* 顶部标题栏 */}
                <div className="flex items-center gap-2 mb-4 border-l-4 border-blue-500 pl-3">
                    <div className="text-gray-800 font-bold text-lg">合格率统计</div>
                    {/* 调试信息：展示关联的汇总实体数据，证明关联性 */}
                    {summaryStats && (
                        <div className="text-xs text-gray-400 font-mono ml-4 hidden lg:block">
                            (Avg Freeness: {summaryStats.avgFreenessQualifiedRate}%, Avg Fiber: {summaryStats.avgFiberLengthQualifiedRate}%)
                        </div>
                    )}
                </div>

                {loadingDetails && chartData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">正在基于详细数据生成图表...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                        {/* 左图表：叩解度 */}
                        <div className="relative border border-gray-100 rounded-xl p-2 bg-slate-50/30">
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={() => handleViewDetails('freeness')}
                                    className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100 flex items-center gap-1"
                                >
                                    <span className="text-lg leading-none">⋮≡</span> 查看数据
                                </button>
                            </div>
                            <div ref={freenessChartRef} className="w-full h-[400px]"></div> {/* 容器高度调整 */}
                        </div>

                        {/* 右图表：纤维长度 */}
                        <div className="relative border border-gray-100 rounded-xl p-2 bg-slate-50/30">
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={() => handleViewDetails('fiber')}
                                    className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100 flex items-center gap-1"
                                >
                                    <span className="text-lg leading-none">⋮≡</span> 查看数据
                                </button>
                            </div>
                            <div ref={fiberChartRef} className="w-full h-[400px]"></div> {/* 容器高度调整 */}
                        </div>
                    </div>
                )}
            </div>

            {/* 详细数据抽屉 */}
            {detailOpen && (
                <StandardDrawer
                    title={detailType === 'freeness' ? '每日叩解度合格率 - 详细数据' : '每日纤维长度合格率 - 详细数据'}
                    onClose={() => setDetailOpen(false)}
                    width="w-[800px]"
                    footer={
                        <button 
                            className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            onClick={() => setDetailOpen(false)}
                        >
                            关闭
                        </button>
                    }
                >
                    <div className="flex flex-col h-full space-y-4 p-6">
                        <SearchFilterCard actions={<div className="text-gray-400 text-xs self-center">实时过滤</div>}>
                            <FilterItem label="日期/时间">
                                <input type="text" placeholder="YYYY-MM-DD" className={STD_INPUT_CLASS} value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
                            </FilterItem>
                            <FilterItem label="班组">
                                <select className={STD_INPUT_CLASS} value={filters.team} onChange={e => setFilters({...filters, team: e.target.value})}>
                                    <option value="">全部</option>
                                    <option value="甲">甲</option>
                                    <option value="乙">乙</option>
                                    <option value="丙">丙</option>
                                    <option value="丁">丁</option>
                                    <option value="平均">平均(总)</option>
                                </select>
                            </FilterItem>
                        </SearchFilterCard>
                        
                        <DataListCard>
                            <table className={StdTable.Table}>
                                <thead className={StdTable.Thead}>
                                    <tr>
                                        <th className={StdTable.Th}>时间</th>
                                        <th className={StdTable.Th}>班组</th>
                                        <th className={StdTable.Th}>
                                            {detailType === 'freeness' ? '叩解度合格率 (%)' : '纤维长度合格率 (%)'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {loadingDetails ? (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
                                    ) : filteredDetails.length > 0 ? (
                                        filteredDetails.map((item, idx) => (
                                            <tr key={idx} className={StdTable.Tr}>
                                                <td className={`${StdTable.Td} font-mono text-gray-600`}>{item.time}</td>
                                                <td className={StdTable.Td}>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border 
                                                        ${item.team === '甲' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        item.team === '乙' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        item.team === '丙' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        item.team === '丁' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                        'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                        {item.team}
                                                    </span>
                                                </td>
                                                <td className={`${StdTable.Td} font-bold text-gray-800`}>
                                                    {detailType === 'freeness' ? item.freenessQualifiedRate : item.fiberLengthQualifiedRate}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={3} className={StdTable.Empty}>暂无匹配数据</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </DataListCard>
                    </div>
                </StandardDrawer>
            )}
        </>
    );
};

/**
 * 班组绩效管理页面 (主组件)
 */
export const TeamPerformance: React.FC = () => {
  // ... (keep existing setup code) ...
  // 1. 初始化默认时间
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // 2. 状态管理
  const [filters, setFilters] = useState({
    startDate: formatDate(lastMonth),
    endDate: formatDate(today),
    team: '全部'
  });

  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);

  // 3. 数据获取
  useEffect(() => {
    fetchOverallStats().then(res => {
       setOverallStats(res.data);
    });
  }, []);

  const handleSearch = () => {
    console.log('Search filters:', filters);
  };

  const handleReset = () => {
    setFilters({
      startDate: formatDate(lastMonth),
      endDate: formatDate(today),
      team: '全部'
    });
  };

  return (
    <AdminPageWrapper>
      {/* 顶部搜索栏 */}
      <SearchFilterCard
        actions={
          <>
            <button 
              onClick={handleSearch}
              className="px-5 py-2 bg-system-primary text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
               查询
            </button>
            <button 
               onClick={handleReset}
               className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white"
            >
               重置
            </button>
          </>
        }
      >
        <FilterItem label="开始时间">
          <input 
            type="date" 
            className={STD_INPUT_CLASS}
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
        </FilterItem>
        <FilterItem label="结束时间">
          <input 
            type="date" 
            className={STD_INPUT_CLASS}
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </FilterItem>
        <FilterItem label="选择班组">
           <select 
              className={STD_INPUT_CLASS}
              value={filters.team}
              onChange={(e) => setFilters({...filters, team: e.target.value})}
            >
              <option value="全部">全部</option>
              <option value="甲">甲</option>
              <option value="乙">乙</option>
              <option value="丙">丙</option>
              <option value="丁">丁</option>
            </select>
        </FilterItem>
      </SearchFilterCard>

      {/* 综合统计卡片区 - 使用 6 列 Grid 布局优化空间分配 */}
      {overallStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Card 1: 平均开机时长 (XL: 1 col) */}
          <StatCard title="平均开机时长" className="xl:col-span-1">
             <div className="flex items-baseline gap-2">
                {/* 关联实体类定义：avgStartupDuration (.0) */}
                <span className="text-4xl font-bold text-gray-800 tracking-tight">{overallStats.avgStartupDuration.toFixed(1)}</span>
                <span className="text-sm text-gray-500 font-medium">分钟</span>
             </div>
          </StatCard>

          {/* Card 2: 开机次数 (XL: 1 col) */}
          <StatCard title="开机次数" className="xl:col-span-1">
             <div className="flex items-baseline gap-2">
                {/* 关联实体类定义：startupCount (整数) */}
                <span className="text-4xl font-bold text-blue-600 tracking-tight">{overallStats.startupCount}</span>
                <span className="text-sm text-gray-500 font-medium">次</span>
             </div>
          </StatCard>

          {/* Card 3: 叩解度合格率 (列表) (XL: 2 cols - Double Width) */}
          <StatCard title="叩解度合格率" subTitle="(%)" className="md:col-span-2 xl:col-span-2">
             <div className="flex w-full justify-between items-center gap-2 px-2">
                {overallStats.teamFreenessQualifiedRate.map((item) => (
                   <RateItemView 
                      key={item.team} 
                      item={item} 
                      allItems={overallStats.teamFreenessQualifiedRate} 
                   />
                ))}
             </div>
          </StatCard>

          {/* Card 4: 纤维长度合格率 (列表) (XL: 2 cols - Double Width) */}
          <StatCard title="纤维长度合格率" subTitle="(%)" className="md:col-span-2 xl:col-span-2">
             <div className="flex w-full justify-between items-center gap-2 px-2">
                {overallStats.teamFiberLengthQualifiedRate.map((item) => (
                   <RateItemView 
                      key={item.team} 
                      item={item} 
                      allItems={overallStats.teamFiberLengthQualifiedRate} 
                   />
                ))}
             </div>
          </StatCard>
        </div>
      ) : (
         <div className="h-[120px] flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
            加载统计数据...
         </div>
      )}

      {/* 原有图表区域: 每日开机时长 */}
      <StartupChartsSection />
      
      {/* 新增图表区域: 稳定性与分布 */}
      <StabilityDistributionSection />
      
      {/* 新增图表区域: 合格率统计 */}
      <QualifiedRateSection />
      
      {/* 下方内容区占位 */}
      <div className="flex-1 bg-transparent h-10"></div>
    </AdminPageWrapper>
  );
};
