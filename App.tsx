
import React, { useState, useEffect } from 'react';
import { ModuleType } from './types';
import { ImmersiveLayout } from './layouts/ImmersiveLayout';
// import { AdminLayout } from './layouts/AdminLayout'; // 不再使用旧的 Layout
import { getModuleTitle, ADMIN_SIDEBAR_MENU } from './services/navService';
import { fetchKeyMetrics, fetchDeviceList } from './services/mockDataService';
import { SystemButton } from './components/SystemButton';
import { KnifeManagement } from './pages/admin/KnifeManagement';
import { DeviceManagement } from './pages/admin/DeviceManagement'; // 引入设备管理页面
import { MaterialManagement } from './pages/admin/MaterialManagement'; // 引入物料管理页面
import { MonitorDashboard } from './pages/monitor/MonitorDashboard'; // 新增：引入监测工作台

// ----------------------------------------------------------------------
// 子页面组件
// ----------------------------------------------------------------------

const TwinView: React.FC = () => (
  <div className="h-full grid grid-cols-12 gap-6">
    {/* 模拟3D区域 */}
    <div className="col-span-8 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-50 animate-pulse">🧊</div>
        <p className="text-xl text-blue-400 font-mono">3D ENGINE VIEWPORT</p>
        <p className="text-sm text-gray-500 mt-2">此处加载 WebGL/Three.js 磨浆机模型</p>
      </div>
      {/* 装饰性网格线 */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
    </div>
    
    {/* 右侧数据面板 */}
    <div className="col-span-4 flex flex-col space-y-6">
      <div className="flex-1 bg-system-card/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold border-l-4 border-yellow-500 pl-3 mb-4">实时告警</h3>
        <div className="space-y-3">
           {[1, 2, 3].map(i => (
             <div key={i} className="flex justify-between items-center p-3 bg-red-900/20 border border-red-500/30 rounded">
               <span className="text-red-300 text-sm">#A0{i} 磨片温度过高</span>
               <span className="text-xs text-gray-400">刚刚</span>
             </div>
           ))}
        </div>
      </div>
      <div className="flex-1 bg-system-card/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold border-l-4 border-green-500 pl-3 mb-4">产线概况</h3>
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 bg-white/5 rounded text-center">
             <div className="text-2xl font-bold text-white">98%</div>
             <div className="text-xs text-gray-400">OEE</div>
           </div>
           <div className="p-4 bg-white/5 rounded text-center">
             <div className="text-2xl font-bold text-white">142</div>
             <div className="text-xs text-gray-400">运行天数</div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// MonitorView 已移除，被 MonitorDashboard 替代

const AnalysisView: React.FC = () => (
  <div className="h-full bg-system-card/30 rounded-2xl p-8 border border-white/5">
     <div className="flex justify-between items-center mb-8">
       <div className="flex space-x-4">
         <select className="bg-system-bg border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-system-primary">
           <option>最近7天</option>
           <option>最近30天</option>
         </select>
         <select className="bg-system-bg border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-system-primary">
           <option>能耗分析</option>
           <option>产量分析</option>
         </select>
       </div>
       <SystemButton variant="primary" className="py-2 text-sm">导出报告</SystemButton>
     </div>
     
     {/* 占位图表区 */}
     <div className="w-full h-[60%] border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500 flex-col">
        <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
        <span>此处预留 ECharts / Recharts 渲染区域</span>
        <span className="text-xs mt-2 text-gray-600">ID: chart-analysis-main</span>
     </div>
  </div>
);

// 默认的 Admin 仪表盘 (当没有特定子路由匹配时)
// 修正为浅色主题适配
const AdminDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-800">系统状态概览</h2>
      <div className="grid grid-cols-3 gap-8">
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <div className="text-gray-500 text-sm">注册用户</div>
          <div className="text-2xl font-bold mt-1 text-gray-900">24</div>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <div className="text-gray-500 text-sm">设备接入数</div>
          <div className="text-2xl font-bold mt-1 text-gray-900">18</div>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <div className="text-gray-500 text-sm">今日API调用</div>
          <div className="text-2xl font-bold mt-1 text-gray-900">1,204</div>
        </div>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// Main APP
// ----------------------------------------------------------------------

const App: React.FC = () => {
  // 简单的状态路由
  const [currentModule, setCurrentModule] = useState<ModuleType>(ModuleType.DIGITAL_TWIN);
  
  // 增加简单的子路径状态，用于处理后台管理的内部导航
  const [currentPath, setCurrentPath] = useState<string>('/');

  // 路由/模块切换处理器
  const handleNavigate = (module: ModuleType) => {
    setCurrentModule(module);
    setCurrentPath('/'); // 切换大模块时重置子路径
  };

  // 后台管理内部导航处理器 (模拟路由跳转)
  const handleAdminNavigate = (path: string) => {
    // 如果点击的是 "返回孪生大屏" 等模块切换链接 (path 为 '/')
    if (path === '/') { 
       handleNavigate(ModuleType.DIGITAL_TWIN);
       return;
    }
    setCurrentPath(path);
  };

  // 渲染逻辑：后台管理模式
  // 使用 AdminLayoutWithRouting 进行内部路由管理
  if (currentModule === ModuleType.ADMIN) {
      return (
        <div className="w-screen h-screen bg-system-bg flex overflow-hidden">
          <AdminLayoutWithRouting currentPath={currentPath} onPathChange={handleAdminNavigate}>
             {/* 路由配置区 */}
             {currentPath === '/admin/tools' && <KnifeManagement />}
             {currentPath === '/admin/devices' && <DeviceManagement />}
             {currentPath === '/admin/materials' && <MaterialManagement />}
             
             {/* 默认 dashboard */}
             {currentPath !== '/admin/tools' && currentPath !== '/admin/devices' && currentPath !== '/admin/materials' && <AdminDashboard />}
          </AdminLayoutWithRouting>
        </div>
      )
  }

  // 渲染逻辑：沉浸式视图 (孪生、监测、分析)
  return (
    <ImmersiveLayout 
      currentModule={currentModule} 
      onNavigate={handleNavigate}
      title={getModuleTitle(currentModule)}
    >
      {currentModule === ModuleType.DIGITAL_TWIN && <TwinView />}
      {currentModule === ModuleType.MONITORING && <MonitorDashboard />}
      {currentModule === ModuleType.ANALYSIS && <AnalysisView />}
    </ImmersiveLayout>
  );
};

// ----------------------------------------------------------------------
// Helper Component: Admin Layout with Internal Routing
// ----------------------------------------------------------------------

interface AdminLayoutWithRoutingProps {
    children: React.ReactNode;
    currentPath: string;
    onPathChange: (path: string) => void;
}

const AdminLayoutWithRouting: React.FC<AdminLayoutWithRoutingProps> = ({ children, currentPath, onPathChange }) => {
    return (
    <div className="w-screen h-screen bg-system-bg flex overflow-hidden">
      {/* 侧边栏保持深色 */}
      <aside className="w-64 bg-system-card border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-white">后台管理中心</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">业务菜单</div>
          {ADMIN_SIDEBAR_MENU.map((item) => (
            <div 
              key={item.id}
              onClick={() => onPathChange(item.path)}
              className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  currentPath === item.path 
                  ? 'bg-system-primary text-white shadow-lg shadow-blue-900/50' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <SystemButton 
            variant="secondary" 
            className="w-full text-sm border border-gray-700"
            onClick={() => onPathChange('/')}
          >
            &larr; 返回孪生大屏
          </SystemButton>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header: 改为白底 + 浅灰边框 */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
          <div className="text-gray-500 text-sm">
            当前位置: <span className="text-gray-800 font-medium ml-1">{ADMIN_SIDEBAR_MENU.find(m => m.path === currentPath)?.label || '概览'}</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-system-primary flex items-center justify-center text-xs font-bold text-white shadow-md">PM</div>
             <span className="text-sm text-gray-700">管理员</span>
          </div>
        </header>
        {/* Main: 改为浅灰底色 + 默认 Padding，移除之前的 bg-system-bg */}
        <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
    );
}

export default App;
