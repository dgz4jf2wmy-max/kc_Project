
import { ApiResponse } from '../types';

// --- 类型定义 ---

export interface TwinStageData {
  title: string;
  time: string;
  productCode: string;
  freeness: { value: number; min: number; max: number };
  fiberLength: { value: number; min: number; max: number };
}

export interface TwinMachineStatus {
  id: string;
  name: string;
  status: 'run' | 'stop';
  pressureIn: number;
  pressureOut: number;
  diff: number;
  gap: number;
  model: string;
  power: number;
}

export interface TwinChartData {
  label: string;
  value: number;
  unit?: string;
  color?: string;
}

export interface TwinTrendData {
  time: string;
  measure: number;
  soft: number;
}

export interface TwinAbnormalRecord {
  id: number;
  date: string;
  desc: string;
}

// --- MOCK 数据 ---

// 1. 左侧阶段数据
export const fetchTwinStages = async (): Promise<ApiResponse<TwinStageData[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      {
        title: '当前阶段',
        time: '2025-9-12 16:32',
        productCode: '7T',
        freeness: { value: 54, min: 53, max: 55 },
        fiberLength: { value: 0.8, min: 0.75, max: 0.85 }
      },
      {
        title: '下阶段',
        time: '2025-9-12 18:00',
        productCode: '7T',
        freeness: { value: 55, min: 54, max: 56 },
        fiberLength: { value: 0.8, min: 0.75, max: 0.85 }
      }
    ]
  };
};

// 2. 中间设备状态 (5台磨浆机)
export const fetchTwinMachines = async (): Promise<ApiResponse<TwinMachineStatus[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      { id: '5', name: '5#磨浆机', status: 'run', pressureIn: -0.04, pressureOut: 0.01, diff: 0.03, gap: 0.18, model: 'JQJC-01-XCI', power: 180 },
      { id: '4', name: '4#磨浆机', status: 'run', pressureIn: -0.05, pressureOut: 0.01, diff: 0.06, gap: 0.16, model: 'JQJC-01-TC2', power: 180 },
      { id: '3', name: '3#磨浆机', status: 'run', pressureIn: 0.00, pressureOut: 0.00, diff: 0.00, gap: 0.22, model: 'TC', power: 180 },
      { id: '2', name: '2#磨浆机', status: 'run', pressureIn: 0.02, pressureOut: 0.02, diff: 0.00, gap: 0.13, model: 'TM', power: 180 },
      { id: '1', name: '1#磨浆机', status: 'run', pressureIn: -0.09, pressureOut: 0.03, diff: 0.06, gap: 0.15, model: 'TS', power: 180 },
    ]
  };
};

// 3. 右上：开机稳定时间分布
export const fetchStabilityDistribution = async (): Promise<ApiResponse<TwinChartData[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      { label: '60分钟以上', value: 9, color: '#f59e0b' },
      { label: '50分钟', value: 32, color: '#3b82f6' },
      { label: '20-40分钟', value: 56, color: '#a3e635' },
      { label: '0-20分钟', value: 31, color: '#6366f1' },
    ]
  };
};

// 4. 右侧：最优开机时间 (Bar)
export const fetchOptimalStartupTime = async (): Promise<ApiResponse<TwinChartData[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      { label: '甲', value: 9 },
      { label: '甲', value: 11 },
      { label: '丁', value: 12 },
      { label: '乙', value: 13 },
      { label: '丙', value: 13 },
      { label: '丙', value: 14 },
      { label: '丁', value: 15 },
      { label: '丙', value: 16 },
      { label: '丁', value: 17 },
      { label: '甲', value: 18 },
    ]
  };
};

// 5. 底部：测量值趋势 (Line)
export const fetchTrendData = async (type: 'freeness' | 'fiber'): Promise<ApiResponse<TwinTrendData[]>> => {
  const count = 15;
  const data = [];
  let base = type === 'freeness' ? 55 : 0.8;
  for (let i = 0; i < count; i++) {
    data.push({
      time: `13:${String(i * 5).padStart(2, '0')}`,
      measure: base + (Math.random() - 0.5) * (type === 'freeness' ? 2 : 0.05),
      soft: base + (Math.random() - 0.5) * (type === 'freeness' ? 1 : 0.02),
    });
  }
  return { code: 200, message: 'success', data };
};

// 6. 底部：合格率统计 (Line - Multi)
export const fetchQualifiedRates = async (): Promise<ApiResponse<any>> => {
  return {
    code: 200,
    message: 'success',
    data: {
      freeness: [96, 97, 98.5, 97, 98, 97.5, 99], // Mock 7 days
      fiber: [97, 97.5, 97, 98, 98.5, 98, 99],
      dates: ['4-10', '4-11', '4-12', '4-13', '4-14', '4-15', '4-16']
    }
  };
};

// 7. 底部：班组累计工艺异常时长 (Pie)
export const fetchShiftAbnormalStats = async (): Promise<ApiResponse<TwinChartData[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      { label: '甲 3小时42分', value: 222, color: '#3b82f6' },
      { label: '乙 14小时4分', value: 844, color: '#a3e635' },
      { label: '丙 7小时11分', value: 431, color: '#f59e0b' },
      { label: '丁 8小时48分', value: 528, color: '#ec4899' },
    ]
  };
};

// 8. 底部：异常情况列表
export const fetchAbnormalRecords = async (): Promise<ApiResponse<TwinAbnormalRecord[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      { id: 1, date: '2025-02-09', desc: '在线异常，清洗设备' },
      { id: 2, date: '2025-03-02', desc: '更换精浆前池提浆...' },
      { id: 3, date: '2025-03-14', desc: '4#精浆机卡浆，已...' },
      { id: 4, date: '2025-03-16', desc: '提浆泵加装配件' },
      { id: 5, date: '2025-03-16', desc: '处理2#送浆系统...' },
    ]
  };
};
