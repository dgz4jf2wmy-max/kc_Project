
import React, { useState, useRef, useEffect } from 'react';
import { SYSTEM_MODULES } from '../services/navService';
import { ModuleType } from '../types';
import { SystemButton } from './SystemButton';

interface TopHudNavProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  isLightMode?: boolean; // 新增：亮色模式支持
}

/**
 * 顶部 HUD 导航栏 (重构版)
 * 交互模式：
 * 1. 左侧显示系统标题
 * 2. 紧随其后是“视图切换”下拉框 (孪生/监测/分析)
 * 3. 右侧独立放置“后台管理”按钮
 */
export const TopHudNav: React.FC<TopHudNavProps> = ({ currentModule, onNavigate, isLightMode = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 过滤出视图类模块 (排除后台管理)
  const viewModules = SYSTEM_MODULES.filter(m => m.module !== ModuleType.ADMIN);
  
  // 获取当前激活的模块信息
  const activeModule = viewModules.find(m => m.module === currentModule) || viewModules[0];

  // 判定是否为孪生模式
  const isTwinMode = currentModule === ModuleType.DIGITAL_TWIN;

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (module: ModuleType) => {
    onNavigate(module);
    setIsDropdownOpen(false);
  };

  // 样式变量
  const titleColor = isLightMode ? 'text-gray-800' : 'text-white';
  const dividerColor = isLightMode ? 'bg-gray-300' : 'bg-white/10';
  
  // 头部背景色逻辑：
  // 1. 孪生模式 (TwinMode): 强制使用系统深蓝背景 (bg-system-bg)，因为页面主体是黑色的。
  // 2. 其他模式: 保持透明 (pointer-events-none 让下方背景透出来)。
  const headerBgClass = isTwinMode 
    ? 'bg-system-bg shadow-sm border-b border-white/5' 
    : '';

  // 下拉框触发器样式
  const triggerBaseStyle = "flex items-center gap-3 px-5 py-2.5 rounded-lg border backdrop-blur-md transition-all duration-300";
  const triggerActiveStyle = isDropdownOpen 
    ? 'bg-system-primary/90 border-system-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
    : isLightMode 
      ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 shadow-sm' // 亮色模式
      : 'bg-system-card/80 border-white/10 text-gray-200 hover:bg-system-card hover:border-white/30'; // 深色模式

  return (
    <header className={`fixed top-0 left-0 w-full z-50 px-8 py-5 flex justify-between items-center pointer-events-none transition-colors duration-300 ${headerBgClass}`}>
      {/* 左侧区域：标题 + 视图切换 (允许交互) */}
      <div className="flex items-center gap-6 pointer-events-auto">
        {/* 系统标识 */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-system-primary rounded-full"></div>
          <h1 className={`text-xl font-bold tracking-widest uppercase text-shadow-sm transition-colors ${titleColor}`}>
            精浆工段系统 <span className="text-xs text-system-primary align-top">PRO</span>
          </h1>
        </div>

        <div className={`w-px h-8 mx-2 ${dividerColor}`}></div>

        {/* 视图切换下拉框 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`${triggerBaseStyle} ${triggerActiveStyle}`}
          >
            <span className="font-medium">{activeModule.label}</span>
            {/* 动态箭头图标 */}
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉菜单主体 */}
          {isDropdownOpen && (
            <div className={`absolute top-full left-0 mt-2 w-48 border rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left
              ${isLightMode ? 'bg-white/95 border-gray-200' : 'bg-system-card/95 border-white/10'}
            `}>
              <div className="py-1">
                {viewModules.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.module)}
                    className={`
                      w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between
                      ${currentModule === item.module 
                        ? 'bg-system-primary/10 text-system-primary font-bold' 
                        : isLightMode 
                          ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    {item.label}
                    {currentModule === item.module && (
                      <div className="w-1.5 h-1.5 rounded-full bg-system-primary shadow-[0_0_8px_currentColor]"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧区域：后台管理模式切换 (允许交互) */}
      <div className="pointer-events-auto">
        <SystemButton 
          variant="secondary"
          className={`text-sm px-4 py-2 backdrop-blur-sm ${
            isLightMode 
            ? 'border-gray-200 bg-white/80 text-gray-600 hover:bg-system-primary/10 hover:text-system-primary hover:border-system-primary/30' 
            : 'border-gray-700 bg-black/20 text-gray-400 hover:bg-system-primary/20 hover:text-system-primary hover:border-system-primary/50'
          }`}
          onClick={() => onNavigate(ModuleType.ADMIN)}
        >
          <span className="mr-2">🛠</span> 后台管理模式
        </SystemButton>
      </div>
    </header>
  );
};
