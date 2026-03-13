// 智能打浆系统提示 - 数据支持与类型定义

export interface SmartAlertRecord {
  id: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'canceled';
  exceptionType: string;
  exceptionValue: number;
  unit: string;
  startTime: string;
  adjustments?: {
    device: string;
    action: '进刀' | '退刀';
    value: number;
    unit: string;
  }[];
  // 骨架字段：后续可补充具体的工艺参数建议、超出阈值的详情等
  details?: any; 
}

// 模拟当前是否有未处理的预警
export const fetchCurrentAlert = async (): Promise<SmartAlertRecord | null> => {
  // 模拟返回一个待处理的预警骨架数据
  return {
    id: `alert-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
    exceptionType: '叩解度异常',
    exceptionValue: 46.5,
    unit: '°SR',
    startTime: '10:15:00',
    adjustments: [
      { device: '1#打浆机', action: '退刀', value: 2, unit: '秒' },
      { device: '2#打浆机', action: '退刀', value: 1, unit: '秒' }
    ]
  };
};

// 模拟获取历史预警记录
export const fetchAlertHistory = async (): Promise<SmartAlertRecord[]> => {
  // 返回一些历史记录骨架数据
  return [
    { 
      id: 'alert-hist-1', 
      timestamp: new Date(Date.now() - 3600000).toISOString(), 
      status: 'confirmed',
      exceptionType: '叩解度异常',
      exceptionValue: 45.2,
      unit: '°SR',
      startTime: '09:30:00',
      adjustments: [
        { device: '1#打浆机', action: '退刀', value: 1, unit: '秒' }
      ]
    },
    { 
      id: 'alert-hist-2', 
      timestamp: new Date(Date.now() - 7200000).toISOString(), 
      status: 'canceled',
      exceptionType: '纤维长度异常',
      exceptionValue: 0.85,
      unit: 'mm',
      startTime: '08:15:00',
      adjustments: [
        { device: '3#打浆机', action: '进刀', value: 2, unit: '秒' },
        { device: '4#打浆机', action: '进刀', value: 1, unit: '秒' }
      ]
    },
    { 
      id: 'alert-hist-3', 
      timestamp: new Date(Date.now() - 86400000).toISOString(), 
      status: 'confirmed',
      exceptionType: '叩解度异常',
      exceptionValue: 47.1,
      unit: '°SR',
      startTime: '昨天 15:20:00',
      adjustments: [
        { device: '1#打浆机', action: '退刀', value: 3, unit: '秒' }
      ]
    },
  ];
};

// 模拟记录用户的操作（确定下发 / 取消）
export const recordAlertAction = async (id: string, action: 'confirmed' | 'canceled'): Promise<boolean> => {
  console.log(`[SmartAlertService] 记录预警操作: ID=${id}, Action=${action}`);
  // 实际项目中这里会调用后端接口记录数据，用于后续算法优化
  return true;
};
