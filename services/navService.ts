
import { ModuleType, NavItem } from '../types';

/**
 * 导航配置数据
 * 注意：这种纯数据配置方式非常利于迁移到 Vue。
 * 在 Vue 中，你只需要 import 这个数组并在 setup() 中返回即可。
 */
export const SYSTEM_MODULES: NavItem[] = [
  {
    id: 'twin',
    label: '孪生大屏',
    module: ModuleType.DIGITAL_TWIN,
    path: '/'
  },
  {
    id: 'monitor',
    label: '监测看板',
    module: ModuleType.MONITORING,
    path: '/monitor'
  },
  {
    id: 'analysis',
    label: '数据分析',
    module: ModuleType.ANALYSIS,
    path: '/analysis'
  },
  {
    id: 'admin',
    label: '后台管理',
    module: ModuleType.ADMIN,
    path: '/admin'
  }
];

export const ADMIN_SIDEBAR_MENU: NavItem[] = [
  { id: 'dev-mgt', label: '设备管理', module: ModuleType.ADMIN, path: '/admin/devices' },
  { id: 'tool-mgt', label: '刀盘管理', module: ModuleType.ADMIN, path: '/admin/tools' },
  { id: 'mat-mgt', label: '物料管理', module: ModuleType.ADMIN, path: '/admin/materials' },
  { id: 'pwd-mgt', label: '操作口令', module: ModuleType.ADMIN, path: '/admin/passwords' }, // 新增
  { id: 'user-mgt', label: '人员权限', module: ModuleType.ADMIN, path: '/admin/users' },
  { id: 'logs', label: '系统日志', module: ModuleType.ADMIN, path: '/admin/logs' },
];

/**
 * 获取模块标题
 * @param type ModuleType
 */
export const getModuleTitle = (type: ModuleType): string => {
  const mod = SYSTEM_MODULES.find(m => m.module === type);
  return mod ? mod.label : '未知模块';
};
