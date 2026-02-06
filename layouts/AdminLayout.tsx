import React from 'react';
import { ADMIN_SIDEBAR_MENU, SYSTEM_MODULES } from '../services/navService';
import { ModuleType } from '../types';
import { SystemButton } from '../components/SystemButton';

interface AdminLayoutProps {
  children: React.ReactNode;
  onNavigate: (module: ModuleType) => void;
}

/**
 * 后台管理布局
 * 结构：传统左侧侧边栏 + 顶部Header + 内容区
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="w-screen h-screen bg-system-bg flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-system-card border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-white">后台管理中心</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">业务菜单</div>
          {ADMIN_SIDEBAR_MENU.map((item) => (
            <div 
              key={item.id}
              className="px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <SystemButton 
            variant="secondary" 
            className="w-full text-sm border border-gray-700"
            onClick={() => onNavigate(ModuleType.DIGITAL_TWIN)}
          >
            &larr; 返回孪生大屏
          </SystemButton>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-system-card/50 border-b border-gray-800 flex items-center justify-between px-8">
          <div className="text-gray-400">当前位置: 系统设置 / 概览</div>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-system-primary flex items-center justify-center text-xs font-bold">
               PM
             </div>
             <span className="text-sm">管理员</span>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto bg-system-bg">
          {children}
        </main>
      </div>
    </div>
  );
};