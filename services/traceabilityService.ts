
import { Zap, Gauge, Droplet, Percent } from 'lucide-react';
import { ProcessIndicator, ProcessBacktrackRecord, KnifeFeedSummary, KnifeFeedActionDetail } from '../types';

// --- MOCK Data & Configuration for Process Traceability ---

// 1. 模拟曲线数据生成器
export const TIME_POINTS = 60;

export const generateChartData = (id: string) => {
  return Array.from({ length: TIME_POINTS }, (_, i) => {
    let base = 50;
    let noiseRange = 5;

    // 根据不同参数类型设定基准值
    if (id === 'beatingDegree') { base = 54; noiseRange = 1.5; }
    else if (id === 'fiberLength') { base = 0.8; noiseRange = 0.02; }
    else if (id.startsWith('power')) { base = 160; noiseRange = 10; }
    else if (id.startsWith('gap')) { base = 1.2; noiseRange = 0.1; }
    else if (id.startsWith('flow')) { base = 2800; noiseRange = 50; }
    else if (id.startsWith('cons')) { base = 3.5; noiseRange = 0.1; }

    // 模拟平滑波动
    const noise = Math.sin(i / 5) * (noiseRange / 2) + (Math.random() - 0.5) * (noiseRange / 2);
    
    let action = null;
    let linkedLogId: string | null = null; // 修改为 string | null 以匹配实体ID

    // 模拟操作区间 (与右侧操作记录ID关联)
    // 对应右侧 Log IDs: LOG-101(Manual), LOG-102(Auto), etc.
    if ((id === 'beatingDegree' || id === 'fiberLength')) {
        if (i >= 40 && i <= 45) {
           action = 'manual';
           linkedLogId = 'LOG-101'; // 对应一条人工进刀记录
        }
        else if (i >= 15 && i <= 20) {
           action = 'auto';
           linkedLogId = 'LOG-102'; // 对应一条自动进刀记录
        }
    }

    return {
      index: i,
      time: `13:${String(i).padStart(2, '0')}`, // 增加具体时间字符串用于 Tooltip
      value: Math.max(0, base + noise),
      action,
      linkedLogId
    };
  });
};

// 2. 回溯时刻工艺标准 (关联 ProcessIndicator 实体)
export const MOCK_RETRO_STANDARD: ProcessIndicator = {
  id: 'PI-RETRO-20251002',
  startTime: '2025-10-02 13:00',
  productCode: 'TC-Kraft',
  freeness: 54,
  freenessDeviation: 1,
  fiberLength: 0.8,
  fiberLengthDeviation: 0.05,
  deviceConfigs: [] // 此处UI仅展示核心指标，暂不需要设备配置
};

// 3. 回溯记录列表 (关联 ProcessBacktrackRecord 实体)
// 修正数据结构以严格匹配实体定义 (source 改为数组)
export const RECORD_LIST: ProcessBacktrackRecord[] = [
  { 
    id: 'REC-001', 
    operationType: '开机操作', 
    date: '2025-06-26', 
    timeRange: '22:24 ~ 18:29', 
    source: ['人工操作'] 
  },
  { 
    id: 'REC-002', 
    operationType: '工艺操作', 
    date: '2025-02-22', 
    timeRange: '11:16 ~ 13:22', 
    source: ['自动操作']
  },
  { 
    id: 'REC-003', 
    operationType: '工艺操作', 
    date: '2025-10-31', 
    timeRange: '10:21 ~ 05:10', 
    source: ['人工操作', '自动操作'] // 演示 "并且" 关系
  },
];

// 4. 记录明细详情 (已关联实体类)
export const RECORD_DETAILS: {
  deviceSummary: KnifeFeedSummary[];
  logs: KnifeFeedActionDetail[];
} = {
  // 按设备汇总 (关联 KnifeFeedSummary)
  deviceSummary: [
    { id: 'SUM-01', deviceName: '1#精浆机', accumulatedInFeed: 0.01, inFeedDuration: 32, operationSource: ['人工操作'] },
    { id: 'SUM-02', deviceName: '2#精浆机', accumulatedInFeed: 0.03, inFeedDuration: 16, operationSource: ['自动操作'] },
    { id: 'SUM-03', deviceName: '3#精浆机', accumulatedOutFeed: 0.02, outFeedDuration: 12, operationSource: ['人工操作'] },
    { id: 'SUM-04', deviceName: '5#精浆机', accumulatedInFeed: 0.15, inFeedDuration: 45, operationSource: ['自动操作'] },
  ],
  // 操作流水 (关联 KnifeFeedActionDetail)
  logs: [
    { 
      id: 'LOG-101', 
      startTime: '2025-10-31 13:42:00', // 对应 i=40~45
      deviceName: '1#精浆机', 
      type: '累计进刀', 
      gapChange: 0.05, 
      duration: '2s', 
      source: '人工操作' 
    }, 
    { 
      id: 'LOG-102', 
      startTime: '2025-10-31 13:17:00', // 对应 i=15~20
      deviceName: '1#精浆机', 
      type: '累计进刀', 
      gapChange: 0.02, 
      duration: '2s', 
      source: '自动操作' 
    },   
    { 
      id: 'LOG-103', 
      startTime: '2025-10-31 13:25:58', 
      deviceName: '3#精浆机', 
      type: '累计退刀', 
      gapChange: -0.20, 
      duration: '2s', 
      source: '人工操作' 
    },
    { 
      id: 'LOG-104', 
      startTime: '2025-10-31 13:26:12', 
      deviceName: '2#精浆机', 
      type: '累计进刀', 
      gapChange: 0.10, 
      duration: '5s', 
      source: '人工操作' 
    },
  ]
};

// 5. 参数配置项 (增加 standard 配置)
// 更新：关联设备管理的动态参数 ID
export const PARAM_CONFIGS = [
  { 
    id: 'beatingDegree', 
    name: '叩解度测量值', 
    type: 'single', 
    color: '#10b981', 
    unit: '°SR', 
    hasActions: true, 
    group: 'quality',
    standard: { target: 54, dev: 1 }
  },
  { 
    id: 'fiberLength', 
    name: '纤维长度测量值', 
    type: 'single', 
    color: '#f97316', 
    unit: 'mm', 
    hasActions: true, 
    group: 'quality',
    standard: { target: 0.8, dev: 0.05 }
  },
  { 
    id: 'power', 
    name: '电机功率', 
    type: 'multi', 
    icon: Zap, 
    unit: 'KW', 
    group: 'device',
    linkedDeviceParam: 'dyn-01' // 关联精浆机功率
  },
  { 
    id: 'gap', 
    name: '刀盘间隙', 
    type: 'multi', 
    icon: Gauge, 
    unit: 'mm', 
    group: 'device',
    linkedDeviceParam: 'dyn-07' // 关联精浆机刀盘间隙 (新增)
  },
  { 
    id: 'flow', 
    name: '流量', 
    type: 'multi', 
    icon: Droplet, 
    unit: 'L/m', 
    group: 'device',
    linkedDeviceParam: 'dyn-05' // 关联精浆机流量
  },
  { 
    id: 'consistency', 
    name: '浓度', 
    type: 'multi', 
    icon: Percent, 
    unit: '%', 
    group: 'device',
    linkedDeviceParam: 'dyn-in-01' // 关联入口点位浓度
  },
];
