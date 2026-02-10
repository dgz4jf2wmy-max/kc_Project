
import React, { useState, useEffect } from 'react';
// 引入新的标准组件
import { 
  AdminPageWrapper, 
  SearchFilterCard, 
  FilterItem, 
  DataListCard, 
  StandardDrawer, // 引入标准抽屉
  STD_INPUT_CLASS,
  StdTable
} from '../../components/admin/StandardLayouts';
import { fetchKnifeList, fetchKnifeUsageHistory, fetchKnifeGapAnalysis } from '../../services/mockDataService';
import { KnifeDisc, KnifeUsageRecord, KnifeGapRecord } from '../../types';

/**
 * 状态标签组件 (颜色已更新)
 * 闲置：蓝色
 * 在用：绿色
 * 报废：灰色
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    idle: 'bg-blue-50 text-blue-600 border-blue-100',      // 蓝色
    in_use: 'bg-green-50 text-green-600 border-green-100', // 绿色
    scrapped: 'bg-gray-100 text-gray-500 border-gray-200', // 灰色
  };
  
  const labels: Record<string, string> = {
    idle: '闲置',
    in_use: '在用',
    scrapped: '报废'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || styles.idle}`}>
      {labels[status] || status}
    </span>
  );
};

// --- 新增：SVG 间隙趋势图组件 ---
const GapTrendChart: React.FC<{ data: KnifeGapRecord[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 bg-gray-50 rounded text-gray-400 text-sm">暂无趋势数据</div>;
  }

  // 1. 数据预处理 (按日期排序)
  const sorted = [...data].sort((a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime());

  // 2. 画布配置
  // 逻辑宽度设定为 600，配合 viewBox 实现响应式缩放，无需滚动条
  const width = 600; 
  const height = 220;
  const padding = { top: 30, right: 30, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // 3. 计算比例尺
  const values = sorted.map(d => d.gapValue);
  const minVal = 0; // 间隙基准通常从0开始
  const maxVal = Math.max(...values, 0.5) * 1.3; // 留出顶部 30% 空间，防止数值顶格

  // X轴坐标映射
  const getX = (index: number) => {
     if (sorted.length <= 1) return padding.left + graphWidth / 2;
     return padding.left + (index / (sorted.length - 1)) * graphWidth;
  };

  // Y轴坐标映射
  const getY = (val: number) => {
     const ratio = (val - minVal) / (maxVal - minVal);
     return padding.top + graphHeight - (ratio * graphHeight);
  };

  // 4. 生成路径 (Line Path)
  const points = sorted.map((d, i) => `${getX(i)},${getY(d.gapValue)}`).join(' ');
  const linePath = `M ${points}`;
  
  // 5. 生成填充区域 (Area Path) - 用于渐变背景
  const areaPath = `${linePath} L ${getX(sorted.length - 1)},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;

  return (
    // 修改点：移除 overflow-x-auto，使用 w-full 让容器自适应
    <div className="w-full select-none">
       {/* 修改点：添加 viewBox 实现响应式，移除固定 width/height 属性，改用 CSS 类 */}
       <svg 
         viewBox={`0 0 ${width} ${height}`} 
         className="w-full h-auto overflow-visible block"
         preserveAspectRatio="xMidYMid meet"
       >
          {/* Y轴 网格线与刻度 */}
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

          {/* 填充区域 */}
          <path d={areaPath} fill="url(#gradientBlue)" opacity="0.15" />
          
          {/* 折线主体 */}
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* 数据点与交互 */}
          {sorted.map((d, i) => (
            <g key={d.id} className="group cursor-pointer">
              {/* 隐形触发区，增加 hover 面积 */}
              <circle cx={getX(i)} cy={getY(d.gapValue)} r="12" fill="transparent" />
              {/* 实际可见点 */}
              <circle cx={getX(i)} cy={getY(d.gapValue)} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2" className="transition-all duration-200 group-hover:r-5 group-hover:stroke-blue-700" />
              
              {/* Tooltip / Label (Hover 显示) */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ transform: 'translateY(-8px)' }}>
                 <rect x={getX(i) - 20} y={getY(d.gapValue) - 34} width="40" height="22" rx="4" fill="#1e293b" />
                 {/* 小三角 */}
                 <path d={`M ${getX(i)} ${getY(d.gapValue) - 12} L ${getX(i) - 4} ${getY(d.gapValue) - 16} L ${getX(i) + 4} ${getY(d.gapValue) - 16} Z`} fill="#1e293b" />
                 <text x={getX(i)} y={getY(d.gapValue) - 19} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">{d.gapValue}</text>
              </g>
            </g>
          ))}

          {/* X轴 标签 */}
          {sorted.map((d, i) => (
             <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">
               {d.weekDate.slice(5)}
             </text>
          ))}

          {/* 渐变定义 */}
          <defs>
            <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
       </svg>
    </div>
  );
};


