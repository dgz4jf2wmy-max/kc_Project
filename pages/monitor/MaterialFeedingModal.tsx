
import React, { useState, useEffect } from 'react';
import { StandardModal, STD_INPUT_CLASS } from '../../components/admin/StandardLayouts';
import { fetchOutboundMaterials, fetchMaterialFeedList, submitMaterialFeed } from '../../services/materialService';
import { MaterialBatchDetail, MaterialFeedRecord } from '../../types';
import { PackagePlus, CheckCircle, Search, Clock, Users, ArrowRight, Square, CheckSquare, X, Trash2, Factory, Tag } from 'lucide-react';

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
  // 改为多选状态
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialBatchDetail[]>([]);
  
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

  // 切换选择逻辑
  const toggleSelection = (item: MaterialBatchDetail) => {
    if (isSubmitting) return;
    
    setSelectedMaterials(prev => {
      const exists = prev.find(m => m.id === item.id);
      if (exists) {
        return prev.filter(m => m.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // 移除单个已选
  const removeSelection = (id: string) => {
    if (isSubmitting) return;
    setSelectedMaterials(prev => prev.filter(m => m.id !== id));
  };

  // 清空选择
  const clearSelection = () => {
    if (isSubmitting) return;
    setSelectedMaterials([]);
  };

  // 提交投料
  const handleConfirmFeed = async () => {
    if (selectedMaterials.length === 0) return;

    setIsSubmitting(true);
    
    const newRecord: MaterialFeedRecord = {
      id: `FEED-${Date.now()}`,
      feedDate: contextInfo.date,
      team: contextInfo.team,
      shiftTime: contextInfo.shiftTime,
      batches: selectedMaterials // 提交数组
    };

    try {
      await submitMaterialFeed(newRecord);
      setShowSuccess(true);
      
      // 模拟刷新列表 (实际应重新拉取)
      setHistoryList([newRecord, ...historyList].slice(0, 10));
      
      // 1.5秒后重置状态，方便连续投料
      setTimeout(() => {
        setShowSuccess(false);
        // 从待选列表中移除已提交的项
        const submittedIds = selectedMaterials.map(m => m.id);
        setOutboundList(prev => prev.filter(item => !submittedIds.includes(item.id)));
        setSelectedMaterials([]);
        setIsSubmitting(false);
      }, 1500);

    } catch (e) {
      alert('投料失败，请重试');
      setIsSubmitting(false);
    }
  };

  const handleViewMore = () => {
    // 由于不能修改路由，使用Alert提示
    if (confirm("即将跳转至后台管理-物料管理页面查看完整记录，是否继续？")) {
       console.log("Navigating to /admin/materials");
       onClose();
    }
  };

  return (
    <StandardModal
      title="物料投料填报"
      onClose={onClose}
      width="w-[1100px]" // 稍微加宽以容纳左右布局
    >
      <div className="flex h-[600px] gap-6">
        
        {/* 左侧：投料操作区 (60%) */}
        <div className="flex-[3] flex flex-col gap-4 border-r border-gray-100 pr-6 overflow-hidden">
           
           {/* 1. 搜索栏 */}
           <div className="flex gap-2 flex-none">
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

           {/* 2. 待投料物料列表 (列表视图改造) */}
           <div className="flex-1 flex flex-col min-h-0 border border-gray-200 rounded-lg overflow-hidden">
              {/* 表头 */}
              <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 select-none">
                 <div className="w-10 text-center">选择</div>
                 <div className="flex-1 pl-2">批号</div>
                 <div className="w-32">厂家</div>
                 <div className="w-24 text-right pr-2">浆种</div>
              </div>

              {/* 列表主体 */}
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {outboundList.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {outboundList.map(item => {
                      const isSelected = selectedMaterials.some(m => m.id === item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => toggleSelection(item)}
                          className={`
                            flex items-center px-4 py-2.5 cursor-pointer transition-colors text-sm group select-none
                            ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}
                          `}
                        >
                           {/* Checkbox */}
                           <div className={`w-10 flex justify-center ${isSelected ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                              {isSelected ? <CheckSquare size={16} fill="currentColor" className="text-white bg-blue-600 rounded-sm" /> : <Square size={16} />}
                           </div>

                           {/* 批号 */}
                           <div className="flex-1 pl-2 min-w-0">
                              <div className={`font-mono font-bold truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                {item.batchNo}
                              </div>
                           </div>

                           {/* 厂家 (截断) */}
                           <div className="w-32 text-xs text-gray-500 truncate" title={item.manufacturer}>
                              {item.manufacturer}
                           </div>

                           {/* 浆种 (Tag) */}
                           <div className="w-24 text-right pr-2">
                              <span className="inline-block bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded border border-gray-200">
                                {item.pulpType}
                              </span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
                     <PackagePlus size={32} className="opacity-20" />
                     <span>没有找到符合条件的已出库物料</span>
                  </div>
                )}
              </div>
           </div>

           {/* 3. 投料确认区 (底部汇总) - 布局优化版 */}
           <div className={`bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner flex flex-col transition-all duration-300 ${selectedMaterials.length > 0 ? 'flex-[0.8]' : 'h-32'}`}>
              
              {selectedMaterials.length > 0 ? (
                 showSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-green-600 animate-in zoom-in">
                       <CheckCircle size={48} className="mb-2" />
                       <span className="font-bold">投料记录已生成</span>
                    </div>
                 ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                       
                       {/* Header */}
                       <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                          <div className="flex items-center gap-3">
                             <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <PackagePlus size={18} className="text-blue-600"/> 
                                待投料清单
                             </h4>
                             <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{selectedMaterials.length} 批</span>
                          </div>
                          <div className="flex gap-3 text-[10px] text-gray-500">
                              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-100"><Clock size={10}/> {contextInfo.date}</span>
                              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-100"><Users size={10}/> {contextInfo.team}班</span>
                          </div>
                       </div>
                       
                       {/* Selected Items: Flexible Tags View (Auto Width) */}
                       <div className="flex-1 overflow-y-auto mb-3 custom-scrollbar">
                          <div className="flex flex-wrap gap-2 content-start">
                              {selectedMaterials.map(m => (
                                 <div 
                                    key={m.id} 
                                    className="relative flex items-center gap-3 bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all select-none animate-in zoom-in-95 duration-200"
                                 >
                                    <div className="flex flex-col min-w-0">
                                       <span className="font-mono font-bold text-xs text-blue-700 whitespace-nowrap">
                                          {m.batchNo}
                                       </span>
                                       <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                          {m.manufacturer}
                                       </span>
                                    </div>
                                    {/* Always Visible Delete Button */}
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); removeSelection(m.id); }}
                                      className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 rounded-full"
                                      title="移除"
                                    >
                                       <X size={14} />
                                    </button>
                                 </div>
                              ))}
                          </div>
                       </div>

                       {/* Action Buttons */}
                       <div className="flex gap-3 mt-auto">
                          <button 
                             onClick={clearSelection}
                             disabled={isSubmitting}
                             className="px-3 border border-gray-300 text-gray-500 rounded hover:bg-gray-100 hover:text-red-500 transition-colors disabled:opacity-50"
                             title="清空已选"
                          >
                             <Trash2 size={16} />
                          </button>
                          <button 
                            onClick={handleConfirmFeed}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-system-primary hover:bg-blue-700 text-white font-bold rounded shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                          >
                             {isSubmitting ? (
                               <>
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 提交中...
                               </>
                             ) : (
                               <>确认投料</>
                             )}
                          </button>
                       </div>
                    </div>
                 )
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                    <PackagePlus size={32} className="opacity-20" />
                    <span>请从上方列表勾选投料批次</span>
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
                             {/* 隐藏投料量 */}
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
