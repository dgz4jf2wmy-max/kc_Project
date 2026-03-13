import React, { useState, useEffect } from 'react';
import { X, History, Activity, AlertTriangle } from 'lucide-react';
import { fetchAlertHistory, SmartAlertRecord } from '../../../services/smartAlertService';

interface SmartAlertHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: (record: SmartAlertRecord) => void;
}

export const SmartAlertHistoryDrawer: React.FC<SmartAlertHistoryDrawerProps> = ({ isOpen, onClose, onItemClick }) => {
  const [history, setHistory] = useState<SmartAlertRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchAlertHistory().then(data => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* 透明遮罩层，用于点击外部关闭 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={onClose}
        ></div>
      )}
      
      {/* 通知中心面板 (iOS 风格) */}
      <div 
        className={`fixed top-20 right-4 w-[380px] h-[calc(100vh-6rem)] bg-white/10 backdrop-blur-lg shadow-2xl z-[100] rounded-3xl border border-white/30 flex flex-col transform transition-all duration-300 ease-out origin-top-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">
            系统历史推荐参数
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors bg-black/5"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Body (List) */}
        <div className="px-4 pb-6 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {loading ? (
            <div className="text-center text-slate-500 py-4 text-sm">加载中...</div>
          ) : history.length === 0 ? (
            <div className="text-center text-slate-500 py-4 text-sm">暂无历史记录</div>
          ) : (
            history.map((record) => (
              <div 
                key={record.id}
                className={`p-4 rounded-2xl border shadow-sm transition-colors cursor-pointer group ${
                  record.status === 'canceled' 
                    ? 'bg-white border-slate-200 hover:bg-slate-50 opacity-80' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => {
                  if (onItemClick) onItemClick(record);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      record.exceptionType.includes('叩解度') ? 'bg-red-500/10' : 'bg-orange-500/10'
                    }`}>
                      <AlertTriangle size={16} className={
                        record.exceptionType.includes('叩解度') ? 'text-red-500' : 'text-orange-500'
                      } />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{record.exceptionType}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{record.startTime}</span>
                </div>
                <div className="space-y-1.5 pl-9">
                  <div className="text-sm text-slate-700">
                    <span className="text-slate-500 mr-2">异常值:</span>
                    <span className="font-medium text-slate-800">{record.exceptionValue} {record.unit}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                    {record.status === 'confirmed' ? '已确认下发' : '已取消/忽略'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