export const KnifeManagement: React.FC = () => {
  // 数据与状态
  const [knives, setKnives] = useState<KnifeDisc[]>([]);
  const [filters, setFilters] = useState({ id: '', model: '', type: '', status: '' });
  const [selectedKnife, setSelectedKnife] = useState<KnifeDisc | null>(null);
  
  // 详情页附属数据状态
  const [usageHistory, setUsageHistory] = useState<KnifeUsageRecord[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<KnifeGapRecord[]>([]);
  
  // 详情页 TAB 状态
  const [activeTab, setActiveTab] = useState<'archive' | 'device_relation' | 'data'>('archive');

  // MOCK 数据 - 静态参数 (符合截图列结构，同时包含需求数据)
  const [staticParams] = useState([
    { 
      id: 1, 
      name: '预计寿命时长', 
      tag: 'estimated_lifespan', // 推导字段
      dataType: '数字', 
      unit: '小时', 
      value: '500' 
    }
  ]);

  useEffect(() => {
    fetchKnifeList().then(res => setKnives(res.data));
  }, []);

  // 选中刀盘时，获取附属数据并重置 TAB
  useEffect(() => {
    if (selectedKnife) {
      setActiveTab('archive');
      // 并行获取详情数据
      fetchKnifeUsageHistory(selectedKnife.id).then(res => setUsageHistory(res.data));
      fetchKnifeGapAnalysis(selectedKnife.id).then(res => setGapAnalysis(res.data));
    }
  }, [selectedKnife]);

  const filteredKnives = knives.filter(k => {
    return (
      (!filters.id || k.id.includes(filters.id)) &&
      (!filters.model || k.model.includes(filters.model)) &&
      (!filters.type || k.type === filters.type) &&
      (!filters.status || k.status === filters.status)
    );
  });

  const handleReset = () => {
    setFilters({ id: '', model: '', type: '', status: '' });
  };

  // 辅助组件：详情页中的字段展示项
  const DetailField: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="text-sm text-gray-900 font-medium min-h-[20px]">{value}</div>
    </div>
  );

  // --- 渲染部分 ---

  return (
    <AdminPageWrapper>
      
      {/* 模块 1: 搜索筛选区 */}
      <SearchFilterCard
        actions={
          <>
            <button className="px-5 py-2 bg-system-primary text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm">
               查询
            </button>
            <button 
               className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white"
               onClick={handleReset}
            >
               重置
            </button>
          </>
        }
      >
        <FilterItem label="刀盘编号">
          <input 
            type="text" 
            placeholder="请输入编号" 
            className={STD_INPUT_CLASS}
            value={filters.id}
            onChange={(e) => setFilters({...filters, id: e.target.value})}
          />
        </FilterItem>

        <FilterItem label="刀盘型号">
           <input 
              type="text" 
              placeholder="请输入型号" 
              className={STD_INPUT_CLASS}
              value={filters.model}
              onChange={(e) => setFilters({...filters, model: e.target.value})}
            />
        </FilterItem>

        <FilterItem label="刀盘类型">
           <select 
              className={STD_INPUT_CLASS}
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">全部类型</option>
              <option value="cut">切刀</option>
              <option value="grind">磨刀</option>
            </select>
        </FilterItem>

        <FilterItem label="状态">
           <select 
              className={STD_INPUT_CLASS}
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">全部状态</option>
              <option value="idle">闲置</option>
              <option value="in_use">在用</option>
              <option value="scrapped">报废</option>
            </select>
        </FilterItem>
      </SearchFilterCard>

      {/* 模块 2: 数据列表区 */}
      <DataListCard
        // 顶部工具栏
        header={
          <>
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-system-primary hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
                onClick={() => alert('新建功能待实现')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新增刀盘
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white">
                批量导出
              </button>
            </div>
            <div className="flex gap-2 text-gray-400">
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="刷新"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
            </div>
          </>
        }
        // 底部翻页
        footer={
           <div className="flex justify-end items-center gap-4">
             <span className="text-sm text-gray-500">共 {filteredKnives.length} 条</span>
             <div className="flex items-center gap-1">
               <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-system-primary hover:text-system-primary text-sm disabled:opacity-50 disabled:bg-gray-50" disabled>&lt;</button>
               <button className="w-8 h-8 flex items-center justify-center bg-system-primary text-white rounded text-sm font-medium shadow-sm">1</button>
               <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:border-system-primary hover:text-system-primary text-sm bg-white">2</button>
               <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-system-primary hover:text-system-primary text-sm disabled:opacity-50 disabled:bg-gray-50" disabled>&gt;</button>
             </div>
             <select className="border border-gray-300 rounded text-sm py-1 px-2 text-gray-600 outline-none focus:border-system-primary bg-white">
               <option>10 条/页</option>
               <option>20 条/页</option>
               <option>50 条/页</option>
             </select>
          </div>
        }
      >
        {/* 表格主体 */}
        <table className={StdTable.Table}>
          <thead className={StdTable.Thead}>
            <tr>
              {/* 0. 复选框 */}
              <th className={`${StdTable.Th} w-16 text-center`}>
                <input type="checkbox" className="rounded border-gray-300 text-system-primary focus:ring-system-primary w-4 h-4" />
              </th>
              {/* 1. 序号 */}
              <th className={`${StdTable.Th} w-16 text-center`}>序号</th>
              {/* 2. 当前状态 */}
              <th className={StdTable.Th}>当前状态</th>
              {/* 3. 刀盘型号 */}
              <th className={StdTable.Th}>刀盘型号</th>
              {/* 4. 刀盘类型 */}
              <th className={StdTable.Th}>刀盘类型</th>
              {/* 5. 刀盘标记 (新增) */}
              <th className={StdTable.Th}>刀盘标记</th>
              {/* 6. 刀盘编号 */}
              <th className={StdTable.Th}>刀盘编号</th>
              {/* 7. 累计使用时长 */}
              <th className={`${StdTable.Th} text-right`}>累计使用时长 (h)</th>
              {/* 8. 最后上机时间 */}
              <th className={StdTable.Th}>最后上机时间</th>
              {/* 9. 最后下机时间 */}
              <th className={StdTable.Th}>最后下机时间</th>
              {/* 10. 操作 */}
              <th className={`${StdTable.Th} text-center`}>操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredKnives.length > 0 ? (
              filteredKnives.map((knife, index) => (
                <tr key={knife.id} className={StdTable.Tr}>
                  {/* 复选框 */}
                  <td className="px-5 py-3 text-center border-b border-gray-100">
                    <input type="checkbox" className="rounded border-gray-300 text-system-primary focus:ring-system-primary w-4 h-4" />
                  </td>
                  {/* 序号 */}
                  <td className={`${StdTable.Td} text-center text-gray-500`}>{index + 1}</td>
                  {/* 当前状态 */}
                  <td className={StdTable.Td}><StatusBadge status={knife.status} /></td>
                  {/* 刀盘型号 */}
                  <td className={`${StdTable.Td} text-gray-700`}>{knife.model}</td>
                  {/* 刀盘类型 */}
                  <td className={`${StdTable.Td} text-gray-700`}>{knife.type === 'cut' ? '切刀' : '磨刀'}</td>
                  {/* 刀盘标记 (新增) */}
                  <td className={StdTable.Td}>
                    {knife.mark ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                         {knife.mark}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  {/* 刀盘编号 */}
                  <td className={`${StdTable.Td} font-medium text-gray-900`}>{knife.id}</td>
                  {/* 累计使用时长 */}
                  <td className={`${StdTable.Td} text-right font-mono text-gray-600`}>{knife.usageHours.toFixed(1)}</td>
                  {/* 上机时间 */}
                  <td className={`${StdTable.Td} text-gray-500 font-mono`}>{knife.lastUpTime || '-'}</td>
                  {/* 下机时间 */}
                  <td className={`${StdTable.Td} text-gray-500 font-mono`}>{knife.lastDownTime}</td>
                  {/* 操作 */}
                  <td className={`${StdTable.Td} text-center`}>
                    <button 
                      className="text-system-primary hover:text-blue-800 font-medium text-sm"
                      onClick={() => setSelectedKnife(knife)}
                    >
                      详情
                    </button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button className="text-gray-500 hover:text-red-600 font-medium text-sm">
                      删除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className={StdTable.Empty}>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                       <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                     <span>暂无数据</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DataListCard>

      {/* 4. 详情抽屉 (Slide-over) - 使用标准组件 */}
      {selectedKnife && (
        <StandardDrawer
          title={`刀盘详情 - ${selectedKnife.id}`}
          onClose={() => setSelectedKnife(null)}
          footer={
             <>
              <button 
                className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors"
                onClick={() => setSelectedKnife(null)}
              >
                关闭
              </button>
              {activeTab === 'archive' && (
                <button className="px-5 py-2 rounded bg-system-primary hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm">
                  编辑档案
                </button>
              )}
             </>
          }
        >
             {/* Tabs */}
             <div className="flex border-b border-gray-200 bg-white sticky top-0 z-20 px-6 shadow-sm flex-none">
                {[
                  { id: 'archive', label: '刀盘档案' },
                  { id: 'device_relation', label: '设备关联维度' },
                  { id: 'data', label: '静态参数' }, // 更新 Label 以反映只有静态参数
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`mr-8 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id 
                      ? 'border-system-primary text-system-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="p-6">
                {activeTab === 'archive' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* 区域 1: 基础数据 */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                       <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-system-primary pl-2">
                         基础数据
                       </h3>
                       <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                         <DetailField label="状态" value={<StatusBadge status={selectedKnife.status} />} />
                         <DetailField label="刀盘编号" value={selectedKnife.id} />
                         <DetailField label="刀盘型号" value={selectedKnife.model} />
                         <DetailField label="刀盘类型" value={selectedKnife.type === 'cut' ? '切刀' : '磨刀'} />
                         
                         <DetailField label="累计使用时长" value={<span className="font-mono">{selectedKnife.usageHours.toFixed(1)} h</span>} />
                         <div className="hidden"></div> {/* 占位，保持 Grid 对齐 */}

                         <DetailField label="最后下机时间" value={selectedKnife.lastDownTime} />
                         <DetailField label="最后上机时间" value={selectedKnife.lastUpTime} />
                         
                         <DetailField label="刀盘标记" value={<span className="text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">{selectedKnife.mark || '无'}</span>} fullWidth />
                         <DetailField label="备注" value={selectedKnife.remark || '-'} fullWidth />
                       </div>
                    </div>

                    {/* 区域 2: 使用记录 */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-system-primary pl-2">
                         使用记录
                       </h3>
                      <div className="border border-gray-100 rounded overflow-hidden">
                         <table className="w-full text-sm text-left">
                           <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                             <tr>
                               <th className="px-4 py-2">日期</th>
                               <th className="px-4 py-2">使用类型</th>
                               <th className="px-4 py-2">设备</th>
                               <th className="px-4 py-2">班组</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                             {usageHistory.length > 0 ? (
                               usageHistory.map(r => (
                                 <tr key={r.id} className="hover:bg-gray-50/50">
                                   <td className="px-4 py-2 font-mono text-gray-600">{r.date}</td>
                                   <td className="px-4 py-2">
                                     <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                       r.type === 'up' 
                                       ? 'bg-green-50 text-green-600 border-green-100' 
                                       : 'bg-orange-50 text-orange-600 border-orange-100'
                                     }`}>
                                       {r.type === 'up' ? '上机' : '下机'}
                                     </span>
                                   </td>
                                   <td className="px-4 py-2 text-gray-900">{r.device}</td>
                                   <td className="px-4 py-2 text-gray-500">{r.team}</td>
                                 </tr>
                               ))
                             ) : (
                               <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无使用记录</td></tr>
                             )}
                           </tbody>
                         </table>
                      </div>
                    </div>

                    {/* 区域 3: 刀盘间隙趋势 (更新为图表) */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-system-primary pl-2">
                         刀盘间隙趋势 (自然周)
                       </h3>
                        <div className="border border-gray-100 rounded bg-white p-2">
                           <GapTrendChart data={gapAnalysis} />
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === 'device_relation' && (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 animate-in fade-in duration-300 bg-white rounded border border-gray-200 border-dashed">
                      <div className="mb-2">🔗</div>
                      <span className="text-sm">设备关联维度数据暂未接入</span>
                  </div>
                )}

                {activeTab === 'data' && (
                    <div className="animate-in fade-in duration-300 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
                        
                        {/* 1. 操作栏 */}
                        <div className="p-5 flex gap-3 border-b border-gray-100">
                             <button className="px-4 py-2 bg-system-primary hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm flex items-center gap-2 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                添加参数
                             </button>
                             <button className="px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-medium rounded transition-colors">
                                导入模板
                             </button>
                        </div>
                
                        {/* 2. 数据表格 */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-700 font-medium">
                                    <tr>
                                        {/* 恢复为截图一致的列结构 */}
                                        <th className="px-5 py-3 border-b border-gray-200">参数名称</th>
                                        <th className="px-5 py-3 border-b border-gray-200">英文标签</th>
                                        <th className="px-5 py-3 border-b border-gray-200">数据类型</th>
                                        <th className="px-5 py-3 border-b border-gray-200">单位</th>
                                        <th className="px-5 py-3 border-b border-gray-200">值</th>
                                        <th className="px-5 py-3 border-b border-gray-200 w-40">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                     {staticParams.map(param => (
                                         <tr key={param.id} className="hover:bg-gray-50">
                                             <td className="px-5 py-3 text-gray-900 font-medium">{param.name}</td>
                                             <td className="px-5 py-3 text-gray-500">{param.tag}</td>
                                             <td className="px-5 py-3 text-gray-500">{param.dataType}</td>
                                             <td className="px-5 py-3 text-gray-500">{param.unit}</td>
                                             <td className="px-5 py-3 text-gray-900 font-bold">{param.value}</td>
                                             <td className="px-5 py-3">
                                                 <div className="flex items-center gap-4">
                                                     <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
                                                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                         编辑
                                                     </button>
                                                     <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
                                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                         删除
                                                     </button>
                                                 </div>
                                             </td>
                                         </tr>
                                     ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
             </div>
        </StandardDrawer>
      )}
    </AdminPageWrapper>
  );
};
