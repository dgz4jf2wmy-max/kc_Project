import { ApiResponse, KnifeDisc, KnifeGapRecord, KnifeUsageRecord } from '../types';

/**
 * MOCK API SERVICE
 * 
 * 提示给后端开发：
 * 这里的每个方法都对应未来后端的一个 Controller 接口。
 * 目前返回的是静态 Promise 数据。
 * 迁移时，请保持函数名不变，将内部实现改为 axios.get/post 即可。
 */

// 模拟获取关键指标数据
export const fetchKeyMetrics = async (): Promise<ApiResponse<any>> => {
  // 模拟网络延迟
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

export const fetchKnifeList = async (): Promise<ApiResponse<KnifeDisc[]>> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    code: 200,
    message: 'success',
    data: [
      {
        id: 'KD-2023-001',
        model: 'SCH改进(国产)',
        type: 'cut',
        status: 'in_use',
        usageHours: 124.5,
        lastUpTime: '2025-05-16',
        lastDownTime: '-',
        estimatedLifespan: 500,
        mark: '运行平稳',
        remark: '国产替代测试'
      },
      {
        id: 'KD-2023-002',
        model: 'TC4K',
        type: 'cut',
        status: 'idle',
        usageHours: 450.0,
        lastUpTime: '2025-02-22',
        lastDownTime: '2025-03-10',
        estimatedLifespan: 600,
        remark: '备用库A区'
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
        mark: '达到寿命极限',
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
        remark: '新到货'
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
        remark: '试运行完成'
      },
      {
        id: 'KD-2023-055',
        model: 'TC2(内TC2,外TC)',
        type: 'cut',
        status: 'idle',
        usageHours: 320.5,
        lastUpTime: '2025-04-08',
        lastDownTime: '2025-05-01',
        estimatedLifespan: 600,
        mark: '复合型测试',
        remark: ''
      },
      {
        id: 'KD-2023-088',
        model: '国产XC5',
        type: 'grind',
        status: 'in_use',
        usageHours: 210.8,
        lastUpTime: '2025-05-28',
        lastDownTime: '-',
        estimatedLifespan: 550,
        remark: '性能表现优异'
      },
      {
        id: 'KD-2022-012',
        model: 'LM',
        type: 'cut',
        status: 'scrapped',
        usageHours: 900.2,
        lastUpTime: '2021-05-09',
        lastDownTime: '2022-06-01',
        estimatedLifespan: 850,
        mark: '磨损严重',
        remark: '旧批次'
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
        remark: '全新库存'
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
        remark: '新工艺'
      }
    ]
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
      { id: '1', weekDate: '2023-10-07', gapValue: 0.45 },
      { id: '2', weekDate: '2023-09-30', gapValue: 0.42 },
      { id: '3', weekDate: '2023-09-23', gapValue: 0.40 },
      { id: '4', weekDate: '2023-09-16', gapValue: 0.38 },
    ]
  };
};