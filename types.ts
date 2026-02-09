
// 定义系统模块枚举
export enum ModuleType {
  DIGITAL_TWIN = 'DIGITAL_TWIN', // 孪生大屏
  MONITORING = 'MONITORING',     // 监测工作台
  ANALYSIS = 'ANALYSIS',         // 数据分析
  ADMIN = 'ADMIN'                // 后台管理
}

// 导航项结构
export interface NavItem {
  id: string;
  label: string;
  module: ModuleType;
  path: string;
  icon?: string; // 预留图标字段
}

// 用户信息结构
export interface UserProfile {
  id: string;
  name: string;
  role: 'operator' | 'manager' | 'admin';
  department: string;
}

// 通用API响应结构 (预留给后端对接)
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// --- 刀盘管理相关模型 (v1.1) ---

export type KnifeStatus = 'idle' | 'in_use' | 'scrapped'; // 闲置 | 在用 | 报废
export type KnifeType = 'cut' | 'grind'; // 切刀 | 磨刀

export interface KnifeDisc {
  id: string;           // 刀盘编号
  model: string;        // 刀盘型号
  type: KnifeType;      // 刀盘类型
  status: KnifeStatus;  // 状态
  usageHours: number;   // 累计使用时长
  lastDownTime: string; // 最后下机时间 (YYYY-MM-DD)
  lastUpTime: string;   // 最后上机时间 (YYYY-MM-DD)
  mark?: string;        // 刀盘标记 (v1.1)
  remark?: string;      // 备注
  
  // 静态参数
  estimatedLifespan: number; // 预计寿命时长
}

export interface KnifeUsageRecord {
  id: string;
  date: string;         // 日期
  type: 'up' | 'down';  // 使用类型：上机/下机
  device: string;       // 关联设备名称
  team: string;         // 班组 (甲/乙/丙/丁)
}

export interface KnifeGapRecord {
  id: string;
  weekDate: string;     // 自然周最后一天
  gapValue: number;     // 间隙值 (.00)
}

// --- 设备管理相关模型 (v1.0 新增) ---

export type DeviceStatus = 'in_use' | 'maintenance' | 'stopped'; // 使用中 | 维修中 | 停机

export interface DeviceRegistryItem {
  id: string;           // 唯一标识
  status: DeviceStatus; // 设备状态
  name: string;         // 设备名称
  code: string;         // 设备编码
  model: string;        // 设备型号
  level: string;        // 设备等级 (A/B/C)
  manufacturer: string; // 生产厂家
  productionDate: string; // 生产日期
}

// v1.2 更新：设备参数模型，兼容静态和动态参数的不同字段需求
export interface DeviceParam {
  id: string;
  name: string;      // 参数名称 / 标签名称
  
  // 静态参数常用字段
  tag?: string;       // 英文标签
  dataType?: string;  // 数据类型
  unit?: string;      // 单位
  value?: string;     // 当前值
  
  // 动态参数常用字段 (v1.2 新增)
  description?: string; // 描述
  upperLimit?: string;  // 量程上限
  lowerLimit?: string;  // 量程下限
  source?: string;      // 数据源
  collectFreq?: string; // 采集频率 (旧字段保留)
}

// --- 物料管理相关模型 (v1.4 重构：投料与浆板质量) ---

// 3. 物料指标 & 2. 物料信息 (合并在详情结构中，因为是 1:1)
export interface MaterialBatchDetail {
  id: string;
  // -- 物料信息 --
  batchNo: string;      // 批号
  manufacturer: string; // 厂家
  productCode: string;  // 产品代号
  
  // -- 物料指标 --
  pulpType: string;         // 浆板种类
  quantity: number;         // 数量T (.000)
  whiteness: number;        // 白度 (0.)
  dust: number;             // 尘埃MM2M2 (.0)
  freeness: number;         // 叩解度°SR (0.)
  breakingLength: number;   // 裂断长M (0.)
  foldingEndurance: number; // 耐折度双次 (0.)
  moisture: number;         // 水份 (0.)
  grammage: number;         // 定量GM2 (.0)
  fluorescence: number;     // 荧光检查MM2M2 (0.)
  L: number;                // L (.00)
  A: number;                // A (.00)
  B: string;                // B (字符 20)
  fiberLength: number;      // 纤维长度 (0.)
  foreignFiber: number;     // 异性纤维 (0.)
  phValue: number;          // PH值 (0.)
  viscosity: number;        // 粘度 (0.)
}

// 1. 投料信息 (父级记录)
export interface MaterialFeedRecord {
  id: string;
  feedDate: string;   // 投料日期 (yyyy-mm-dd)
  team: string;       // 投料班组 (甲/乙/丙/丁)
  shiftTime: string;  // 班组值班时间 (hh:mm~hh:mm)
  
  // 关联的物料批次列表 (1对多)
  batches: MaterialBatchDetail[];
}

// ==========================================
// NEW MODULES (v2.0) - 基于产品经理需求定义
// ==========================================

// --- 3.1.4 工艺指标 (Process Indicators) ---

export type RotationDirection = '正转' | '反转'; // 刀盘转向有效值

