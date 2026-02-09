
import React, { useState, useEffect } from 'react';
import { StandardModal, DataListCard, STD_INPUT_CLASS } from '../../components/admin/StandardLayouts';
import { fetchOutboundMaterials, fetchMaterialFeedList, submitMaterialFeed } from '../../services/materialService';
import { MaterialBatchDetail, MaterialFeedRecord } from '../../types';
import { PackagePlus, CheckCircle, Search, Clock, Users, ArrowRight } from 'lucide-react';

interface MaterialFeedingModalProps {
  onClose: () => void;
}

// 辅助：获取当前班组信息 (模拟逻辑)
const getCurrentShiftInfo = () => {
  const now = new Date();
  const hour = now.getHours();
  const dateStr = now.toISOString().slice(0, 10);
  
  let team = '甲';
  let shiftTime = '08:00~16:00';

  if (hour >= 0 && hour < 8) {
    team = '丙'; // 夜班
    shiftTime = '00:00~08:00';
  } else if (hour >= 8 && hour < 16) {
    team = '甲'; // 白班
    shiftTime = '08:00~16:00';
  } else {
    team = '乙'; // 中班
    shiftTime = '16:00~24:00';
  }

  return { date: dateStr, team, shiftTime };
};

export const MaterialFeedingModal: React.FC<MaterialFeedingModalProps> = ({ onClose }) => {
  // 状态
  const [query, setQuery] = useState('');
  const [outboundList, setOutboundList] = useState<MaterialBatchDetail[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialBatchDetail | null>(null);
  
  const [historyList, setHistoryList] = useState<MaterialFeedRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 自动生成的投料上下文信息
  const [contextInfo, setContextInfo] = useState(getCurrentShiftInfo());

  // 初始化加载
  useEffect(() => {
    fetchOutboundMaterials().then(res => setOutboundList(res.data));
    fetchMaterialFeedList().then(res => setHistoryList(res.data.slice(0, 10))); // 取最近10条

    // 定时更新时间上下文
    const timer = setInterval(() => {
      setContextInfo(getCurrentShiftInfo());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 搜索处理
  const handleSearch = () => {
    fetchOutboundMaterials(query).then(res => setOutboundList(res.data));
  };

  // 提交投料
  const handleConfirmFeed = async () => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    
    const newRecord: MaterialFeedRecord = {
      id: `FEED-${Date.now()}`,
      feedDate: contextInfo.date,
      team: contextInfo.team,
      shiftTime: contextInfo.shiftTime,
      batches: [selectedMaterial]
    };

    try {
      await submitMaterialFeed(newRecord);
      setShowSuccess(true);
      
      // 模拟刷新列表 (实际应重新拉取)
      setHistoryList([newRecord, ...historyList].slice(0, 10));
      
      // 1.5秒后重置状态，方便连续投料
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedMaterial(null);
        setIsSubmitting(false);
        // 移除已投料的物料 (Mock逻辑)
        setOutboundList(prev => prev.filter(item => item.id !== selectedMaterial.id));
      }, 1500);

    } catch (e) {
      alert('投料失败，请重试');
      setIsSubmitting(false);
    }
  };

  const handleViewMore = () => {
    // 由于不能修改路由，使用Alert提示
    if (confirm("即将跳转至后台管理-物料管理页面查看完整记录，是否继续？")) {
       // 这里如果能调用父级navigate最好，受限于约束，仅做模拟反馈
       console.log("Navigating to /admin/materials");
       onClose();
    }
  };

  return (
    <StandardModal
      title="物料投料填报"
      onClose={onClose}
      width="w-[1000px]"
    >
      <div className="flex h-[600px] gap-6">
        
        {/* 左侧：投料操作区 (60%) */}
        <div className="flex-[3] flex flex-col gap-4 border-r border-gray-100 pr-6">
           
           {/* 1. 搜索栏 */}
           <div className="flex gap-2">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="输入批号或厂家查询..." 
                   className={`${STD_INPUT_CLASS} pl-9`}
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSearch()}
                 />
              </div>
              <button 
                 onClick={handleSearch}
                 className="px-4 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                搜索
              </button>
           </div>

           {/* 2. 待投料物料列表 */}
           <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">已出库物料池</h3>
              {outboundList.length > 0 ? (
                outboundList.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => !isSubmitting && setSelectedMaterial(item)}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all relative group
                      ${selectedMaterial?.id === item.id 
                        ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}
                    `}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <span className="font-mono font-bold text-gray-800 text-sm">{item.batchNo}</span>
                        <span className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded font-bold">{item.quantity} T</span>
                     </div>
                     <div className="text-xs text-gray-500 mb-1">{item.manufacturer}</div>
                     <div className="flex gap-2 text-[10px] text-gray-400">
                        <span className="bg-gray-100 px-1 rounded">{item.pulpType}</span>
                        <span className="bg-gray-100 px-1 rounded">代码: {item.productCode}</span>
                     </div>
                     
                     {/* 选中标记 */}
                     {selectedMaterial?.id === item.id && (
                        <div className="absolute top-2 right-2 text-blue-500">
                           <CheckCircle size={18} fill="currentColor" className="text-white" />
                        </div>
                     )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                   没有找到符合条件的已出库物料
                </div>
              )}
           </div>

           {/* 3. 投料确认区 */}
           <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner">
              {selectedMaterial ? (
                 showSuccess ? (
                    <div className="h-32 flex flex-col items-center justify-center text-green-600 animate-in zoom-in">
                       <CheckCircle size={48} className="mb-2" />
                       <span className="font-bold">投料记录已生成</span>
                    </div>
                 ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                       <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                             <PackagePlus size={18} className="text-blue-600"/> 确认投料信息
                          </h4>
                          <span className="text-xs text-gray-400">系统自动生成</span>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                          <div className="bg-white p-2 rounded border border-gray-200">
                             <div className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Clock size={10}/> 投料日期</div>
                             <div className="font-mono font-bold text-gray-700">{contextInfo.date}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-gray-200">
                             <div className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Users size={10}/> 班组</div>
                             <div className="font-bold text-gray-700">{contextInfo.team} 班</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-gray-200">
                             <div className="text-[10px] text-gray-400 mb-0.5">值班时间</div>
                             <div className="font-mono font-bold text-gray-700">{contextInfo.shiftTime}</div>
                          </div>
                       </div>

                       <button 
                         onClick={handleConfirmFeed}
                         disabled={isSubmitting}
                         className="w-full py-2.5 bg-system-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                       >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              提交中...
                            </>
                          ) : (
                            <>确认投料 ( {selectedMaterial.quantity} T )</>
                          )}
                       </button>
                    </div>
                 )
              ) : (
                 <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                    请从上方列表选择一个物料进行投料
                 </div>
              )}
           </div>
        </div>

        {/* 右侧：历史记录区 (40%) */}
        <div className="flex-[2] flex flex-col h-full overflow-hidden">
           <div className="flex justify-between items-center mb-3 flex-none">
              <h3 className="font-bold text-gray-700">最近投料记录 (10)</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-4">
              {historyList.map(record => (
                 <div key={record.id} className="relative pl-4 pb-4 border-l-2 border-gray-100 last:border-0 group">
                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors ring-2 ring-white"></div>
                    <div className="text-xs text-gray-400 mb-1 flex justify-between">
                       <span>{record.feedDate}</span>
                       <span>{record.shiftTime}</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                       <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-700 text-xs">{record.team}班组</span>
                          <span className="text-[10px] bg-white border border-gray-200 px-1 rounded text-gray-500">
                             {record.batches.length} 批次
                          </span>
                       </div>
                       {record.batches.map(b => (
                          <div key={b.id} className="text-[10px] text-gray-500 flex justify-between border-t border-gray-200/50 pt-1 mt-1 first:border-0 first:mt-0 first:pt-0">
                             <span className="truncate w-24">{b.manufacturer}</span>
                             <span className="font-mono">{b.quantity.toFixed(2)} T</span>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>

           <button 
             onClick={handleViewMore}
             className="w-full py-2 mt-2 border border-dashed border-gray-300 text-gray-500 text-xs font-medium rounded hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 flex-none"
           >
             查看更多历史 <ArrowRight size={12}/>
           </button>
        </div>

      </div>
    </StandardModal>
  );
};
