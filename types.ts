
// types.ts

// --- Enums & Unions ---

export enum ModuleType {
  DIGITAL_TWIN = 'digital_twin',
  MONITORING = 'monitoring',
  ANALYSIS = 'analysis',
  ADMIN = 'admin'
}

export type RotationDirection = '正转' | '反转';
export type AnalysisShiftType = '早班' | '中班' | '晚班';
export type AnalysisQualifiedTeamType = '甲' | '乙' | '丙' | '丁' | '平均';

// --- Navigation ---

export interface NavItem {
  id: string;
  label: string;
  module: ModuleType;
  path: string;
}

// --- Common API ---

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// --- Knife Management ---

export interface KnifeDisc {
  id: string;
  model: string;
  type: 'cut' | 'grind';
  status: 'idle' | 'in_use' | 'scrapped';
  usageHours: number;
  lastUpTime: string;
  lastDownTime: string;
  estimatedLifespan: number;
  mark?: string;
  remark?: string;
  currentDevice?: string;
}

export interface KnifeUsageRecord {
  id: string;
  date: string;
  type: 'up' | 'down';
  device: string;
  team: string;
}

export interface KnifeGapRecord {
  id: string;
  weekDate: string;
  gapValue: number;
}

export interface KnifeChangeRecord {
  id: string;
  date: string;
  time: string;
  team: string;
  device1_knife: string;
  device2_knife: string;
  device3_knife: string;
  device4_knife: string;
  device5_knife: string;
  changedDeviceIds: number[];
}

// --- Device Management ---

export interface DeviceRegistryItem {
  id: string;
  status: 'in_use' | 'maintenance' | 'stopped';
  name: string;
  code: string;
  model: string;
  level: string;
  manufacturer: string;
  productionDate: string;
}

export interface DeviceParam {
  id: string;
  name: string;
  tag?: string;
  dataType?: string;
  unit?: string;
  value?: string;
  description?: string;
  upperLimit?: string;
  lowerLimit?: string;
  source?: string;
}

// --- Material Management ---

export interface MaterialBatchDetail {
  id: string;
  batchNo: string;
  manufacturer: string;
  productCode: string;
  pulpType: string;
  quantity: number;
  whiteness: number;
  dust: number;
  freeness: number;
  breakingLength: number;
  foldingEndurance: number;
  moisture: number;
  grammage: number;
  fluorescence: number;
  L: number;
  A: number;
  B: string | number;
  fiberLength: number;
  foreignFiber: number;
  phValue: number;
  viscosity: number;
}

export interface MaterialFeedRecord {
  id: string;
  feedDate: string;
  team: string;
  shiftTime: string;
  batches: MaterialBatchDetail[];
}

// --- Monitor & Process ---

export interface ProcessIndicatorDeviceConfig {
  deviceId: string;
  rotation: RotationDirection;
}

export interface ProcessIndicator {
  id: string;
  startTime: string;
  productCode: string;
  freeness: number;
  freenessDeviation: number;
  fiberLength: number;
  fiberLengthDeviation: number;
  deviceConfigs: ProcessIndicatorDeviceConfig[];
}

export interface ProductionExceptionRecord {
  id: string;
  date: string;
  team: string;
  description: string;
  duration: number;
}

// --- Admin / Password ---

export interface OperationPassword {
  id: string;
  code: string;
  updatedAt: string;
}

// --- Traceability ---

export interface ProcessBacktrackRecord {
  id: string;
  operationType: string;
  date: string;
  timeRange: string;
  source: string[];
}

export interface KnifeFeedSummary {
  id: string;
  deviceName: string;
  accumulatedInFeed?: number;
  accumulatedOutFeed?: number;
  inFeedDuration?: number;
  outFeedDuration?: number;
  operationSource: string[];
}

export interface KnifeFeedActionDetail {
  id: string;
  startTime: string;
  deviceName: string;
  type: string;
  gapChange: number;
  duration: string;
  source: string;
}

// --- Team Performance Analysis ---

export interface TeamRateItem {
  team: string;
  value: number;
}

export interface OverallStats {
  avgStartupDuration: number;
  startupCount: number;
  teamFreenessQualifiedRate: TeamRateItem[];
  teamFiberLengthQualifiedRate: TeamRateItem[];
}

export interface DailyStartupDuration {
  date: string;
  duration: number;
  type: '初次开机' | '其他开机';
  team: string;
  avgDuration: number;
}

export interface DailyAvgStartupDuration {
  date: string;
  avgDuration: number;
}

export interface DailyStartupDurationDetail {
  time: string;
  duration: number;
  team: string;
  shiftType: AnalysisShiftType;
}

export interface DailyAvgStartupDurationDetail {
  time: string;
  avgDuration: number;
}

export interface TeamStartupStabilityDetail {
  startTime: string;
  duration: number;
  team: string;
  shiftType: AnalysisShiftType;
}

export interface StartupDurationDistributionDetail {
  startTime: string;
  duration: number;
  team: string;
  shiftType: AnalysisShiftType;
}

// 班组开机稳定性 (图表实体)
export interface TeamStartupStability {
  team: string;
  duration: number;
  // 可以包含其他用于图表展示的元数据，如是否异常
  isOutlier?: boolean; 
}

// 开机时长分布 (图表实体)
export interface StartupDurationDistribution {
  range0to20: number;
  range20to40: number;
  range40to60: number;
  rangeOver60: number;
  totalCount: number;
}

export interface QualifiedRateStats {
  readonly teamFreenessQualifiedRate: number;
  readonly avgFreenessQualifiedRate: number;
  readonly teamFiberLengthQualifiedRate: number;
  readonly avgFiberLengthQualifiedRate: number;
}

export interface QualifiedRateStatsDetail {
  readonly time: string;
  readonly freenessQualifiedRate: number;
  readonly fiberLengthQualifiedRate: number;
  readonly team: AnalysisQualifiedTeamType;
}

export interface DailyTeamQualifiedRate {
  date: string;
  freeness: {
    teamA: number;
    teamB: number;
    teamC: number;
    teamD: number;
    total: number;
  };
  fiberLength: {
    teamA: number;
    teamB: number;
    teamC: number;
    teamD: number;
    total: number;
  };
}
