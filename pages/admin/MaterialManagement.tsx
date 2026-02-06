import React, { useState, useEffect } from 'react';
import { 
  AdminPageWrapper, 
  SearchFilterCard, 
  FilterItem, 
  STD_INPUT_CLASS,
  StdTable
} from '../../components/admin/StandardLayouts';
import { fetchMaterialFeedList } from '../../services/materialService';
import { MaterialFeedRecord } from '../../types';

// ----------------------------------------------------------------------
// 辅助组件
// ----------------------------------------------------------------------

// 班组徽章
const TeamBadge: React.FC<{ team: string }> = ({ team }) => {
  const colors: Record<string, string> = {
    '甲': 'bg-blue-50 text-blue-700 border-blue-100',
    '乙': 'bg-green-50 text-green-700 border-green-100',
    '丙': 'bg-orange-50 text-orange-700 border-orange-100',
    '丁': 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[team] || 'bg-gray-100'}`}>
      {team}
    </span>
  );
};

// ----------------------------------------------------------------------
// 主页面组件
// ----------------------------------------------------------------------

export const MaterialManagement: React.FC = () => {
  const [feedRecords, setFeedRecords] = useState<MaterialFeedRecord[]>([]);
  const [filters, setFilters] = useState({ date: '', team: '' });

  useEffect(() => {
    fetchMaterialFeedList().then(res => setFeedRecords(res.data));
  }, []);

  // 过滤逻辑
  const filteredData = feedRecords.filter(item => {
    const matchDate = !filters.date || item.feedDate.includes(filters.date);
    const matchTeam = !filters.team || item.team === filters.team;
    return matchDate && matchTeam;
  });

  const handleReset = () => {
    setFilters({ date: '', team: '' });
  };

  // 表头定义
  const TableHeader = () => (
    <thead className="bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
      <tr>
        {/* 投料信息 (固定) */}
        <th className="px-4 py-3 border-b border-r border-gray-200 bg-gray-100 min-w-[120px] text-center">投料日期</th>
        <th className="px-4 py-3 border-b border-r border-gray-200 bg-gray-100 min-w-[80px] text-center">投料班组</th>
        <th className="px-4 py-3 border-b border-r border-gray-200 bg-gray-100 min-w-[120px] text-center">班组值班时间</th>
        
        {/* 物料信息 */}
        <th className="px-4 py-3 border-b border-gray-200 min-w-[140px]">批号</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[120px]">厂家</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[100px]">产品代号</th>
        
        {/* 物料指标 */}
        <th className="px-4 py-3 border-b border-gray-200 min-w-[100px]">浆板种类</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right bg-blue-50/30">数量(T)</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right">白度</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">尘埃<br/><span className="text-[10px] text-gray-400">mm²/m²</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">叩解度<br/><span className="text-[10px] text-gray-400">°SR</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">裂断长<br/><span className="text-[10px] text-gray-400">m</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">耐折度<br/><span className="text-[10px] text-gray-400">双次</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right">水份<br/><span className="text-[10px] text-gray-400">%</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">定量<br/><span className="text-[10px] text-gray-400">g/m²</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">荧光检查<br/><span className="text-[10px] text-gray-400">mm²/m²</span></th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right">L</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right">A</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-center">B</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">纤维长度</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[90px] text-right">异性纤维</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right">PH值</th>
        <th className="px-4 py-3 border-b border-gray-200 min-w-[80px] text-right">粘度</th>
      </tr>
    </thead>
  );

  return (
    <AdminPageWrapper>
      {/* 1. 筛选区 */}
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
         <FilterItem label="投料日期">
            <input 
              type="date" 
              className={STD_INPUT_CLASS}
              value={filters.date}
              onChange={e => setFilters({...filters, date: e.target.value})}
            />
         </FilterItem>
         <FilterItem label="投料班组">
             <select 
               className={STD_INPUT_CLASS}
               value={filters.team}
               onChange={e => setFilters({...filters, team: e.target.value})}
             >
               <option value="">全部班组</option>
               <option value="甲">甲班</option>
               <option value="乙">乙班</option>
               <option value="丙">丙班</option>
               <option value="丁">丁班</option>
             </select>
         </FilterItem>
      </SearchFilterCard>

      {/* 2. 台账表格区 */}
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden border border-gray-100">
        {/* 工具栏 */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-none">
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-system-primary hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新增投料台账
             </button>
             <button className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white">
                导出Excel
             </button>
          </div>
          <span className="text-sm text-gray-500">共 {filteredData.length} 次投料记录</span>
        </div>

        {/* 表格容器 - 支持横向滚动 */}
        <div className="flex-1 overflow-auto bg-white relative">
           <table className="w-full text-left border-collapse min-w-[2200px]">
              <TableHeader />
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                 {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <React.Fragment key={record.id}>
                        {record.batches.length > 0 ? (
                           record.batches.map((batch, idx) => (
                             <tr key={batch.id} className="hover:bg-blue-50/10 transition-colors">
                               {/* 合并单元格逻辑：只有第一行渲染投料信息 */}
                               {idx === 0 && (
                                 <>
                                   <td 
                                     rowSpan={record.batches.length} 
                                     className="px-4 py-3 border-b border-r border-gray-200 align-top bg-white font-mono text-gray-900 font-medium text-center"
                                   >
                                     <div className="sticky top-0 pt-2">{record.feedDate}</div>
                                   </td>
                                   <td 
                                     rowSpan={record.batches.length} 
                                     className="px-4 py-3 border-b border-r border-gray-200 align-top bg-white text-center"
                                   >
                                     <div className="sticky top-0 pt-2"><TeamBadge team={record.team} /></div>
                                   </td>
                                   <td 
                                     rowSpan={record.batches.length} 
                                     className="px-4 py-3 border-b border-r border-gray-200 align-top bg-white font-mono text-gray-500 text-center"
                                   >
                                     <div className="sticky top-0 pt-2">{record.shiftTime}</div>
                                   </td>
                                 </>
                               )}

                               {/* 物料信息 */}
                               <td className="px-4 py-3 border-b border-gray-100 font-mono text-gray-800">{batch.batchNo}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-gray-800">{batch.manufacturer}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-gray-500">{batch.productCode}</td>

                               {/* 物料指标 */}
                               <td className="px-4 py-3 border-b border-gray-100">{batch.pulpType}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-blue-700 bg-blue-50/10">{batch.quantity.toFixed(3)}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.whiteness}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.dust.toFixed(1)}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.freeness}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.breakingLength}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.foldingEndurance}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.moisture}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.grammage.toFixed(1)}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.fluorescence}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.L.toFixed(2)}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.A.toFixed(2)}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-center">{batch.B}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.fiberLength}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.foreignFiber}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.phValue}</td>
                               <td className="px-4 py-3 border-b border-gray-100 text-right">{batch.viscosity}</td>
                             </tr>
                           ))
                        ) : (
                          // 兜底：虽然根据类型定义 batches 是数组，但处理空数组情况
                          <tr>
                             <td className="px-4 py-3 border-b border-r border-gray-200 font-mono text-center">{record.feedDate}</td>
                             <td className="px-4 py-3 border-b border-r border-gray-200 text-center"><TeamBadge team={record.team} /></td>
                             <td className="px-4 py-3 border-b border-r border-gray-200 font-mono text-center">{record.shiftTime}</td>
                             <td colSpan={20} className="px-4 py-3 border-b border-gray-100 text-gray-400 italic text-center">
                               暂无物料投料明细
                             </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                 ) : (
                    <tr>
                      <td colSpan={23} className="px-6 py-24 text-center text-gray-400 bg-white">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                             <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <span>暂无台账数据</span>
                        </div>
                      </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </AdminPageWrapper>
  );
};
