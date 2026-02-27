
import { ApiResponse, DailyTeamQualifiedRate } from '../types';
import { fetchCurrentProcessIndicator, fetchMonitorData } from './monitorMockService'; // Import fetchMonitorData
import { fetchDailyQualifiedRates } from './teamPerformanceService';

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

// 1. 左侧阶段数据 (关联 ProcessIndicator 实体)
export const fetchTwinStages = async (): Promise<ApiResponse<TwinStageData[]>> => {
  // 获取当前工艺指标
  const indicatorRes = await fetchCurrentProcessIndicator();
  const current = indicatorRes.data;

  // 模拟计算下一个阶段的时间 (例如：当前时间 + 4小时)
  // 这里简单模拟一个未来的时间点
  const nextTimeStr = '2025-09-12 18:00'; 

  return {
    code: 200,
    message: 'success',
    data: [
      {
        title: '当前阶段',
        time: current.startTime, // 关联实体字段
        productCode: current.productCode, // 关联实体字段
        freeness: { 
            value: current.freeness, 
            min: current.freeness - current.freenessDeviation, 
            max: current.freeness + current.freenessDeviation 
        },
        fiberLength: { 
            value: current.fiberLength, 
            min: parseFloat((current.fiberLength - current.fiberLengthDeviation).toFixed(2)), 
            max: parseFloat((current.fiberLength + current.fiberLengthDeviation).toFixed(2)) 
        }
      },
      {
        title: '下阶段',
        time: nextTimeStr,
        productCode: current.productCode, // 假设下阶段产品不变
        freeness: { value: 55, min: 54, max: 56 }, // 下阶段暂使用 Mock 数据
        fiberLength: { value: 0.8, min: 0.75, max: 0.85 } // 下阶段暂使用 Mock 数据
      }
    ]
  };
};

// 2. 中间设备状态 (数据联动：从 MonitorMockService 获取实时状态)
export const fetchTwinMachines = async (): Promise<ApiResponse<TwinMachineStatus[]>> => {
  // 调用监测看板的数据源，确保数据一致性
  const monitorRes = await fetchMonitorData();
  const refiners = monitorRes.data.refiners;

  // 转换为 TwinMachineStatus 格式
  // 注意：监测看板数据通常是 1-5，孪生大屏布局是从左到右 5-1 (根据之前布局逻辑保留)
  const machines: TwinMachineStatus[] = refiners.map(r => ({
    id: r.id,
    name: r.name.replace('精浆', '磨浆机'), // 统一名称格式
    status: r.status === 'running' ? 'run' : 'stop',
    pressureIn: r.pIn,
    pressureOut: r.pOut,
    diff: r.dp,
    gap: r.gapCurrent,
    model: r.discModel,
    power: Math.round(r.power)
  }));

  // 反转数组以保持大屏原有的 5 -> 1 视觉排列顺序
  return {
    code: 200,
    message: 'success',
    data: machines.reverse()
  };
};

// 3. 右上：开机稳定时间分布 (修正：与班组绩效模块的数据桶保持一致)
export const fetchStabilityDistribution = async (): Promise<ApiResponse<TwinChartData[]>> => {
  return {
    code: 200,
    message: 'success',
    data: [
      { label: '0-20分钟', value: 31, color: '#5b75f0' },   // Blue
      { label: '20-40分钟', value: 56, color: '#b0e34f' },  // Lime
      { label: '40-60分钟', value: 32, color: '#94a3b8' },  // Grey (Lightened for dark mode visibility)
      { label: '60分钟以上', value: 9, color: '#ff9f57' },  // Orange
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
// 关联 DailyTeamQualifiedRate 实体类，调用 TeamPerformanceService 获取统一数据
export const fetchQualifiedRates = async (): Promise<ApiResponse<DailyTeamQualifiedRate[]>> => {
  const response = await fetchDailyQualifiedRates();
  // 截取最近 7 天数据用于大屏展示
  const recentData = response.data.slice(-7);
  return {
    code: 200,
    message: 'success',
    data: recentData
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
