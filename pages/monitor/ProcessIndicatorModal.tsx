
import React, { useState } from 'react';
import { StandardModal, STD_INPUT_CLASS } from '../../components/admin/StandardLayouts';
import { ProcessIndicator, RotationDirection } from '../../types';
import { RotateCw, RotateCcw } from 'lucide-react';

interface ProcessIndicatorModalProps {
  onClose: () => void;
}

/**
 * 工艺指标下发弹窗
 * 功能：下发新的工艺标准，包括产品、核心指标及设备转向配置
 */
export const ProcessIndicatorModal: React.FC<ProcessIndicatorModalProps> = ({ onClose }) => {
  // 默认初始数据 (模拟读取当前值作为默认值)
  const [formData, setFormData] = useState<Partial<ProcessIndicator>>({
    productCode: 'TC',
    startTime: new Date().toISOString().slice(0, 16), // 当前时间 yyyy-MM-ddThh:mm
    freeness: 54,
    freenessDeviation: 1.0,
    fiberLength: 0.80,
    fiberLengthDeviation: 0.05,
    deviceConfigs: [
      { deviceId: '1', rotation: '正转' },
      { deviceId: '2', rotation: '反转' },
      { deviceId: '3', rotation: '反转' },
      { deviceId: '4', rotation: '正转' },
      { deviceId: '5', rotation: '正转' },
    ]
  });

  // 处理设备转向切换
  const handleRotationChange = (deviceId: string, dir: RotationDirection) => {
    const updated = formData.deviceConfigs?.map(d => 
      d.deviceId === deviceId ? { ...d, rotation: dir } : d
    );
    setFormData({ ...formData, deviceConfigs: updated });
  };

  const handleSubmit = () => {
    // 这里预留接口调用位置
    console.log('Submitting new indicator:', formData);
    alert('工艺指标下发成功');
    onClose();
  };

  return (
    <StandardModal
      title="工艺指标下发"
      onClose={onClose}
      width="w-[700px]"
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2 rounded bg-system-primary text-white hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
          >
            确认下发
          </button>
        </>
      }
    >
      <div className="space-y-6 p-2">
        {/* 1. 基础设定 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
             <label className="text-sm font-bold text-gray-700">产品代号</label>
             <select 
               className={STD_INPUT_CLASS}
               value={formData.productCode}
               onChange={e => setFormData({...formData, productCode: e.target.value})}
             >
               <option value="TC">TC (标准类)</option>
               <option value="7T">7T (特种类)</option>
               <option value="MP">MP (进口类)</option>
             </select>
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-sm font-bold text-gray-700">生效时间</label>
             <input 
               type="datetime-local" 
               className={STD_INPUT_CLASS}
               value={formData.startTime}
               onChange={e => setFormData({...formData, startTime: e.target.value})}
             />
          </div>
        </div>

        {/* 2. 核心指标 */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
           <h4 className="text-sm font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">质量指标设定</h4>
           <div className="grid grid-cols-2 gap-8">
              {/* 叩解度 */}
              <div>
                 <label className="text-xs font-bold text-gray-500 mb-1 block">叩解度 (°SR)</label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`${STD_INPUT_CLASS} font-bold text-lg text-gray-800`}
                      value={formData.freeness}
                      onChange={e => setFormData({...formData, freeness: Number(e.target.value)})}
                    />
                    <span className="text-gray-400">±</span>
                    <input 
                      type="number" 
                      className={`${STD_INPUT_CLASS} w-20 text-center`}
                      value={formData.freenessDeviation}
                      onChange={e => setFormData({...formData, freenessDeviation: Number(e.target.value)})}
                    />
                 </div>
              </div>
              {/* 纤维长度 */}
              <div>
                 <label className="text-xs font-bold text-gray-500 mb-1 block">纤维长度 (mm)</label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${STD_INPUT_CLASS} font-bold text-lg text-gray-800`}
                      value={formData.fiberLength}
                      onChange={e => setFormData({...formData, fiberLength: Number(e.target.value)})}
                    />
                    <span className="text-gray-400">±</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${STD_INPUT_CLASS} w-20 text-center`}
                      value={formData.fiberLengthDeviation}
                      onChange={e => setFormData({...formData, fiberLengthDeviation: Number(e.target.value)})}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* 3. 刀盘转向设定 (横向排列 1#-5#) */}
        <div>
           <h4 className="text-sm font-bold text-gray-800 mb-3 border-l-4 border-purple-500 pl-2">设备刀盘转向配置</h4>
           <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              {formData.deviceConfigs?.map((config) => (
                <div key={config.deviceId} className="flex flex-col items-center gap-3">
                   {/* 设备编号圈 */}
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 shadow-inner">
                     {config.deviceId}#
                   </div>
                   
                   {/* 转向选择 */}
                   <div className="flex flex-col gap-2">
                      <label className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold cursor-pointer border transition-all select-none
                        ${config.rotation === '正转' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm ring-1 ring-emerald-200' 
                          : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}
                      `}>
                        <input 
                          type="radio" 
                          name={`rot-${config.deviceId}`} 
                          checked={config.rotation === '正转'}
                          onChange={() => handleRotationChange(config.deviceId, '正转')}
                          className="hidden"
                        />
                        <RotateCw size={12} className={config.rotation === '正转' ? 'animate-pulse' : ''} /> 正转
                      </label>

                      <label className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold cursor-pointer border transition-all select-none
                        ${config.rotation === '反转' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-200' 
                          : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}
                      `}>
                        <input 
                          type="radio" 
                          name={`rot-${config.deviceId}`} 
                          checked={config.rotation === '反转'}
                          onChange={() => handleRotationChange(config.deviceId, '反转')}
                          className="hidden"
                        />
                        <RotateCcw size={12} className={config.rotation === '反转' ? 'animate-pulse' : ''} /> 反转
                      </label>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </StandardModal>
  );
};
