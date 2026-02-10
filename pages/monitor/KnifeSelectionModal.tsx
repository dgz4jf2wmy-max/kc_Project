
import React, { useState, useEffect } from 'react';
import { 
  StandardModal, 
  StdTable, 
  STD_INPUT_CLASS 
} from '../../components/admin/StandardLayouts';
import { fetchKnifeList, executeKnifeChange } from '../../services/mockDataService';
import { KnifeDisc } from '../../types';
import { Check, RotateCw, AlertTriangle } from 'lucide-react';

interface KnifeSelectionModalProps {
  targetDeviceId: string;
  onClose: () => void;
  onSuccess: (newKnifeModel: string) => void;
}

export const KnifeSelectionModal: React.FC<KnifeSelectionModalProps> = ({ targetDeviceId, onClose, onSuccess }) => {
  const [knives, setKnives] = useState<KnifeDisc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ model: '', status: '' });
  
  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Option Flags
  const [isSwap, setIsSwap] = useState(false);
  const [isScrapOld, setIsScrapOld] = useState(false);

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchKnifeList().then(res => {
      // 过滤掉已报废的，但保留闲置和在用
      setKnives(res.data.filter(k => k.status !== 'scrapped'));
      setLoading(false);
    });
  }, []);

  const handleSelect = (knife: KnifeDisc) => {
    if (knife.id === selectedId) {
      setSelectedId(null);
      setIsSwap(false);
      setIsScrapOld(false);
    } else {
      setSelectedId(knife.id);
      // Reset options when selection changes
      setIsSwap(false);
      setIsScrapOld(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) return;
    
    setIsSubmitting(true);
    try {
      await executeKnifeChange(targetDeviceId, selectedId, { 
        isSwap: isSwap, 
        isScrapOld: isScrapOld 
      });
      
      const selectedKnife = knives.find(k => k.id === selectedId);
      onSuccess(selectedKnife?.model || 'Unknown');
      onClose();
    } catch (e) {
      alert('操作失败');
      setIsSubmitting(false);
    }
  };

  const selectedKnife = knives.find(k => k.id === selectedId);
  const filteredList = knives.filter(k => 
    (!filters.model || k.model.includes(filters.model)) &&
    (!filters.status || k.status === filters.status)
  );

  return (
    <StandardModal
      title={`选择刀盘 - 目标设备: ${targetDeviceId}#精浆机`}
      onClose={onClose}
      width="w-[1200px]" // 加宽以容纳更多字段
    >
      <div className="h-[600px] flex flex-col relative">
         {/* 1. 顶部筛选 */}
         <div className="flex gap-4 p-1 mb-4">
             <div className="flex-1">
                <input 
                  placeholder="搜索刀盘型号..." 
                  className={STD_INPUT_CLASS}
                  value={filters.model}
                  onChange={e => setFilters({...filters, model: e.target.value})}
                />
             </div>
             <div className="w-40">
                <select 
                  className={STD_INPUT_CLASS}
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">全部状态</option>
                  <option value="idle">闲置</option>
                  <option value="in_use">在用</option>
                </select>
             </div>
         </div>

         {/* 2. 列表区域 */}
         <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col pb-[80px]"> 
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className={StdTable.Table}>
                <thead className={StdTable.Thead}>
                  <tr>
                     <th className={`${StdTable.Th} w-16 text-center`}>选择</th>
                     {/* 字段补全：参考刀盘管理 */}
                     <th className={StdTable.Th}>状态</th>
                     <th className={StdTable.Th}>刀盘编号</th>
                     <th className={StdTable.Th}>刀盘型号</th>
                     <th className={StdTable.Th}>类型</th>
                     <th className={`${StdTable.Th} text-right`}>累计使用(h)</th>
                     <th className={StdTable.Th}>最后下机时间</th>
                     <th className={StdTable.Th}>刀盘标记</th>
                     {/* 操作列放在最后 */}
                     <th className={`${StdTable.Th} w-48 text-center bg-blue-50/50 border-l border-blue-100`}>操作选项</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                   {filteredList.map(knife => {
                      const isSelected = selectedId === knife.id;
                      return (
                        <tr 
                          key={knife.id} 
                          className={`${StdTable.Tr} cursor-pointer ${isSelected ? 'bg-blue-50/60' : ''}`}
                          onClick={() => handleSelect(knife)}
                        >
                           <td className={`${StdTable.Td} text-center`}>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mx-auto transition-all ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}>
                                 {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                           </td>
                           <td className={StdTable.Td}>
                              <span className={`px-2 py-0.5 rounded text-xs border ${
                                knife.status === 'in_use' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {knife.status === 'in_use' ? '在用' : '闲置'}
                              </span>
                           </td>
                           <td className={`${StdTable.Td} font-medium text-gray-900`}>{knife.id}</td>
                           <td className={`${StdTable.Td} font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{knife.model}</td>
                           <td className={`${StdTable.Td} text-gray-500`}>{knife.type === 'cut' ? '切刀' : '磨刀'}</td>
                           <td className={`${StdTable.Td} text-right font-mono text-gray-600`}>{knife.usageHours.toFixed(1)}</td>
                           <td className={`${StdTable.Td} text-gray-500 font-mono text-xs`}>{knife.lastDownTime}</td>
                           <td className={StdTable.Td}>
                              {knife.mark ? (
                                <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">{knife.mark}</span>
                              ) : <span className="text-gray-300">-</span>}
                           </td>
                           
                           {/* 行内操作选项 */}
                           <td 
                             className={`${StdTable.Td} text-center border-l ${isSelected ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}
                             onClick={(e) => e.stopPropagation()} // 防止点击Checkbox触发选择行
                           >
                              {isSelected && knife.status === 'idle' && (
                                 <label className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                                      checked={isScrapOld}
                                      onChange={e => setIsScrapOld(e.target.checked)}
                                    />
                                    <span className="text-sm font-bold text-red-600">旧刀盘报废</span>
                                 </label>
                              )}
                              
                              {isSelected && knife.status === 'in_use' && (
                                 <label className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                      checked={isSwap}
                                      onChange={e => setIsSwap(e.target.checked)}
                                    />
                                    <span className="text-sm font-bold text-blue-600">与原设备({knife.currentDevice}#)互换</span>
                                 </label>
                              )}
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
              </table>
            </div>
         </div>

         {/* 3. 底部固定按钮区 (简化版) */}
         <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 rounded-b-xl z-20">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4 text-sm text-gray-500">
                  {selectedKnife && (
                     <>
                        <span>已选: <strong className="text-gray-900">{selectedKnife.model}</strong></span>
                        {(isScrapOld || isSwap) && (
                           <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs border border-orange-100">
                              <AlertTriangle size={12} />
                              {isScrapOld ? '旧刀盘将变更为报废状态' : '两台设备将进行刀盘互换'}
                           </span>
                        )}
                     </>
                  )}
               </div>

               <div className="flex gap-3">
                  <button 
                     onClick={onClose}
                     className="px-6 py-2.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                  >
                     取消
                  </button>
                  <button 
                     onClick={handleSubmit}
                     disabled={!selectedId || isSubmitting}
                     className="px-8 py-2.5 rounded bg-system-primary hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                     {isSubmitting ? (
                        <>
                           <RotateCw className="animate-spin" size={16} /> 处理中...
                        </>
                     ) : (
                        "确认换刀"
                     )}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </StandardModal>
  );
};
