import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SmartAlertFloatingButtonProps {
  onClick: () => void;
}

export const SmartAlertFloatingButton: React.FC<SmartAlertFloatingButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-red-500 hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all z-40 group flex items-center justify-center"
      title="查看历史预警"
    >
      <AlertTriangle size={20} className="group-hover:animate-pulse" />
      {/* 提示小红点 (可选) */}
      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
    </button>
  );
};
