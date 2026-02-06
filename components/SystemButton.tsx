import React from 'react';

interface SystemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isActive?: boolean;
}

/**
 * 系统统一按钮组件
 * 样式严格复刻用户提供的蓝色风格
 */
export const SystemButton: React.FC<SystemButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isActive = false,
  className = '',
  ...props 
}) => {
  
  // 基础样式
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center focus:outline-none";
  
  // 变体样式
  let variantStyles = "";
  
  if (variant === 'primary' || isActive) {
    // 对应截图中的亮蓝色按钮
    variantStyles = "bg-system-primary hover:bg-system-primaryHover text-white shadow-lg shadow-blue-900/50";
  } else if (variant === 'secondary') {
    // 对应截图下方的灰色/暗色文字状态
    variantStyles = "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-transparent";
  } else {
    variantStyles = "bg-system-card text-system-text border border-gray-700 hover:border-system-primary";
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};