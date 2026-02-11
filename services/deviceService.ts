
import { ApiResponse, DeviceRegistryItem, DeviceParam } from '../types';

/**
 * 设备管理专属数据服务
 * 保持独立文件，方便后续维护和接口对接
 */

// 模拟设备台账列表数据
export const fetchDeviceRegistryList = async (): Promise<ApiResponse<DeviceRegistryItem[]>> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    code: 200,
    message: 'success',
    data: [
      {
        id: '1',
        status: 'in_use',
        name: '5#精浆机',
        code: 'JP-005',
        model: 'ZDP-500',
        level: 'A',
        manufacturer: 'Andritz',
        productionDate: '2025-12-15'
      },
      {
        id: '2',
        status: 'in_use',
        name: '4#精浆机',
        code: 'JP-004',
        model: 'ZDP-500',
        level: 'A',
        manufacturer: 'Andritz',
        productionDate: '2025-12-15'
      },
      {
        id: '3',
        status: 'in_use',
        name: '3#精浆机',
        code: 'JP-003',
        model: 'ZDP-450',
        level: 'A',
        manufacturer: 'Metso',
        productionDate: '2025-12-15'
      },
      {
        id: '4',
        status: 'in_use',
        name: '2#精浆机',
        code: 'JP-002',
        model: 'ZDP-450',
        level: 'A',
        manufacturer: 'Metso',
        productionDate: '2025-12-14'
      },
      {
        id: '5',
        status: 'in_use',
        name: '1#精浆机',
        code: 'JP-001',
        model: 'ZDP-400',
        level: 'A',
        manufacturer: 'Valmet',
        productionDate: '2025-12-15'
      },
      // 新增虚拟设备：入口处点位
      {
        id: '6',
        status: 'in_use',
        name: '入口处点位',
        code: 'VIRT-IN-001',
        model: 'VIRTUAL-NODE',
        level: 'C',
        manufacturer: 'System',
        productionDate: '2025-01-01'
      },
      // 新增虚拟设备：出口处点位
      {
        id: '7',
        status: 'in_use',
        name: '出口处点位',
        code: 'VIRT-OUT-001',
        model: 'VIRTUAL-NODE',
        level: 'C',
        manufacturer: 'System',
        productionDate: '2025-01-01'
      }
    ]
  };
};

// 获取设备静态参数 (Mock)
export const fetchDeviceStaticParams = async (deviceId: string): Promise<ApiResponse<DeviceParam[]>> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    code: 200,
    message: 'success',
    data: [
      { id: '101', name: '额定功率', tag: 'rated_power', dataType: 'Float', unit: 'kW', value: '450' },
      { id: '102', name: '额定电压', tag: 'rated_voltage', dataType: 'Float', unit: 'V', value: '380' },
      { id: '103', name: '最大转速', tag: 'max_rpm', dataType: 'Integer', unit: 'rpm', value: '1500' },
      { id: '104', name: '设计产能', tag: 'design_capacity', dataType: 'Float', unit: 't/h', value: '120' },
      { id: '105', name: '安装位置', tag: 'location_code', dataType: 'String', unit: '-', value: '2F-Area-B' },
    ]
  };
};

// 获取设备动态参数 (Mock - v1.3 根据用户提供的业务数据更新)
export const fetchDeviceDynamicParams = async (deviceId: string): Promise<ApiResponse<DeviceParam[]>> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // 针对入口处点位 (ID: 6)
  if (deviceId === '6') {
    return {
      code: 200,
      message: 'success',
      data: [
        { 
          id: 'dyn-in-01', 
          name: '浓度', 
          description: '入口浆料实时浓度', 
          upperLimit: '6.00', 
          lowerLimit: '2.00', 
          source: 'AI_CONC_IN' 
        },
        { 
          id: 'dyn-in-02', 
          name: '入口压力', 
          description: '入口总管实时压力', 
          upperLimit: '10.00', 
          lowerLimit: '0.00', 
          source: 'AI_PRESS_IN' 
        }
      ]
    };
  }

  // 针对出口处点位 (ID: 7)
  if (deviceId === '7') {
    return {
      code: 200,
      message: 'success',
      data: [
        { 
          id: 'dyn-out-01', 
          name: '流量', 
          description: '出口总管实时流量', 
          upperLimit: '5000.00', 
          lowerLimit: '0.00', 
          source: 'AI_FLOW_OUT' 
        }
      ]
    };
  }

  // 默认设备 (磨浆机)
  return {
    code: 200,
    message: 'success',
    data: [
      { 
        id: 'dyn-01', 
        name: '功率', 
        description: '主电机实时运行功率 (Type: Number .00)', 
        upperLimit: '500.00', 
        lowerLimit: '0.00', 
        source: 'PLC_Main' 
      },
      { 
        id: 'dyn-02', 
        name: '进口压力', 
        description: '进浆管路瞬时压力 (Type: Number .00)', 
        upperLimit: '1.00', 
        lowerLimit: '0.00', 
        source: 'PT_In_01' 
      },
      { 
        id: 'dyn-03', 
        name: '出口压力', 
        description: '出浆管路瞬时压力 (Type: Number .00)', 
        upperLimit: '1.20', 
        lowerLimit: '0.00', 
        source: 'PT_Out_01' 
      },
      { 
        id: 'dyn-04', 
        name: '压差', 
        description: '计算规则：出口压力 - 进口压力', 
        upperLimit: '0.60', 
        lowerLimit: '0.00', 
        source: 'Edge_Calc_Eng' 
      },
      { 
        id: 'dyn-05', 
        name: '流量', 
        description: '主管道瞬时流量监测 (Type: Number .00)', 
        upperLimit: '300.00', 
        lowerLimit: '0.00', 
        source: 'FT_Main_01' 
      },
      { 
        id: 'dyn-06', 
        name: '温度', 
        description: '浆料实时温度监测 (Type: Number .00)', 
        upperLimit: '150.00', 
        lowerLimit: '0.00', 
        source: 'TT_Main_01' 
      },
      // 新增：刀盘间隙 (需求关联)
      { 
        id: 'dyn-07', 
        name: '刀盘间隙', 
        description: '实时刀盘间隙值 (Type: Number .00)', 
        upperLimit: '2.00', 
        lowerLimit: '0.00', 
        source: 'GAP_SENSOR_01' 
      },
    ]
  };
};
