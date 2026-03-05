import React, { useState, useEffect } from 'react';
import { X, Settings, Save, AlertCircle } from 'lucide-react';
import { fetchKnifeList, updateKnifeSensitivity } from '../../../services/mockDataService';
import { KnifeDisc } from '../../../types';
import { STD_INPUT_CLASS } from '../../../components/admin/StandardLayouts';

interface MeasurementSensitivitySettingsProps {
  onClose: () => void;
  isAllStopped: boolean;
  deviceRotations: Record<string, '正转' | '反转'>;
}

export const MeasurementSensitivitySettings: React.FC<MeasurementSensitivitySettingsProps> = ({ onClose, isAllStopped, deviceRotations }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [knives, setKnives] = useState<KnifeDisc[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const knifeRes = await fetchKnifeList();
        if (knifeRes.data) {
          setKnives(knifeRes.data);
        }
      } catch (err) {
        setError('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getInstalledKnife = (deviceId: string) => {
    return knives.find(k => k.currentDevice === deviceId && k.status === 'in_use');
  };

  const handleSensitivityChange = (knifeId: string, field: keyof KnifeDisc, value: string) => {
    const numValue = parseFloat(value);
    
    setKnives(prev => prev.map(k => {
      if (k.id === knifeId) {
        return { ...k, [field]: isNaN(numValue) ? 0 : numValue };
      }
      return k;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all installed knives
      const updatePromises = knives
        .filter(k => k.currentDevice && k.status === 'in_use')
        .map(k => updateKnifeSensitivity(k.id, {
          freenessSensitivityForward: k.freenessSensitivityForward,
          freenessSensitivityReverse: k.freenessSensitivityReverse,
          fiberLengthSensitivityForward: k.fiberLengthSensitivityForward,
          fiberLengthSensitivityReverse: k.fiberLengthSensitivityReverse
        }));
      
      await Promise.all(updatePromises);
      onClose();
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const renderDeviceRow = (deviceId: string) => {
    const knife = getInstalledKnife(deviceId);
    
    // Determine status and direction from props
    // MonitorDashboard logic: if isAllStopped is true, then STOP, else RUN
    const isRunning = !isAllStopped;
    const rotation = deviceRotations[deviceId] || '正转';
    const statusText = isRunning ? (rotation === '正转' ? '正转运行' : '反转运行') : '停机';

    // Determine which fields to edit based on direction
    const isForward = rotation === '正转';
    const freenessField = isForward ? 'freenessSensitivityForward' : 'freenessSensitivityReverse';
    const fiberField = isForward ? 'fiberLengthSensitivityForward' : 'fiberLengthSensitivityReverse';

    return (
      <div key={deviceId} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
        {/* Device Info */}
        <div className="col-span-3 flex flex-col">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="font-bold text-slate-700">{deviceId}# 精浆机</span>
          </div>
          <span className={`text-xs mt-1 ${isRunning ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
            {statusText}
          </span>
        </div>

        {/* Knife Info */}
        <div className="col-span-3 flex flex-col">
           {knife ? (
             <>
               <span className="text-sm font-medium text-slate-700">{knife.model}</span>
               <span className="text-xs text-slate-400 font-mono">{knife.id}</span>
             </>
           ) : (
             <span className="text-sm text-slate-400 italic">未安装刀盘</span>
           )}
        </div>

        {/* Freeness Sensitivity */}
        <div className="col-span-3">
           <label className="text-xs text-slate-500 mb-1 block">叩解度灵敏度</label>
           <input 
             type="number" 
             step="0.01"
             className={`${STD_INPUT_CLASS} ${!isRunning ? 'bg-slate-100 text-transparent' : ''}`}
             disabled={!isRunning || !knife}
             value={isRunning && knife ? (knife[freenessField] || '') : ''}
             onChange={(e) => knife && handleSensitivityChange(knife.id, freenessField, e.target.value)}
             placeholder={!isRunning ? "停机不可用" : "0.00"}
           />
        </div>

        {/* Fiber Length Sensitivity */}
        <div className="col-span-3">
           <label className="text-xs text-slate-500 mb-1 block">纤维长度灵敏度</label>
           <input 
             type="number" 
             step="0.01"
             className={`${STD_INPUT_CLASS} ${!isRunning ? 'bg-slate-100 text-transparent' : ''}`}
             disabled={!isRunning || !knife}
             value={isRunning && knife ? (knife[fiberField] || '') : ''}
             onChange={(e) => knife && handleSensitivityChange(knife.id, fiberField, e.target.value)}
             placeholder={!isRunning ? "停机不可用" : "0.00"}
           />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">测量值灵敏度设置</h2>
              <p className="text-xs text-slate-500 mt-0.5">关联刀盘静态参数，仅运行状态可修改</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-400">
              加载中...
            </div>
          ) : (
            <div className="space-y-2">
               {/* Header Row */}
               <div className="grid grid-cols-12 gap-4 px-2 pb-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">设备状态</div>
                  <div className="col-span-3">当前刀盘</div>
                  <div className="col-span-3">叩解度灵敏度</div>
                  <div className="col-span-3">纤维长度灵敏度</div>
               </div>
               
               {/* Device Rows */}
               {['1', '2', '3', '4', '5'].map(id => renderDeviceRow(id))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:border-slate-300 border border-transparent rounded-lg transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : (
              <>
                <Save size={16} />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
