import React from 'react';
import { X, History, Activity } from 'lucide-react';

interface SmartAlertHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartAlertHistoryDrawer: React.FC<SmartAlertHistoryDrawerProps> = ({ isOpen, onClose }) => {
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
        
        {/* Body (Skeleton List) */}
        <div className="px-4 pb-6 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          
          {/* 骨架记录项 1 */}
          <div className="p-4 rounded-2xl bg-white/20 border border-white/30 shadow-sm hover:bg-white/30 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500/10 rounded-lg">
                  <Activity size={16} className="text-red-500" />
                </div>
                <div className="h-3.5 bg-slate-200/80 rounded w-24 animate-pulse"></div>
              </div>
              <div className="h-3 bg-slate-200/80 rounded w-12 animate-pulse mt-1"></div>
            </div>
            <div className="space-y-2.5 pl-9">
              <div className="h-2.5 bg-slate-200/80 rounded w-full animate-pulse"></div>
              <div className="h-2.5 bg-slate-200/80 rounded w-5/6 animate-pulse"></div>
            </div>
          </div>

          {/* 骨架记录项 2 */}
          <div className="p-4 rounded-2xl bg-white/20 border border-white/30 shadow-sm hover:bg-white/30 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                  <Activity size={16} className="text-orange-500" />
                </div>
                <div className="h-3.5 bg-slate-200/80 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-3 bg-slate-200/80 rounded w-12 animate-pulse mt-1"></div>
            </div>
            <div className="space-y-2.5 pl-9">
              <div className="h-2.5 bg-slate-200/80 rounded w-full animate-pulse"></div>
              <div className="h-2.5 bg-slate-200/80 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
          
          {/* 骨架记录项 3 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 shadow-sm hover:bg-white/20 transition-colors cursor-pointer group opacity-80">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-500/10 rounded-lg">
                  <Activity size={16} className="text-slate-500" />
                </div>
                <div className="h-3.5 bg-slate-200/80 rounded w-28 animate-pulse"></div>
              </div>
              <div className="h-3 bg-slate-200/80 rounded w-12 animate-pulse mt-1"></div>
            </div>
            <div className="space-y-2.5 pl-9">
              <div className="h-2.5 bg-slate-200/80 rounded w-full animate-pulse"></div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};
