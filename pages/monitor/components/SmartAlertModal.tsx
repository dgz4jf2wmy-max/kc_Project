import React from 'react';
import { X, Settings2, AlertTriangle, Clock, Activity } from 'lucide-react';
import { SmartAlertRecord } from '../../../services/smartAlertService';

interface SmartAlertModalProps {
  isOpen: boolean;
  alert: SmartAlertRecord | null;
  onConfirm: () => void;
  onCancel: () => void;
  isReadOnly?: boolean;
  onClose?: () => void;
}

export const SmartAlertModal: React.FC<SmartAlertModalProps> = ({ isOpen, alert, onConfirm, onCancel, isReadOnly, onClose }) => {
  if (!isOpen || !alert) return null;

  const handleClose = onClose || onCancel;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden flex flex-col transform transition-all scale-100 opacity-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings2 size={18} className="text-indigo-500" />
            工艺参数调整建议
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 bg-white">
          <div className="mb-3 text-sm text-slate-500">
            系统检测到当前工艺超出阈值，异常详情如下：
          </div>
          
          {/* 异常详情 - 紧凑布局 */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100 text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <AlertTriangle size={12} className="text-red-400" />
                异常类型
              </div>
              <div className="font-semibold text-slate-800">{alert.exceptionType}</div>
            </div>
            <div className="flex flex-col gap-1 border-l border-red-100 pl-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Activity size={12} className="text-red-400" />
                异常数值
              </div>
              <div className="font-semibold text-red-600">{alert.exceptionValue} {alert.unit}</div>
            </div>
            <div className="flex flex-col gap-1 border-l border-red-100 pl-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Clock size={12} className="text-red-400" />
                开始时间
              </div>
              <div className="font-semibold text-slate-800">{alert.startTime}</div>
            </div>
          </div>

          {/* 工艺参数调整建议 */}
          {alert.adjustments && alert.adjustments.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 text-sm font-bold text-slate-800 flex items-center gap-2">
                <Settings2 size={16} className="text-indigo-500" />
                建议操作
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {alert.adjustments.map((adj, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 bg-slate-50/50 hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs w-4">{idx + 1}.</span>
                      <span className="text-slate-700 font-medium text-sm">{adj.device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${adj.action === '进刀' ? 'text-red-600 bg-red-100' : 'text-emerald-600 bg-emerald-100'}`}>
                        {adj.action}
                      </span>
                      <span className="text-slate-800 font-semibold text-sm w-10 text-right">
                        {adj.value} <span className="text-xs text-slate-500 font-normal">{adj.unit}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {isReadOnly ? (
            <button 
              onClick={handleClose} 
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors text-sm"
            >
              关闭
            </button>
          ) : (
            <>
              <button 
                onClick={onCancel} 
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors text-sm"
              >
                不适用 (取消)
              </button>
              <button 
                onClick={onConfirm} 
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors shadow-sm text-sm"
              >
                确认下发
              </button>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};
