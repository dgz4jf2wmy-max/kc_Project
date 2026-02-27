import React, { useState, useEffect } from 'react';
import { StandardModal, STD_INPUT_CLASS } from '../../components/admin/StandardLayouts';
import { ProcessIndicator, RotationDirection } from '../../types';
import { fetchProcessRecords, updateProcessRecord, ProcessRecordFilter } from '../../services/processRecordService';
import { RotateCw, RotateCcw, Search, RefreshCw, ChevronLeft } from 'lucide-react';

interface ProcessRecordModalProps {
  onClose: () => void;
}

// --- Sub-Component: Correction Form (Reusing logic from ProcessIndicatorModal) ---
interface CorrectionFormProps {
  initialData: ProcessIndicator;
  onSave: (data: ProcessIndicator) => void;
  onCancel: () => void;
}

const CorrectionForm: React.FC<CorrectionFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProcessIndicator>(initialData);

  const handleRotationChange = (deviceId: string, dir: RotationDirection) => {
    const updated = formData.deviceConfigs?.map(d => 
      d.deviceId === deviceId ? { ...d, rotation: dir } : d
    );
    setFormData({ ...formData, deviceConfigs: updated });
  };

  return (
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
               value={formData.startTime.replace(' ', 'T')}
               onChange={e => setFormData({...formData, startTime: e.target.value.replace('T', ' ')})}
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

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
           <button 
             onClick={onCancel}
             className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
           >
             取消
           </button>
           <button 
             onClick={() => onSave(formData)}
             className="px-5 py-2 rounded bg-system-primary text-white hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
           >
             提交更正
           </button>
        </div>
    </div>
  );
};

// --- Main Modal Component ---

