
import React, { useState, useRef, useEffect } from 'react';
import { StandardModal, STD_INPUT_CLASS } from '../../components/admin/StandardLayouts';
import { verifyOperationPassword } from '../../services/passwordService';
import { Lock, AlertCircle } from 'lucide-react';

interface PasswordVerificationModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const PasswordVerificationModal: React.FC<PasswordVerificationModalProps> = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
        inputRef.current?.focus();
    }, 100);
  }, []);

  const handleVerify = async () => {
    if (!password) {
      setError('请输入口令');
      return;
    }
    setVerifying(true);
    setError('');
    
    try {
      const isValid = await verifyOperationPassword(password);
      if (isValid) {
        onSuccess();
        // 关键修复：验证成功后不调用 onClose()。
        // onClose 会触发父组件清理 targetDeviceForChange，导致后续弹窗无法打开。
        // 父组件的 onSuccess 会负责切换弹窗状态。
      } else {
        setError('口令错误，请重试');
        setPassword('');
        inputRef.current?.focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  return (
    <StandardModal
      title="操作安全验证"
      onClose={onClose}
      width="w-[400px]"
    >
      <div className="flex flex-col items-center gap-6 py-4">
         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
            <Lock size={32} />
         </div>
         
         <div className="w-full">
            <label className="text-sm font-bold text-gray-700 mb-2 block text-center">请输入操作口令以继续</label>
            <input 
              ref={inputRef}
              type="password" 
              className={`${STD_INPUT_CLASS} text-center text-lg tracking-widest`}
              placeholder="••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
            {error && (
              <div className="flex items-center justify-center gap-1 text-red-500 text-xs mt-2 animate-in fade-in slide-in-from-top-1">
                 <AlertCircle size={12} /> {error}
              </div>
            )}
         </div>

         <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              取消
            </button>
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="flex-1 py-2 bg-system-primary hover:bg-blue-700 text-white rounded text-sm font-medium shadow-sm transition-colors"
            >
              {verifying ? '验证中...' : '确认'}
            </button>
         </div>
      </div>
    </StandardModal>
  );
};
