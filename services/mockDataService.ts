
import { ApiResponse, KnifeDisc, KnifeGapRecord, KnifeUsageRecord } from '../types';

/**
 * MOCK API SERVICE
 */

// 模拟获取关键指标数据
export const fetchKeyMetrics = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    code: 200,
    message: 'success',
    data: {
      efficiency: 92.5,
      energyConsumption: 1240,
      activeAlerts: 3,
      productionRate: '1200 t/h'
    }
  };
};

// 模拟获取设备列表
export const fetchDeviceList = async (): Promise<ApiResponse<any[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '精磨机 A组', status: 'running', temp: 65 },
      { id: 2, name: '精磨机 B组', status: 'maintenance', temp: 20 },
      { id: 3, name: '筛选机 #1', status: 'running', temp: 58 },
    ]
  };
};

// --- 刀盘管理接口 ---

// Move data out to module scope to allow updates
let MOCK_KNIFE_LIST: KnifeDisc[] = [
  {
    id: 'KD-2023-001',
    model: 'SCH改进(国产)',
    type: 'cut',
    status: 'idle', 
    usageHours: 124.5,
    lastUpTime: '2025-05-16',
    lastDownTime: '2025-09-27',
    estimatedLifespan: 500,
    mark: '-1 2025-09-27于1#精浆机下机',
    remark: '国产替代测试',
    currentDevice: undefined
  },
  {
    id: 'KD-2023-002',
    model: 'TC4K',
    type: 'cut',
    status: 'in_use',
    usageHours: 450.0,
    lastUpTime: '2025-09-27', 
    lastDownTime: '-',
    estimatedLifespan: 600,
    mark: '-1',
    remark: '备用库A区调拨',
    currentDevice: '3'
  },
  {
    id: 'KD-2022-099',
    model: 'SCKH2(旧)',
    type: 'cut',
    status: 'scrapped',
    usageHours: 820.1,
    lastUpTime: '2024-12-01',
    lastDownTime: '2025-01-15',
    estimatedLifespan: 800,
    mark: '2025-01-15于2#精浆机下机',
    remark: '已报废，待处理'
  },
  {
    id: 'KD-2024-101',
    model: 'JQJC-01-3*7CX(国产)',
    type: 'cut',
    status: 'in_use', 
    usageHours: 56.2,
    lastUpTime: '2025-09-17',
    lastDownTime: '-',
    estimatedLifespan: 500,
    mark: '-1',
    remark: '新到货',
    currentDevice: '1'
  },
  {
    id: 'KD-2024-102',
    model: 'JQJC-01-XC2(国产)',
    type: 'grind',
    status: 'idle',
    usageHours: 12.0,
    lastUpTime: '2025-09-17',
    lastDownTime: '2025-09-18',
    estimatedLifespan: 400,
    mark: '-1 2025-09-18于5#精浆机下机',
    remark: '试运行完成',
    currentDevice: undefined
  },
  {
    id: 'KD-2023-055',
    model: 'TC2(内TC2,外TC)',
    type: 'cut',
    status: 'in_use', 
    usageHours: 320.5,
    lastUpTime: '2025-04-08',
    lastDownTime: '-',
    estimatedLifespan: 600,
    mark: '-1',
    remark: '',
    currentDevice: '2'
  },
  {
    id: 'KD-2023-088',
    model: '国产XC5',
    type: 'grind',
    status: 'idle', 
    usageHours: 210.8,
    lastUpTime: '2025-05-28',
    lastDownTime: '2025-09-27',
    estimatedLifespan: 550,
    mark: '-1 2025-09-27于3#精浆机下机',
    remark: '性能表现优异',
    currentDevice: undefined
  },
  {
    id: 'KD-2022-012',
    model: 'LM',
    type: 'cut',
    status: 'in_use', 
    usageHours: 900.2,
    lastUpTime: '2025-09-01', 
    lastDownTime: '-',
    estimatedLifespan: 1000, 
    mark: '-1',
    remark: '状态良好，继续服役',
    currentDevice: '4'
  },
  {
    id: 'KD-2024-003',
    model: 'JQJC-01-LFD(国产)',
    type: 'cut',
    status: 'idle',
    usageHours: 0.0,
    lastUpTime: '-',
    lastDownTime: '-',
    estimatedLifespan: 500,
    remark: '全新库存',
    currentDevice: undefined
  },
  {
    id: 'KD-2024-004',
    model: 'TS(新)',
    type: 'grind',
    status: 'in_use', 
    usageHours: 88.5,
    lastUpTime: '2025-09-03',
    lastDownTime: '-',
    estimatedLifespan: 600,
    mark: '-1',
    remark: '新工艺',
    currentDevice: '5'
  }
];

