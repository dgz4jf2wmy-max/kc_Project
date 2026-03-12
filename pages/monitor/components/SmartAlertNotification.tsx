import React from 'react';
import { BellRing, X } from 'lucide-react';

interface SmartAlertNotificationProps {
  onClick: () => void;
  onDismiss?: () => void;
}

export const SmartAlertNotification: React.FC<SmartAlertNotificationProps> = ({ onClick, onDismiss }) => {
  return (
    <div 
      className="absolute top-4 right-4 w-80 bg-red-600/60 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl cursor-pointer hover:bg-red-600/70 transition-all z-50 border border-red-500/50 group flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-lg shrink-0">
          <BellRing size={20} className="text-white animate-pulse" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">智能打浆预警</h4>
          {/* 骨架内容 */}
          <div className="space-y-1.5 mt-2">
            <div className="h-2 bg-white/20 rounded w-full animate-pulse"></div>
            <div className="h-2 bg-white/20 rounded w-4/5 animate-pulse"></div>
          </div>
        </div>
        {onDismiss && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="mt-3 text-[10px] text-white/70 text-right">
        点击查看调整建议
      </div>
    </div>
  );
};
