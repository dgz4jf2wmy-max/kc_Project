
import React, { useState, useEffect } from 'react';
import { 
  StandardModal, 
  DataListCard, 
  StdTable,
  SearchFilterCard,
  FilterItem,
  STD_INPUT_CLASS
} from '../../components/admin/StandardLayouts';
import { fetchKnifeChangeRecords } from '../../services/knifeChangeService';
import { KnifeChangeRecord } from '../../types';
import { ArrowRight, History } from 'lucide-react';

interface KnifeChangeRecordModalProps {
  onClose: () => void;
}

// 辅助组件：高亮变化的刀盘型号
// 修改：删除了 "(新)" 字样，仅保留颜色/背景高亮来提示变化
const KnifeModelCell: React.FC<{ model: string; isChanged: boolean }> = ({ model, isChanged }) => (
  <div className={`flex items-center justify-center py-1 rounded ${isChanged ? 'bg-orange-50 border border-orange-100' : ''}`}>
    <span className={`${isChanged ? 'text-orange-700 font-bold' : 'text-gray-500'}`}>
      {model}
    </span>
  </div>
);

/**
 * 换刀记录列表弹窗
 * 包含特殊的日期回溯搜索功能
 */
export const KnifeChangeRecordModal: React.FC<KnifeChangeRecordModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KnifeChangeRecord[]>([]);
  const [searchDate, setSearchDate] = useState('');

  const loadData = (date?: string) => {
    setLoading(true);
    fetchKnifeChangeRecords(date).then(res => {
      setData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    loadData(searchDate);
  };

  const handleReset = () => {
    setSearchDate('');
    loadData();
  };

  return (
    <StandardModal
      title="换刀记录" 
      onClose={onClose}
      width="w-[1100px]" // 更宽的弹窗以容纳5个刀盘列
      footer={
        <button 
          className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors"
          onClick={onClose}
        >
          关闭
        </button>
      }
    >
      <div className="space-y-4 h-full flex flex-col">
          {/* 1. 搜索区 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-end gap-4">
             <div className="flex-1 max-w-xs">
                 <label className="text-sm font-medium text-gray-700 block mb-1">查询日期 (回溯设备状态)</label>
                 <input 
                    type="date" 
                    className={STD_INPUT_CLASS}
                    value={searchDate}
                    onChange={e => setSearchDate(e.target.value)}
                 />
             </div>
             <div className="flex gap-2">
                 <button 
                   onClick={handleSearch}
                   className="px-4 py-2 bg-system-primary text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
                 >
                   查询状态
                 </button>
                 <button 
                   onClick={handleReset}
                   className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white"
                 >
                   重置
                 </button>
             </div>
          </div>

          {/* 2. 列表区 */}
          <DataListCard>
            <table className={StdTable.Table}>
              <thead className={StdTable.Thead}>
                <tr>
                  <th className={`${StdTable.Th} w-32`}>日期</th>
                  <th className={`${StdTable.Th} w-24 text-center`}>班组</th>
                  <th className={`${StdTable.Th} text-center`}>1#精浆机刀盘</th>
                  <th className={`${StdTable.Th} text-center`}>2#精浆机刀盘</th>
                  <th className={`${StdTable.Th} text-center`}>3#精浆机刀盘</th>
                  <th className={`${StdTable.Th} text-center`}>4#精浆机刀盘</th>
                  <th className={`${StdTable.Th} text-center`}>5#精浆机刀盘</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id} className={StdTable.Tr}>
                      <td className={`${StdTable.Td}`}>
                         <div className="font-mono font-bold text-gray-700">{item.date}</div>
                         <div className="text-xs text-gray-400 scale-90 origin-left">{item.time}</div>
                      </td>
                      <td className={`${StdTable.Td} text-center`}>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border 
                          ${item.team === '甲' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            item.team === '乙' ? 'bg-green-50 text-green-700 border-green-100' :
                            item.team === '丙' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            'bg-purple-50 text-purple-700 border-purple-100'}`}>
                          {item.team}
                        </span>
                      </td>
                      <td className={`${StdTable.Td}`}>
                         <KnifeModelCell model={item.device1_knife} isChanged={item.changedDeviceIds.includes(1)} />
                      </td>
                      <td className={`${StdTable.Td}`}>
                         <KnifeModelCell model={item.device2_knife} isChanged={item.changedDeviceIds.includes(2)} />
                      </td>
                      <td className={`${StdTable.Td}`}>
                         <KnifeModelCell model={item.device3_knife} isChanged={item.changedDeviceIds.includes(3)} />
                      </td>
                      <td className={`${StdTable.Td}`}>
                         <KnifeModelCell model={item.device4_knife} isChanged={item.changedDeviceIds.includes(4)} />
                      </td>
                      <td className={`${StdTable.Td}`}>
                         <KnifeModelCell model={item.device5_knife} isChanged={item.changedDeviceIds.includes(5)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className={StdTable.Empty}>暂无换刀记录</td></tr>
                )}
              </tbody>
            </table>
          </DataListCard>
      </div>
    </StandardModal>
  );
};
