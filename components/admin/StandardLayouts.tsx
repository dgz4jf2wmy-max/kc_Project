
import React from 'react';

// ----------------------------------------------------------------------
// 1. 页面级容器 (Page Wrapper)
// ----------------------------------------------------------------------

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

/**
 * 后台页面标准容器
 * 作用：控制页面的整体布局方向、背景（透明）、以及模块间的标准间距
 */
export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ children }) => {
  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. 筛选区组件 (Search Filter Area)
// ----------------------------------------------------------------------

interface SearchFilterCardProps {
  children: React.ReactNode; // 输入框区域
  actions?: React.ReactNode; // 按钮区域 (查询/重置)
}

/**
 * 筛选条件卡片
 * 规范：白色背景、圆角、阴影、标准的 Grid 布局
 */
export const SearchFilterCard: React.FC<SearchFilterCardProps> = ({ children, actions }) => {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex gap-4 items-end">
        {/* 输入区域：默认使用 Grid 布局自动排列，向左对齐 */}
        <div className="flex-1 grid grid-cols-4 xl:grid-cols-5 gap-4">
          {children}
        </div>
        {/* 按钮区域：固定在右侧，不随 Grid 伸缩 */}
        {actions && (
          <div className="flex-none flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 标准表单项包裹器
 * 作用：统一 Label 的字体、颜色、间距
 */
export const FilterItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. 数据列表组件 (Data List Area)
// ----------------------------------------------------------------------

interface DataListCardProps {
  header?: React.ReactNode; // 顶部工具栏 (新增按钮等)
  children: React.ReactNode; // 表格主体
  footer?: React.ReactNode; // 底部 (分页)
}

/**
 * 数据列表卡片
 * 规范：自动撑满剩余高度 (flex-1)、内部滚动
 */
export const DataListCard: React.FC<DataListCardProps> = ({ header, children, footer }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden border border-gray-100">
      {/* 工具栏区域 */}
      {header && (
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          {header}
        </div>
      )}
      
      {/* 表格滚动区域 */}
      <div className="flex-1 overflow-auto bg-white">
        {children}
      </div>

      {/* 底部区域 (通常是分页) */}
      {footer && (
        <div className="px-5 py-3 border-t border-gray-200 bg-white">
          {footer}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. 通用样式类 (Utility Classes for standard elements)
// ----------------------------------------------------------------------

/**
 * 标准输入框样式 (Tailwind 类名字符串)
 * 方便在 Vue 中直接复制 class
 */
export const STD_INPUT_CLASS = "w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:border-system-primary focus:ring-1 focus:ring-system-primary outline-none transition-all placeholder-gray-400 hover:border-gray-400";

/**
 * 标准表格样式类
 */
export const StdTable = {
  Table: "w-full text-left border-collapse",
  Thead: "bg-gray-50 sticky top-0 z-10 text-gray-900 text-sm font-semibold",
  Th: "px-5 py-3 border-b border-gray-200",
  Tr: "hover:bg-blue-50/30 transition-colors",
  Td: "px-5 py-3 border-b border-gray-100 text-sm",
  Empty: "px-6 py-24 text-center text-gray-400"
};

// ----------------------------------------------------------------------
// 5. 标准抽屉组件 (Standard Drawer)
// ----------------------------------------------------------------------

interface StandardDrawerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

/**
 * 标准抽屉组件
 * 规范：右侧滑出动画 (slide-in-right)、标准 Header/Footer 样式、毛玻璃遮罩
 */
export const StandardDrawer: React.FC<StandardDrawerProps> = ({ 
  title, 
  onClose, 
  children, 
  footer,
  width = "w-[640px]" 
}) => {
  return (
    <>
      {/* Backdrop (Fade In) */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 fade-in"
        onClick={onClose}
      ></div>
      
      {/* Drawer Panel (Slide In Right) */}
      <div className={`fixed top-0 right-0 h-full ${width} bg-white shadow-2xl z-50 flex flex-col slide-in-right`}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white flex-none">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3 z-20 flex-none">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

// ----------------------------------------------------------------------
// 6. 标准弹窗组件 (Standard Modal) - NEW v2.0
// ----------------------------------------------------------------------

interface StandardModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

/**
 * 标准弹窗组件
 * 规范：居中显示、缩放动画 (scale-in)、毛玻璃遮罩
 */
export const StandardModal: React.FC<StandardModalProps> = ({ 
  title, 
  onClose, 
  children, 
  footer,
  width = "w-[800px]" 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] ${width} scale-in border border-gray-200`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl flex-none">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto bg-gray-50/30 rounded-b-xl flex-1">
          {children}
        </div>

        {/* Footer (Optional) */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 flex-none">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
