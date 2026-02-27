import { ApiResponse } from '../types';

export interface AnalysisDataPoint {
  timestamp: string;
  value: number;
}

// 简单的伪随机数生成器，保证每次生成的数据一致
const pseudoRandom = (seed: number) => {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// 生成指定范围和波动的数据
const generateDataSeries = (
  seedBase: number,
  startTime: number,
  endTime: number,
  intervalMs: number,
  baseValue: number,
  variance: number
): AnalysisDataPoint[] => {
  const data: AnalysisDataPoint[] = [];
  let currentTime = startTime;
  let index = 0;
  
  // 为了让曲线平滑，使用随机游走
  let currentValue = baseValue;

  while (currentTime <= endTime) {
    // 使用 seedBase + index 作为种子
    const rand = pseudoRandom(seedBase + index);
    // 随机游走，限制在 baseValue ± variance 范围内
    const step = (rand - 0.5) * (variance * 0.2);
    currentValue += step;
    
    if (currentValue > baseValue + variance) currentValue = baseValue + variance;
    if (currentValue < baseValue - variance) currentValue = baseValue - variance;

    data.push({
      timestamp: new Date(currentTime).toISOString(),
      value: Number(currentValue.toFixed(2))
    });

    currentTime += intervalMs;
    index++;
  }

  return data;
};

// 获取参数的基准值和波动范围
const getParamConfig = (paramId: string) => {
  switch (paramId) {
    case 'dyn-01': return { base: 400, variance: 50 }; // 功率
    case 'dyn-02': return { base: 0.5, variance: 0.1 }; // 进口压力
    case 'dyn-03': return { base: 0.7, variance: 0.1 }; // 出口压力
    case 'dyn-04': return { base: 0.25, variance: 0.05 }; // 压差
    case 'dyn-05': return { base: 135, variance: 15 }; // 流量
    case 'dyn-06': return { base: 70, variance: 10 }; // 温度
    case 'dyn-07': return { base: 1.0, variance: 0.5 }; // 刀盘间隙
    case 'beatingDegree': return { base: 55, variance: 2 }; // 叩解度 (参考图片 54±1)
    case 'fiberLength': return { base: 0.8, variance: 0.05 }; // 纤维长度 (参考图片 0.8±0.05)
    default: return { base: 100, variance: 20 };
  }
};

export const fetchAnalysisData = async (
  deviceId: string,
  paramId: string,
  days: number = 30
): Promise<ApiResponse<AnalysisDataPoint[]>> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  const endTime = new Date('2025-10-28T05:28:02Z').getTime(); // 参考图片时间
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  const intervalMs = 5 * 60 * 1000; // 5分钟

  // 根据设备ID和参数ID生成唯一的种子基数
  const seedBase = parseInt(deviceId) * 1000 + paramId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const config = getParamConfig(paramId);

  const data = generateDataSeries(
    seedBase,
    startTime,
    endTime,
    intervalMs,
    config.base,
    config.variance
  );

  return {
    code: 200,
    message: 'success',
    data
  };
};

export const fetchMultiAnalysisData = async (
  deviceIds: string[],
  paramIds: string[],
  days: number = 30
): Promise<ApiResponse<Record<string, Record<string, AnalysisDataPoint[]>>>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const endTime = new Date('2025-10-28T05:28:02Z').getTime(); // 参考图片时间
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  const intervalMs = 5 * 60 * 1000; // 5分钟

  const result: Record<string, Record<string, AnalysisDataPoint[]>> = {};

  deviceIds.forEach(deviceId => {
    result[deviceId] = {};
    paramIds.forEach(paramId => {
      const seedBase = parseInt(deviceId) * 1000 + paramId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const config = getParamConfig(paramId);
      result[deviceId][paramId] = generateDataSeries(
        seedBase,
        startTime,
        endTime,
        intervalMs,
        config.base,
        config.variance
      );
    });
  });

  return {
    code: 200,
    message: 'success',
    data: result
  };
};