export interface ProcessIndicatorDeviceConfig {
  deviceId: string;       // 设备标识 (e.g. "1#", "2#")
  rotation: RotationDirection; 
}

export interface ProcessIndicator {
  id: string;
  
  // 时间控制
  startTime: string;      // 开始时间 (yyyy-mm-dd hh:mm)
  endTime?: string;       // 结束时间 (yyyy-mm-dd hh:mm) - 规则：由新指标下发触发计算(-1min)
  
  // 核心指标
  freeness: number;          // 叩解度 (0.)
  freenessDeviation: number; // 叩解度偏差值 (.0)
  fiberLength: number;       // 纤维长度 (.00)
  fiberLengthDeviation: number; // 纤维长度偏差值 (.00)
  
  // 关联信息
  productCode: string;       // 产品代号 (关联字典)
  
  // 设备配置 (1#~5# 顺序展示)
  deviceConfigs: ProcessIndicatorDeviceConfig[]; 
}

// --- 3.1.5 异常记录 (Exception Records) ---

// 异常类型枚举
export type ExceptionType = '叩解度异常' | '纤维长度异常';
export type TransferObject = '抄纸'; // 信息传递对象，目前默认抄纸

// 1. 工艺异常记录
export interface ProcessExceptionRecord {
  id: string;
  
  // 基础信息 (只读)
  date: string;              // 日期 (yyyy-mm-dd)
  team: string;              // 班组 (甲/乙/丙/丁)
  shiftTime: string;         // 班组值班时间 (hh:mm~hh:mm)
  
  // 关联与类型
  productCode: string;       // 产品代号
  exceptionType: ExceptionType; // 异常类型
  
  // 快照数据 (关联实时数据库的值，需存储快照)
  refFreenessSnapshot?: string;    // 实时库内叩解度值
  refFiberLengthSnapshot?: string; // 实时库内纤维长度值
  
  // 处置过程
  fluctuationStartTime: string;    // 波动开始时间 (hh:mm)
  preAdjustmentValue: number;      // 调整前指标 (.00) - UI需根据类型追加 °SR 或 mm
  completionTime: string;          // 处置完成时间 (hh:mm)
  postAdjustmentValue: number;     // 调整后指标 (.00) - UI需根据类型追加 °SR 或 mm
  
  // 传递记录
  transferTime: string;            // 信息传递记录时间 (hh:mm)
  transferObject: TransferObject;  // 信息传递记录对象 (默认: 抄纸)
  
  remark?: string;                 // 备注 (200字)
  isDeleted: boolean;              // 删除标识 (软删除)
}

// 2. 生产异常记录
export interface ProductionExceptionRecord {
  id: string;
  date: string;         // 日期 (yyyy-mm-dd)
  description: string;  // 异常情况 (200字)
  duration: number;     // 持续时间 (.00) 单位: h
  team: string;         // 班组 (甲/乙/丙/丁)
}

// --- 换刀记录 (Knife Change Record) - New v2.1 ---
export interface KnifeChangeRecord {
  id: string;
  date: string;         // yyyy-mm-dd
  time: string;         // hh:mm (辅助字段，用于排序和展示)
  
  // 刀盘型号配置 (只读)
  device1_knife: string; // 1#精浆机刀盘
  device2_knife: string; // 2#精浆机刀盘
  device3_knife: string; // 3#精浆机刀盘
  device4_knife: string; // 4#精浆机刀盘
  device5_knife: string; // 5#精浆机刀盘
  
  team: string;          // 班组: 甲/乙/丙/丁
  
  // 前端辅助字段：标识本次记录哪台设备发生了变更，用于UI高亮
  changedDeviceIds: number[]; 
}


// --- 3.1.6 数据分析 (Data Analysis) ---

export type OperationSource = '自动操作' | '人工操作';
export type FeedType = '累计进刀' | '累计退刀';

// 1. & 2. 进退刀汇总 (工艺异常 & 工艺回溯 共用结构)
export interface KnifeFeedSummary {
  id: string;
  deviceName: string;        // 关联设备台账
  
  // 核心计算规则：正数为进刀，负数为退刀
  // 实际存储时可能只存 netChange，UI根据正负拆分展示。
  // 此处遵循需求文档定义的字段：
  accumulatedInFeed?: number;  // 累计进刀 (.00) - 仅当结果为正时有值
  accumulatedOutFeed?: number; // 累计退刀 (.00) - 仅当结果为负时有值
  
  inFeedDuration?: number;     // 进刀时长 (.00)
  outFeedDuration?: number;    // 退刀时长 (.00)
  
  operationSource: OperationSource[]; // 操作来源汇总 (可能包含多种)
}

// 3. & 4. 操作明细 (工艺操作 & 操作动作 共用结构)
export interface KnifeFeedActionDetail {
  id: string;
  timeRange: string;           // 时间 (yyyy-mm-dd hh:mm:ss ~ yyyy-mm-dd hh:mm:ss)
  deviceName: string;          // 关联设备台账
  
  type: FeedType;              // 进/退刀类型
  gapChange: number;           // 刀盘间隙变化 (.00)
  duration: string;            // 时长 (hh:mm:ss)
  
  source: OperationSource;     // 操作来源
}
