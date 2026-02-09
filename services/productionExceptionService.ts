
import { ApiResponse, ProductionExceptionRecord } from '../types';

/**
 * 生产异常专属 Mock 服务
 * 模拟更详细的历史记录数据
 */
export const fetchProductionExceptionHistory = async (): Promise<ApiResponse<ProductionExceptionRecord[]>> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    code: 200,
    message: 'success',
    data: [
      { id: 'EX-20250927-01', date: '2025-09-27', team: '甲', description: '在线异常，清洗设备，导致短暂停机', duration: 11.37 },
      { id: 'EX-20250721-03', date: '2025-07-21', team: '乙', description: '更换精浆前池提浆泵叶片，磨损严重', duration: 6.34 },
      { id: 'EX-20250402-02', date: '2025-04-02', team: '丁', description: '4#箱浆机卡浆，人工疏通', duration: 3.18 },
      { id: 'EX-20250320-01', date: '2025-03-20', team: '丁', description: '提浆泵加装配件调试', duration: 0.58 },
      { id: 'EX-20250318-04', date: '2025-03-18', team: '丙', description: '处理2#送浆系统流量计信号丢失', duration: 1.2 },
      { id: 'EX-20250215-01', date: '2025-02-15', team: '甲', description: '3#磨浆机进刀装置液压油泄漏', duration: 2.50 },
      { id: 'EX-20250110-02', date: '2025-01-10', team: '乙', description: '总管压力传感器校准', duration: 0.45 },
      { id: 'EX-20241205-01', date: '2024-12-05', team: '丙', description: '1#磨浆机电机异响检查', duration: 4.10 },
      { id: 'EX-20241120-03', date: '2024-11-20', team: '丁', description: '浆池搅拌器故障维修', duration: 8.20 },
      { id: 'EX-20241011-01', date: '2024-10-11', team: '甲', description: '控制系统PLC模块通讯中断恢复', duration: 1.50 },
      { id: 'EX-20240930-02', date: '2024-09-30', team: '乙', description: '节前设备全面巡检与保养', duration: 12.00 },
      { id: 'EX-20240915-01', date: '2024-09-15', team: '丙', description: '出浆口阀门卡涩处理', duration: 1.80 }
    ]
  };
};
