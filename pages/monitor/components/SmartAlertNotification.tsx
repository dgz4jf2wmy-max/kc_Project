import React from 'react';
import { BellRing, X } from 'lucide-react';
import { SmartAlertRecord } from '../../../services/smartAlertService';

interface SmartAlertNotificationProps {
  alert: SmartAlertRecord;
  onClick: () => void;
  onDismiss?: () => void;
}

export const SmartAlertNotification: React.FC<SmartAlertNotificationProps> = ({ alert, onClick, onDismiss }) => {
  return (
    <div 
      className="absolute top-4 right-4 w-80 bg-red-600/60 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl cursor-pointer hover:bg-red-600/70 transition-all z-50 border border-red-500/50 group flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg shrink-0 mt-0.5">
          <BellRing size={20} className="text-white animate-pulse" />
        </div>
        <div className="flex-1">
          {/* 真实数据展示 */}
          <div className="space-y-1.5 text-sm text-white font-bold">
            <div className="flex items-center gap-2">
              <span className="text-white/80 shrink-0">异常类型：</span>
              <span>{alert.exceptionType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 shrink-0">异常值：</span>
              <span>{alert.exceptionValue} {alert.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 shrink-0">开始时间：</span>
              <span>{alert.startTime}</span>
            </div>
          </div>
        </div>
        {onDismiss && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 -mr-1"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="mt-2 text-[10px] text-white/70 text-right">
        点击查看调整建议
      </div>
    </div>
  );
};
