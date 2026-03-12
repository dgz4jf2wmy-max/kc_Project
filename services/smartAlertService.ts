// 智能打浆系统提示 - 数据支持与类型定义

export interface SmartAlertRecord {
  id: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'canceled';
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
  };
};

// 模拟获取历史预警记录
export const fetchAlertHistory = async (): Promise<SmartAlertRecord[]> => {
  // 返回一些历史记录骨架数据
  return [
    { id: 'alert-hist-1', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'confirmed' },
    { id: 'alert-hist-2', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'canceled' },
    { id: 'alert-hist-3', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'confirmed' },
  ];
};

// 模拟记录用户的操作（确定下发 / 取消）
export const recordAlertAction = async (id: string, action: 'confirmed' | 'canceled'): Promise<boolean> => {
  console.log(`[SmartAlertService] 记录预警操作: ID=${id}, Action=${action}`);
  // 实际项目中这里会调用后端接口记录数据，用于后续算法优化
  return true;
};
