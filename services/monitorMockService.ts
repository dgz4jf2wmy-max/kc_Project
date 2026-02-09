
import { ApiResponse, ProcessIndicator, ProductionExceptionRecord } from '../types';

/**
 * 监测工作台专属 Mock 数据
 * 这里的结构是专门为 Dashboard 视图层优化的 ViewModel
 */

export interface MonitorRefinerState {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'warning';
  // 核心实时指标
  power: number;       // 功率 KW
  current: number;     // 电流 A
  pIn: number;         // 进浆压力 bar
  pOut: number;        // 出浆压力 bar
  flow: number;        // 流量 L/m
  temp: number;        // 温度 °C
  dp: number;          // 压差 bar
  // 磨片与间隙
  discModel: string;   // 磨片型号
  installDate: string; // 上机日期
  runHours: number;    // 累计时长
  gapInit: number;     // 初始间隙 mm
  gapCurrent: number;  // 当前间隙 mm
  gapChange: number;   // 累计变化 mm
  direction: 'CW' | 'CCW'; // 转向
}

export const fetchMonitorData = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const refiners: MonitorRefinerState[] = [
    {
      id: '1', name: '1# 精浆', status: 'running',
      power: 171, current: 280, pIn: 2.61, pOut: 3.08, flow: 2800, temp: 45.4, dp: 0.47,
      discModel: 'JQJC-01-XCI', installDate: '2025-09-17', runHours: 132,
      gapInit: 1.68, gapCurrent: 0.80, gapChange: -0.88, direction: 'CCW'
    },
    {
      id: '2', name: '2# 精浆', status: 'running',
      power: 156, current: 265, pIn: 2.77, pOut: 3.16, flow: 2986, temp: 47.3, dp: 0.38,
      discModel: 'TC2-PRO', installDate: '2025-09-17', runHours: 132,
      gapInit: 1.68, gapCurrent: 0.96, gapChange: -0.72, direction: 'CW'
    },
    {
      id: '3', name: '3# 精浆', status: 'running',
      power: 198, current: 310, pIn: 2.79, pOut: 3.47, flow: 2826, temp: 47.8, dp: 0.68,
      discModel: 'TC-STD', installDate: '2025-09-17', runHours: 132,
      gapInit: 1.68, gapCurrent: 1.04, gapChange: -0.64, direction: 'CCW'
    },
    {
      id: '4', name: '4# 精浆', status: 'stopped',
      power: 0, current: 0, pIn: 2.80, pOut: 3.25, flow: 0, temp: 45.1, dp: 0.45,
      discModel: 'TM-HVY', installDate: '2025-09-17', runHours: 132,
      gapInit: 1.68, gapCurrent: 0.80, gapChange: -0.88, direction: 'CW'
    },
    {
      id: '5', name: '5# 精浆', status: 'running',
      power: 211, current: 325, pIn: 2.62, pOut: 3.18, flow: 2802, temp: 48.9, dp: 0.56,
      discModel: 'JQJC-05', installDate: '2025-09-17', runHours: 132,
      gapInit: 1.68, gapCurrent: 0.83, gapChange: -0.85, direction: 'CW'
    }
  ];

  return {
    code: 200,
    data: {
      refiners,
      shift: { name: '甲班组 (早班)', time: '08:00 - 20:00', date: '2025-09-27' },
      // 注意：这里的 standard 字段是旧的 mock 数据结构，
      // 实际开发中建议迁移到下方独立的 fetchCurrentProcessIndicator 接口
      standard: {
        product: 'TC',
        startTime: '09-01 22:52',
        targetFreeness: 54,
        freenessDev: 1,
        targetFiber: 0.8,
        fiberDev: 0.05
      },
      totalMetrics: {
        pressureIn: 2.85,
        flowOut: 2863
      }
    }
  };
};

/**
 * 获取当前生效的工艺指标 (关联 ProcessIndicator 实体)
 */
export const fetchCurrentProcessIndicator = async (): Promise<ApiResponse<ProcessIndicator>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    code: 200,
    message: 'success',
    data: {
      id: 'PI-20250901-001',
      startTime: '2025-09-01 22:52',
      productCode: 'TC',
      freeness: 54,
      freenessDeviation: 1,
      fiberLength: 0.8,
      fiberLengthDeviation: 0.05,
      deviceConfigs: [
        { deviceId: '1', rotation: '正转' },
        { deviceId: '2', rotation: '反转' },
        { deviceId: '3', rotation: '反转' },
        { deviceId: '4', rotation: '正转' },
        { deviceId: '5', rotation: '正转' }
      ]
    }
  };
};

/**
 * 获取生产异常列表 (关联 ProductionExceptionRecord 实体)
 */
export const fetchProductionExceptions = async (): Promise<ApiResponse<ProductionExceptionRecord[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    code: 200,
    message: 'success',
    data: [
      { id: '1', date: '2025-09-27', team: '甲', description: '在线异常，清洗设备', duration: 11.37 },
      { id: '2', date: '2025-07-21', team: '乙', description: '更换精浆前池提浆泵叶片', duration: 6.34 },
      { id: '3', date: '2025-04-02', team: '丁', description: '4#箱浆机卡浆', duration: 3.18 },
      { id: '4', date: '2025-03-20', team: '丁', description: '提浆泵加装配件', duration: 0.58 },
      { id: '5', date: '2025-03-18', team: '丙', description: '处理2#送浆系统流量烟', duration: 1.2 }
    ]
  };
};
