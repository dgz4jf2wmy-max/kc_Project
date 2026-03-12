import React from 'react';
import { X, Settings2 } from 'lucide-react';

interface SmartAlertModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SmartAlertModal: React.FC<SmartAlertModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden flex flex-col transform transition-all scale-100 opacity-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Settings2 size={18} className="text-indigo-500" />
            工艺参数调整建议
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {/* Body (Skeleton) */}
        <div className="p-6 flex-1 bg-white">
          <div className="mb-4 text-sm text-slate-500">
            系统检测到当前工艺超出阈值，建议进行以下参数调整：
          </div>
          
          <div className="space-y-4">
            {/* 骨架屏 - 参数项 1 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
            </div>
            
            {/* 骨架屏 - 参数项 2 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            </div>
            
            {/* 骨架屏 - 参数项 3 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-2/5 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-1/5 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
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
        </div>
        
      </div>
    </div>
  );
};