export const ProcessRecordModal: React.FC<ProcessRecordModalProps> = ({ onClose }) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [records, setRecords] = useState<ProcessIndicator[]>([]);
  const [editingRecord, setEditingRecord] = useState<ProcessIndicator | null>(null);
  
  // Filter State
  const [freeness, setFreeness] = useState<string>('');
  const [freenessDev, setFreenessDev] = useState<string>('');
  const [fiberLength, setFiberLength] = useState<string>('');
  const [fiberLengthDev, setFiberLengthDev] = useState<string>('');
  const [productCode, setProductCode] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const filter: ProcessRecordFilter = {
      freeness: freeness ? Number(freeness) : undefined,
      productCode: productCode || undefined,
      // Add other filters logic if mock service supports it fully
    };
    const data = await fetchProcessRecords(filter);
    setRecords(data);
  };

  const handleSearch = () => {
    loadRecords();
  };

  const handleReset = () => {
    setFreeness('');
    setFreenessDev('');
    setFiberLength('');
    setFiberLengthDev('');
    setProductCode('');
    setStartDate('');
    setEndDate('');
    loadRecords();
  };

  const handleCorrect = (record: ProcessIndicator) => {
    setEditingRecord(record);
    setView('edit');
  };

  const handleSaveCorrection = async (updatedData: ProcessIndicator) => {
    await updateProcessRecord(updatedData);
    setView('list');
    setEditingRecord(null);
    loadRecords(); // Refresh list
  };

  // Helper to check if record is editable (Not started or In Progress)
  const isEditable = (record: ProcessIndicator) => {
    const now = new Date();
    const start = new Date(record.startTime);
    const end = record.endTime ? new Date(record.endTime) : null;

    // If no end time, it's ongoing or future -> editable
    if (!end) return true;
    
    // If end time is in future -> editable
    if (end > now) return true;

    // If start time is in future -> editable
    if (start > now) return true;

    return false; // Finished in the past
  };

  return (
    <StandardModal
      title={view === 'list' ? "工艺下发记录" : "工艺更正"}
      onClose={onClose}
      width="w-[900px]"
      footer={view === 'list' ? (
        <button 
          onClick={onClose}
          className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          关闭
        </button>
      ) : null} // Edit view has its own footer inside the form
    >
      {view === 'list' ? (
        <div className="p-4 space-y-4 min-h-[500px]">
           {/* Search Area */}
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">工艺指标:</span>
                    <span className="text-xs font-bold text-slate-500">叩解度</span>
                    <input 
                      type="number" 
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                      value={freeness}
                      onChange={e => setFreeness(e.target.value)}
                    />
                    <span className="text-slate-400">±</span>
                    <input 
                      type="number" 
                      className="w-12 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                      value={freenessDev}
                      onChange={e => setFreenessDev(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">纤维长度</span>
                    <input 
                      type="number" 
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                      value={fiberLength}
                      onChange={e => setFiberLength(e.target.value)}
                    />
                    <span className="text-slate-400">±</span>
                    <input 
                      type="number" 
                      className="w-12 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                      value={fiberLengthDev}
                      onChange={e => setFiberLengthDev(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">产品代号:</span>
                    <select 
                      className="px-2 py-1 border border-slate-300 rounded text-sm min-w-[100px]"
                      value={productCode}
                      onChange={e => setProductCode(e.target.value)}
                    >
                       <option value="">请选择</option>
                       <option value="TC">TC</option>
                       <option value="7T">7T</option>
                       <option value="MP">MP</option>
                    </select>
                 </div>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">工艺时间:</span>
                    <div className="flex items-center border border-slate-300 rounded bg-white px-2 py-1">
                       <input 
                         type="date" 
                         className="text-sm border-none focus:ring-0 p-0 text-slate-600"
                         value={startDate}
                         onChange={e => setStartDate(e.target.value)}
                       />
                       <span className="mx-2 text-slate-400">~</span>
                       <input 
                         type="date" 
                         className="text-sm border-none focus:ring-0 p-0 text-slate-600"
                         value={endDate}
                         onChange={e => setEndDate(e.target.value)}
                       />
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handleReset}
                      className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-600 text-sm hover:bg-slate-50"
                    >
                      重置
                    </button>
                    <button 
                      onClick={handleSearch}
                      className="px-4 py-1.5 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Search size={14}/> 查询
                    </button>
                 </div>
              </div>
           </div>

           {/* Table Area */}
           <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                       <th className="px-4 py-3">工艺时间</th>
                       <th className="px-4 py-3 text-center">叩解度</th>
                       <th className="px-4 py-3 text-center">纤维长度</th>
                       <th className="px-4 py-3 text-center">产品代号</th>
                       <th className="px-4 py-3 text-center">刀盘转向</th>
                       <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {records.map((record) => {
                       const editable = isEditable(record);
                       const rotationStr = record.deviceConfigs?.map(d => d.rotation === '正转' ? '正' : '反').join('');
                       
                       return (
                          <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                                {record.startTime}
                                {record.endTime ? ` ~ ${record.endTime.slice(5)}` : <span className="text-emerald-500 ml-1">(进行中)</span>}
                             </td>
                             <td className="px-4 py-3 text-center font-bold text-slate-700">
                                {record.freeness}±{record.freenessDeviation}
                             </td>
                             <td className="px-4 py-3 text-center font-bold text-slate-700">
                                {record.fiberLength}±{record.fiberLengthDeviation}
                             </td>
                             <td className="px-4 py-3 text-center font-bold text-slate-800">
                                {record.productCode}
                             </td>
                             <td className="px-4 py-3 text-center text-slate-500 text-xs tracking-widest">
                                {rotationStr}
                             </td>
                             <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => editable && handleCorrect(record)}
                                  disabled={!editable}
                                  className={`text-xs font-medium underline underline-offset-2 ${
                                     editable 
                                       ? 'text-blue-500 hover:text-blue-700 decoration-blue-200 cursor-pointer' 
                                       : 'text-slate-300 decoration-slate-200 cursor-not-allowed'
                                  }`}
                                >
                                  更正
                                </button>
                             </td>
                          </tr>
                       );
                    })}
                    {records.length === 0 && (
                       <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                             暂无数据
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        // Edit View
        <div>
           {editingRecord && (
             <CorrectionForm 
               initialData={editingRecord} 
               onSave={handleSaveCorrection}
               onCancel={() => setView('list')}
             />
           )}
        </div>
      )}
    </StandardModal>
  );
};
