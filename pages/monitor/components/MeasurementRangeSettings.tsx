import React, { useState } from 'react';
import { X } from 'lucide-react';

interface MeasurementRangeSettingsProps {
  onClose: () => void;
}

type UnitType = 'SR' | 'mm' | 'percent';

export const MeasurementRangeSettings: React.FC<MeasurementRangeSettingsProps> = ({ onClose }) => {
  // Freeness State
  const [freenessUpper, setFreenessUpper] = useState<string>('5');
  const [freenessLower, setFreenessLower] = useState<string>('10');
  const [freenessUnit, setFreenessUnit] = useState<UnitType>('percent');

  // Fiber Length State
  const [fiberUpper, setFiberUpper] = useState<string>('5');
  const [fiberLower, setFiberLower] = useState<string>('10');
  const [fiberUnit, setFiberUnit] = useState<UnitType>('percent');

  const handleSave = () => {
    // Logic to save settings would go here
    console.log({
      freeness: { upper: freenessUpper, lower: freenessLower, unit: freenessUnit },
      fiber: { upper: fiberUpper, lower: fiberLower, unit: fiberUnit },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded shadow-xl w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base text-slate-600">测量值显示范围设置</h2>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Freeness Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-sm">叩解度:</h3>
            
            <div className="space-y-3 pl-6">
              {/* Upper Limit */}
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm w-8 text-right">上限</span>
                <input 
                  type="number" 
                  value={freenessUpper}
                  onChange={(e) => setFreenessUpper(e.target.value)}
                  className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <div className="relative w-20 shrink-0">
                  <select 
                    value={freenessUnit}
                    onChange={(e) => setFreenessUnit(e.target.value as UnitType)}
                    className="w-full appearance-none border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-600 bg-white focus:outline-none focus:border-blue-400 transition-colors pr-8 cursor-pointer"
                  >
                    <option value="percent">%</option>
                    <option value="SR">°SR</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Lower Limit */}
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm w-8 text-right">下限</span>
                <input 
                  type="number" 
                  value={freenessLower}
                  onChange={(e) => setFreenessLower(e.target.value)}
                  className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <div className="relative w-20 shrink-0">
                  <select 
                    value={freenessUnit}
                    onChange={(e) => setFreenessUnit(e.target.value as UnitType)}
                    className="w-full appearance-none border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-600 bg-white focus:outline-none focus:border-blue-400 transition-colors pr-8 cursor-pointer"
                  >
                    <option value="percent">%</option>
                    <option value="SR">°SR</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fiber Length Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-sm">纤维长度:</h3>
            
            <div className="space-y-3 pl-6">
              {/* Upper Limit */}
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm w-8 text-right">上限</span>
                <input 
                  type="number" 
                  value={fiberUpper}
                  onChange={(e) => setFiberUpper(e.target.value)}
                  className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <div className="relative w-20 shrink-0">
                  <select 
                    value={fiberUnit}
                    onChange={(e) => setFiberUnit(e.target.value as UnitType)}
                    className="w-full appearance-none border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-600 bg-white focus:outline-none focus:border-blue-400 transition-colors pr-8 cursor-pointer"
                  >
                    <option value="percent">%</option>
                    <option value="mm">mm</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Lower Limit */}
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm w-8 text-right">下限</span>
                <input 
                  type="number" 
                  value={fiberLower}
                  onChange={(e) => setFiberLower(e.target.value)}
                  className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <div className="relative w-20 shrink-0">
                  <select 
                    value={fiberUnit}
                    onChange={(e) => setFiberUnit(e.target.value as UnitType)}
                    className="w-full appearance-none border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-600 bg-white focus:outline-none focus:border-blue-400 transition-colors pr-8 cursor-pointer"
                  >
                    <option value="percent">%</option>
                    <option value="mm">mm</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-center gap-3 pb-6">
          <button 
            onClick={onClose}
            className="px-8 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded transition-colors"
          >
            返回
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm shadow-blue-200 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