export const fetchKnifeList = async (): Promise<ApiResponse<KnifeDisc[]>> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    code: 200,
    message: 'success',
    data: [...MOCK_KNIFE_LIST]
  };
};

export const fetchKnifeUsageHistory = async (knifeId: string): Promise<ApiResponse<KnifeUsageRecord[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    code: 200,
    message: 'success',
    data: [
      { id: '1', date: '2023-10-01', type: 'up', device: '精磨机 A组', team: '甲' },
      { id: '2', date: '2023-09-28', type: 'down', device: '精磨机 B组', team: '乙' },
      { id: '3', date: '2023-09-20', type: 'up', device: '精磨机 B组', team: '丙' },
    ]
  };
};

export const fetchKnifeGapAnalysis = async (knifeId: string): Promise<ApiResponse<KnifeGapRecord[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    code: 200,
    message: 'success',
    data: [
      { id: '1', weekDate: '2023-10-07', gapValue: -0.15 }, 
      { id: '2', weekDate: '2023-09-30', gapValue: 0.12 },
      { id: '3', weekDate: '2023-09-23', gapValue: 0.45 },
      { id: '4', weekDate: '2023-09-16', gapValue: 0.78 }, 
    ]
  };
};

// --- 换刀业务逻辑服务 (v2.3) ---
/**
 * 执行换刀操作
 * @param targetDeviceId 目标设备ID (1-5)
 * @param newKnifeId 选中的新刀盘ID
 * @param options 配置项 (是否互换、是否报废旧刀)
 */
export const executeKnifeChange = async (
    targetDeviceId: string, 
    newKnifeId: string, 
    options: { isSwap?: boolean; isScrapOld?: boolean }
): Promise<ApiResponse<boolean>> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // 模拟处理

    const today = new Date().toISOString().slice(0, 10);
    const newKnifeIndex = MOCK_KNIFE_LIST.findIndex(k => k.id === newKnifeId);
    if (newKnifeIndex === -1) return { code: 404, message: 'New knife not found', data: false };

    // 1. 找到该设备上当前的刀盘 (旧刀盘)
    const oldKnifeIndex = MOCK_KNIFE_LIST.findIndex(k => k.currentDevice === targetDeviceId && k.status === 'in_use');
    
    // 获取新刀盘对象的引用 (模拟)
    const newKnife = { ...MOCK_KNIFE_LIST[newKnifeIndex] };
    const oldKnife = oldKnifeIndex !== -1 ? { ...MOCK_KNIFE_LIST[oldKnifeIndex] } : null;

    // 2. 处理旧刀盘去向
    if (oldKnife) {
        if (options.isSwap && newKnife.currentDevice) {
             // 互换模式: 旧刀盘去新刀盘原来的设备
             oldKnife.currentDevice = newKnife.currentDevice;
             oldKnife.mark = '-1'; // 保持在用标记
             // 更新原位置
             MOCK_KNIFE_LIST[oldKnifeIndex] = oldKnife;
        } else if (options.isScrapOld) {
             // 报废模式: 旧刀盘报废
             oldKnife.status = 'scrapped';
             oldKnife.currentDevice = undefined;
             oldKnife.lastDownTime = today;
             oldKnife.mark = `${today}于${targetDeviceId}#精浆机下机`;
             MOCK_KNIFE_LIST[oldKnifeIndex] = oldKnife;
        } else {
             // 默认模式: 旧刀盘闲置
             oldKnife.status = 'idle';
             oldKnife.currentDevice = undefined;
             oldKnife.lastDownTime = today;
             oldKnife.mark = `-1 ${today}于${targetDeviceId}#精浆机下机`;
             MOCK_KNIFE_LIST[oldKnifeIndex] = oldKnife;
        }
    }

    // 3. 处理新刀盘上位
    newKnife.status = 'in_use';
    newKnife.currentDevice = targetDeviceId;
    newKnife.lastUpTime = today;
    newKnife.lastDownTime = '-';
    newKnife.mark = '-1';

    MOCK_KNIFE_LIST[newKnifeIndex] = newKnife;

    return { code: 200, message: 'success', data: true };
};
