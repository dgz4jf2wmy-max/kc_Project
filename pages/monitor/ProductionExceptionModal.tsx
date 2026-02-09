
import React, { useState, useEffect } from 'react';
import { 
  StandardModal, // 替换为弹窗组件
  DataListCard, 
  StdTable 
} from '../../components/admin/StandardLayouts';
import { fetchProductionExceptionHistory } from '../../services/productionExceptionService';
import { ProductionExceptionRecord } from '../../types';
import { Clock } from 'lucide-react';

interface ProductionExceptionModalProps {
  onClose: () => void;
}

/**
 * 生产异常列表弹窗
 * 按照实体类 ProductionExceptionRecord 字段顺序展示
 * 交互模式：弹窗 (Modal)
 */
export const ProductionExceptionModal: React.FC<ProductionExceptionModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductionExceptionRecord[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchProductionExceptionHistory().then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <StandardModal
      title="生产异常记录"
      onClose={onClose}
      width="w-[900px]" // 弹窗稍宽一点以容纳表格
      footer={
        <button 
          className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors"
          onClick={onClose}
        >
          关闭
        </button>
      }
    >
      <DataListCard
        header={
          <div className="flex justify-between items-center w-full">
             <span className="text-sm text-gray-500">共 {data.length} 条历史异常记录</span>
             <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded hover:bg-gray-50 transition-colors bg-white">
                导出记录
             </button>
          </div>
        }
      >
        <table className={StdTable.Table}>
          <thead className={StdTable.Thead}>
            <tr>
              {/* 按实体类字段顺序: id, date, description, duration, team */}
              <th className={`${StdTable.Th} w-32`}>记录ID</th>
              <th className={`${StdTable.Th} w-32`}>日期</th>
              <th className={StdTable.Th}>异常情况描述</th>
              <th className={`${StdTable.Th} w-32 text-right`}>持续时间 (h)</th>
              <th className={`${StdTable.Th} w-24 text-center`}>班组</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className={StdTable.Tr}>
                  <td className={`${StdTable.Td} font-mono text-gray-400 text-xs`}>{item.id}</td>
                  <td className={`${StdTable.Td} font-mono text-gray-700`}>{item.date}</td>
                  <td className={`${StdTable.Td} text-gray-900`}>{item.description}</td>
                  <td className={`${StdTable.Td} text-right font-mono font-medium text-slate-700`}>
                    {item.duration.toFixed(2)}
                  </td>
                  <td className={`${StdTable.Td} text-center`}>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border 
                      ${item.team === '甲' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        item.team === '乙' ? 'bg-green-50 text-green-700 border-green-100' :
                        item.team === '丙' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-purple-50 text-purple-700 border-purple-100'}`}>
                      {item.team}班
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className={StdTable.Empty}>暂无异常记录</td></tr>
            )}
          </tbody>
        </table>
      </DataListCard>
    </StandardModal>
  );
};
