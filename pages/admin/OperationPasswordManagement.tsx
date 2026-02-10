
import React, { useState, useEffect } from 'react';
import { 
  AdminPageWrapper, 
  STD_INPUT_CLASS
} from '../../components/admin/StandardLayouts';
import { fetchPasswordList, updatePassword } from '../../services/passwordService';
import { Save, Clock, Key } from 'lucide-react';

export const OperationPasswordManagement: React.FC = () => {
  // 数据状态
  const [id, setId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 页面加载时获取当前口令
  useEffect(() => {
    setLoading(true);
    fetchPasswordList().then(res => {
      // 因为是单例，直接取第一条
      if (res.data && res.data.length > 0) {
        const item = res.data[0];
        setId(item.id);
        setCode(item.code);
        setUpdatedAt(item.updatedAt);
      }
      setLoading(false);
    });
  }, []);

  // 提交保存
  const handleSave = async () => {
    if (!code.trim()) {
      alert('口令密码不能为空');
      return;
    }

    if (code.length > 50) {
      alert('口令密码长度不能超过50个字符');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(id, { code });
      // 模拟更新成功后的状态刷新（实际项目中通常后端会返回最新的 updateTime）
      setUpdatedAt(new Date().toISOString().replace('T', ' ').slice(0, 19));
      alert('操作口令已更新');
    } catch (e) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="w-full h-96 flex items-center justify-center text-gray-400">
           数据加载中...
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <div className="flex justify-center mt-6">
        <div className="w-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Key className="text-system-primary" size={20} />
              操作口令维护
            </h2>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            
            {/* 提示信息已移除 */}

            {/* 表单区域 */}
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    口令密码 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={`${STD_INPUT_CLASS} py-3 text-lg font-mono tracking-wide`}
                    placeholder="请输入口令"
                    maxLength={50}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">支持数字、字母及特殊符号</span>
                    <span className={`text-xs ${code.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                      {code.length}/50
                    </span>
                  </div>
               </div>

               <div className="pt-2">
                  <label className="block text-sm font-bold text-gray-500 mb-2">最后更新时间</label>
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-2 rounded border border-gray-200 w-fit">
                     <Clock size={14} />
                     <span className="font-mono text-sm">{updatedAt || '-'}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
             <button 
               onClick={handleSave}
               disabled={saving}
               className="flex items-center gap-2 px-6 py-2.5 bg-system-primary hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {saving ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   保存中...
                 </>
               ) : (
                 <>
                   <Save size={18} />
                   保存配置
                 </>
               )}
             </button>
          </div>

        </div>
      </div>
    </AdminPageWrapper>
  );
};
