import React, { useState, useEffect } from 'react';
import { AdminPageWrapper, DataListCard, StdTable } from '../../components/admin/StandardLayouts';
import { getDeletedProcessExceptions, restoreProcessException, ProcessExceptionItem } from '../../services/processExceptionService';
import { RotateCcw } from 'lucide-react';

export const DeletedProcessExceptions: React.FC = () => {
  const [data, setData] = useState<ProcessExceptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    // Simulate async fetch
    setTimeout(() => {
      setData(getDeletedProcessExceptions());
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestore = (id: string) => {
    if (window.confirm('确认恢复该记录吗？')) {
      restoreProcessException(id);
      loadData();
    }
  };

  return (
    <AdminPageWrapper>
      <div className="flex justify-between items-center px-1">
        <h1 className="text-xl font-bold text-gray-800">工艺异常删除记录</h1>
      </div>

      <DataListCard>
        <table className={StdTable.Table}>
          <thead className={StdTable.Thead}>
            <tr>
              <th className={StdTable.Th}>异常类型</th>
              <th className={StdTable.Th}>开始日期</th>
              <th className={StdTable.Th}>开始时间</th>
              <th className={StdTable.Th}>结束时间</th>
              <th className={StdTable.Th}>起始值</th>
              <th className={StdTable.Th}>结束值</th>
              <th className={StdTable.Th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={StdTable.Empty}>加载中...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className={StdTable.Empty}>暂无删除记录</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className={StdTable.Tr}>
                  <td className={StdTable.Td}>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      row.exceptionType === '叩解度异常' 
                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {row.exceptionType}
                    </span>
                  </td>
                  <td className={`${StdTable.Td} text-gray-600`}>{row.startDate}</td>
                  <td className={`${StdTable.Td} text-gray-600`}>{row.startTime}</td>
                  <td className={`${StdTable.Td} text-gray-600`}>{row.endTime}</td>
                  <td className={`${StdTable.Td} text-gray-600`}>{row.startVal}</td>
                  <td className={`${StdTable.Td} text-gray-600`}>{row.endVal}</td>
                  <td className={StdTable.Td}>
                    <button 
                      onClick={() => handleRestore(row.id)}
                      className="flex items-center gap-1 text-system-primary hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      <RotateCcw size={14} />
                      恢复
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataListCard>
    </AdminPageWrapper>
  );
};
