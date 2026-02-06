import React, { useState, useEffect } from 'react';
import { 
  AdminPageWrapper, 
  SearchFilterCard, 
  FilterItem, 
  DataListCard, 
  STD_INPUT_CLASS,
  StdTable,
  StandardDrawer // 引入抽屉组件
} from '../../components/admin/StandardLayouts';
import { fetchDeviceRegistryList, fetchDeviceStaticParams, fetchDeviceDynamicParams } from '../../services/deviceService';
import { DeviceRegistryItem, DeviceParam } from '../../types';

/**
 * 设备状态徽章组件
 */
const DeviceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    in_use: 'bg-green-50 text-green-600 border-green-100',
    maintenance: 'bg-orange-50 text-orange-600 border-orange-100',
    stopped: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  
  const labels: Record<string, string> = {
    in_use: '使用中',
    maintenance: '维修中',
    stopped: '停机'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || styles.stopped}`}>
      {labels[status] || status}
    </span>
  );
};

// 详情页 Tab 定义
type DetailTab = 'basic' | 'relation' | 'database' | 'domain' | 'bom';

/**
 * 设备管理页面
 */
export const DeviceManagement: React.FC = () => {
  // 列表数据状态
  const [devices, setDevices] = useState<DeviceRegistryItem[]>([]);
  const [filters, setFilters] = useState({ name: '', code: '' });

  // 详情页状态
  const [selectedDevice, setSelectedDevice] = useState<DeviceRegistryItem | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('basic');
  
  // 数域模块内部状态 (Static vs Dynamic)
  const [domainType, setDomainType] = useState<'static' | 'dynamic'>('static');
  const [staticParams, setStaticParams] = useState<DeviceParam[]>([]);
  const [dynamicParams, setDynamicParams] = useState<DeviceParam[]>([]);

  useEffect(() => {
    fetchDeviceRegistryList().then(res => setDevices(res.data));
  }, []);

  // 当选中设备或切换到数域Tab时，加载参数数据
  useEffect(() => {
    if (selectedDevice && activeTab === 'domain') {
      // 并行加载，模拟真实场景
      fetchDeviceStaticParams(selectedDevice.id).then(res => setStaticParams(res.data));
      fetchDeviceDynamicParams(selectedDevice.id).then(res => setDynamicParams(res.data));
    }
  }, [selectedDevice, activeTab]);

  // 前端简单过滤逻辑
  const filteredDevices = devices.filter(d => 
    (!filters.name || d.name.includes(filters.name)) &&
    (!filters.code || d.code.includes(filters.code))
  );

  const handleReset = () => {
    setFilters({ name: '', code: '' });
  };

  const openDetail = (device: DeviceRegistryItem) => {
    setSelectedDevice(device);
    setActiveTab('basic'); // 默认打开基本信息
    setDomainType('static'); // 数域默认看静态
  };

  // 辅助组件：详情字段
  const DetailField: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="text-sm text-gray-900 font-medium min-h-[20px]">{value}</div>
    </div>
  );

  return (
    <AdminPageWrapper>
      {/* 1. 筛选区域 */}
      <SearchFilterCard
        actions={
          <>
            <button className="px-5 py-2 bg-system-primary text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm">
               查询
            </button>
            <button 
               className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white"
               onClick={handleReset}
            >
               重置
            </button>
          </>
        }
      >
        <FilterItem label="设备名称">
           <input 
             type="text" 
             placeholder="请输入设备名称" 
             className={STD_INPUT_CLASS}
             value={filters.name}
             onChange={e => setFilters({...filters, name: e.target.value})}
           />
        </FilterItem>
        <FilterItem label="设备编码">
           <input 
             type="text" 
             placeholder="请输入设备编码" 
             className={STD_INPUT_CLASS}
             value={filters.code}
             onChange={e => setFilters({...filters, code: e.target.value})}
           />
        </FilterItem>
      </SearchFilterCard>

      {/* 2. 数据列表区域 */}
      <DataListCard
        header={
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-system-primary hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新增设备
             </button>
             <button className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors bg-white">
                导出列表
             </button>
          </div>
        }
        footer={
           <div className="flex justify-end items-center gap-4">
             <span className="text-sm text-gray-500">共 {filteredDevices.length} 条</span>
             <div className="flex items-center gap-1">
               <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-system-primary hover:text-system-primary text-sm disabled:opacity-50 disabled:bg-gray-50" disabled>&lt;</button>
               <button className="w-8 h-8 flex items-center justify-center bg-system-primary text-white rounded text-sm font-medium shadow-sm">1</button>
               <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:border-system-primary hover:text-system-primary text-sm disabled:opacity-50 disabled:bg-gray-50" disabled>&gt;</button>
             </div>
          </div>
        }
      >
        <table className={StdTable.Table}>
          <thead className={StdTable.Thead}>
            <tr>
              <th className={`${StdTable.Th} w-16 text-center`}>序号</th>
              <th className={StdTable.Th}>设备状态</th>
              <th className={StdTable.Th}>设备名称</th>
              <th className={StdTable.Th}>设备编码</th>
              <th className={StdTable.Th}>设备型号</th>
              <th className={StdTable.Th}>设备等级</th>
              <th className={StdTable.Th}>生产厂家</th>
              <th className={StdTable.Th}>生产日期</th>
              <th className={`${StdTable.Th} text-center w-24`}>操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
             {filteredDevices.length > 0 ? (
               filteredDevices.map((device, index) => (
                 <tr key={device.id} className={StdTable.Tr}>
                   <td className={`${StdTable.Td} text-center text-gray-500`}>{index + 1}</td>
                   <td className={StdTable.Td}>
                     <DeviceStatusBadge status={device.status} />
                   </td>
                   <td className={`${StdTable.Td} text-gray-900 font-medium`}>{device.name}</td>
                   <td className={`${StdTable.Td} text-gray-600`}>{device.code}</td>
                   <td className={`${StdTable.Td} text-gray-600`}>{device.model}</td>
                   <td className={`${StdTable.Td} text-gray-600`}>{device.level}</td>
                   <td className={`${StdTable.Td} text-gray-400`}>{device.manufacturer}</td>
                   <td className={`${StdTable.Td} text-gray-600 font-mono`}>{device.productionDate}</td>
                   <td className={`${StdTable.Td} text-center`}>
                      <button 
                        className="text-system-primary hover:text-blue-800 font-medium text-sm"
                        onClick={() => openDetail(device)}
                      >
                        详情
                      </button>
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td colSpan={9} className={StdTable.Empty}>
                    <span>暂无设备数据</span>
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </DataListCard>

      {/* 3. 设备详情抽屉 */}
      {selectedDevice && (
        <StandardDrawer
          title={`设备详情 - ${selectedDevice.name}`}
          onClose={() => setSelectedDevice(null)}
          footer={
            <button 
              className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors"
              onClick={() => setSelectedDevice(null)}
            >
              关闭
            </button>
          }
        >
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 bg-white sticky top-0 z-20 px-6 shadow-sm flex-none overflow-x-auto">
            {[
              { id: 'basic', label: '基本信息' },
              { id: 'relation', label: '设备关联维度' },
              { id: 'database', label: '设备资料库' },
              { id: 'domain', label: '数域' },
              { id: 'bom', label: 'BOM' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DetailTab)}
                className={`mr-8 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'border-system-primary text-system-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* 1. 基本信息 Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                   <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-system-primary pl-2">
                     基础档案
                   </h3>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                     <DetailField label="设备名称" value={selectedDevice.name} />
                     <DetailField label="设备编码" value={selectedDevice.code} />
                     <DetailField label="规格型号" value={selectedDevice.model} />
                     <DetailField label="生产厂家" value={selectedDevice.manufacturer} />
                     <DetailField label="设备等级" value={<span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 text-xs">{selectedDevice.level}类设备</span>} />
                     <DetailField label="生产日期" value={selectedDevice.productionDate} />
                     <DetailField label="当前状态" value={<DeviceStatusBadge status={selectedDevice.status} />} />
                   </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[200px] flex items-center justify-center text-gray-400 border-dashed">
                    更多扩展属性区域
                </div>
              </div>
            )}

            {/* 2. 数域 Tab (重点实现) */}
            {activeTab === 'domain' && (
              <div className="animate-in fade-in duration-300 space-y-4">
                {/* 二级 Tab 切换 (Pill Style) */}
                <div className="flex justify-center mb-6">
                   <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                      <button 
                        onClick={() => setDomainType('static')}
                        className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                          domainType === 'static' 
                          ? 'bg-white text-system-primary shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        静态参数
                      </button>
                      <button 
                        onClick={() => setDomainType('dynamic')}
                        className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                          domainType === 'dynamic' 
                          ? 'bg-white text-system-primary shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        动态参数
                      </button>
                   </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                   {/* 静态参数表格 */}
                   {domainType === 'static' && (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="px-5 py-3 border-b border-gray-200">参数名称</th>
                                <th className="px-5 py-3 border-b border-gray-200">英文标签</th>
                                <th className="px-5 py-3 border-b border-gray-200">数据类型</th>
                                <th className="px-5 py-3 border-b border-gray-200">单位</th>
                                <th className="px-5 py-3 border-b border-gray-200">设定值</th>
                                <th className="px-5 py-3 border-b border-gray-200 w-24">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {staticParams.map(param => (
                               <tr key={param.id} className="hover:bg-gray-50">
                                   <td className="px-5 py-3 text-gray-900 font-medium">{param.name}</td>
                                   <td className="px-5 py-3 text-gray-500 font-mono text-xs">{param.tag}</td>
                                   <td className="px-5 py-3 text-gray-500 text-xs">{param.dataType}</td>
                                   <td className="px-5 py-3 text-gray-500">{param.unit}</td>
                                   <td className="px-5 py-3 text-gray-900">{param.value}</td>
                                   <td className="px-5 py-3">
                                       <button className="text-blue-600 hover:text-blue-800 text-xs">编辑</button>
                                   </td>
                               </tr>
                           ))}
                           {staticParams.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">暂无静态参数</td></tr>}
                        </tbody>
                     </table>
                   )}

                   {/* 动态参数表格 (字段结构已更新) */}
                   {domainType === 'dynamic' && (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="px-5 py-3 border-b border-gray-200">标签名称</th>
                                <th className="px-5 py-3 border-b border-gray-200">描述</th>
                                <th className="px-5 py-3 border-b border-gray-200">量程上限</th>
                                <th className="px-5 py-3 border-b border-gray-200">量程下限</th>
                                <th className="px-5 py-3 border-b border-gray-200">数据源</th>
                                <th className="px-5 py-3 border-b border-gray-200 w-24">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {dynamicParams.map(param => (
                               <tr key={param.id} className="hover:bg-gray-50">
                                   <td className="px-5 py-3 text-gray-900 font-medium">{param.name}</td>
                                   <td className="px-5 py-3 text-gray-500 text-xs">{param.description}</td>
                                   <td className="px-5 py-3 text-gray-500 font-mono">{param.upperLimit}</td>
                                   <td className="px-5 py-3 text-gray-500 font-mono">{param.lowerLimit}</td>
                                   <td className="px-5 py-3 text-gray-500">
                                      {param.source && <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">{param.source}</span>}
                                   </td>
                                   <td className="px-5 py-3">
                                       <button className="text-blue-600 hover:text-blue-800 text-xs">配置</button>
                                   </td>
                               </tr>
                           ))}
                           {dynamicParams.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">暂无动态参数</td></tr>}
                        </tbody>
                     </table>
                   )}
                </div>
              </div>
            )}

            {/* 3. 其他 Placeholder Tabs */}
            {(activeTab === 'relation' || activeTab === 'database' || activeTab === 'bom') && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-in fade-in duration-300 bg-white rounded-lg border border-gray-200 border-dashed">
                 <div className="text-4xl mb-4 opacity-20">🏗️</div>
                 <span className="text-sm font-medium">该模块功能建设中...</span>
                 <span className="text-xs mt-1 text-gray-400">({activeTab} module placeholder)</span>
              </div>
            )}

          </div>
        </StandardDrawer>
      )}
    </AdminPageWrapper>
  );
};
