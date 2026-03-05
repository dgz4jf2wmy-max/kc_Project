import React from 'react';
import { X, Settings } from 'lucide-react';

interface MeasurementSensitivitySettingsProps {
  onClose: () => void;
}

export const MeasurementSensitivitySettings: React.FC<MeasurementSensitivitySettingsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">测量值灵敏度设置</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 min-h-[200px] flex items-center justify-center text-slate-400 text-sm">
          {/* Content will be implemented later */}
          暂无内容
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:border-slate-300 border border-transparent rounded-lg transition-all"
          >
            取消
          </button>
          <button 
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
