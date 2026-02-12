
import React from 'react';
import { TopHudNav } from '../components/TopHudNav';
import { ModuleType } from '../types';

interface ImmersiveLayoutProps {
  children: React.ReactNode;
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  title: string;
}

/**
 * 沉浸式布局
 * 适用于：除了后台管理之外的所有页面
 * 结构：全屏背景 + 顶部悬浮导航 (包含标题与下拉) + 内容区
 * 更新：
 * 1. 监测工作台 -> 亮色模式 (Light Mode)
 * 2. 孪生大屏 -> 纯黑模式 (Black Mode)
 * 3. 其他(分析) -> 系统深蓝 (System Blue)
 */
export const ImmersiveLayout: React.FC<ImmersiveLayoutProps> = ({ 
  children, 
  currentModule, 
  onNavigate,
  title 
}) => {
  // 模式判定
  const isLightMode = currentModule === ModuleType.MONITORING;
  const isTwinMode = currentModule === ModuleType.DIGITAL_TWIN;

  // 动态背景类
  let bgClass = '';
  if (isLightMode) {
    bgClass = 'bg-gray-50 text-gray-900';
  } else if (isTwinMode) {
    bgClass = 'bg-black text-system-text'; // 孪生大屏强制纯黑背景
  } else {
    bgClass = 'bg-system-bg text-system-text'; // 其他页面保持系统深蓝
  }

  return (
    <div className={`w-screen h-screen overflow-hidden relative flex flex-col transition-colors duration-300 ${bgClass}`}>
      
      {/* 背景装饰元素 - 仅在系统深蓝模式(如分析页)下显示，孪生大屏不需要蓝色光晕 */}
      {!isLightMode && !isTwinMode && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/10 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* 顶部导航 (集成标题与视图切换) - 传入模式状态 */}
      <TopHudNav currentModule={currentModule} onNavigate={onNavigate} isLightMode={isLightMode} />

      {/* 主要内容区域 - 调整顶部内边距以避开 Header */}
      <main className="flex-1 z-10 p-8 pt-28 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};
