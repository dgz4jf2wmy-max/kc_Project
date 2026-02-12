
import { ApiResponse, OverallStats, DailyStartupDuration, DailyAvgStartupDuration, DailyStartupDurationDetail, DailyAvgStartupDurationDetail, AnalysisShiftType, TeamStartupStabilityDetail, StartupDurationDistributionDetail, DailyTeamQualifiedRate, QualifiedRateStatsDetail, AnalysisQualifiedTeamType } from '../types';

/**
 * 班组绩效专属数据服务
 * 用于处理班组考核、绩效统计等业务逻辑
 */

// ... (keep existing code for fetchOverallStats, fetchDailyStartupDurations, etc.) ...
// 为了节省篇幅，这里保留之前的 fetchDailyStartupDurations 等函数，只在下方追加新函数
// 请确保不要删除原有的 export const ...

// 预留：获取绩效列表接口
export const fetchTeamPerformanceList = async (): Promise<ApiResponse<any[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    code: 200,
    message: 'success',
    data: []
  };
};

/**
 * 获取综合统计数据 (Mock)
 * 对应页面顶部的四个统计卡片
 */
export const fetchOverallStats = async (): Promise<ApiResponse<OverallStats>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    code: 200,
    message: 'success',
    data: {
      avgStartupDuration: 29.56,
      startupCount: 37,
      teamFreenessQualifiedRate: [
        { team: '甲', value: 98.34 },
        { team: '乙', value: 96.86 },
        { team: '丙', value: 97.16 },
        { team: '丁', value: 96.93 }
      ],
      teamFiberLengthQualifiedRate: [
        { team: '甲', value: 98.34 },
        { team: '乙', value: 96.93 },
        { team: '丙', value: 97.16 },
        { team: '丁', value: 96.12 }
      ]
    }
  };
};

// ... (保留之前的 fetchDailyStartupDurations, fetchDailyAvgStartupDurations, details 等接口不变) ...
export const fetchDailyStartupDurations = async (): Promise<ApiResponse<DailyStartupDuration[]>> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const data: DailyStartupDuration[] = [];
  const teams = ['甲', '乙', '丙', '丁'] as const;
  const today = new Date('2026-02-04'); 
  for (let i = 24; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = Math.floor(Math.random() * 3) + 1; 
    for (let k = 0; k < count; k++) {
      let type: '初次开机' | '其他开机' = k === 0 ? '初次开机' : '其他开机'; 
      data.push({
        date: dateStr,
        duration: Math.floor(Math.random() * 40) + 10, 
        type: type as any, 
        team: teams[Math.floor(Math.random() * teams.length)],
        avgDuration: 0 
      });
    }
    if (i === 14) { 
        data.push({ date: dateStr, duration: 120, type: '其他开机' as any, team: '丙', avgDuration: 0 });
    }
  }
  return { code: 200, message: 'success', data };
};

export const fetchDailyAvgStartupDurations = async (): Promise<ApiResponse<DailyAvgStartupDuration[]>> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const data: DailyAvgStartupDuration[] = [];
  const today = new Date('2026-02-04');
  for (let i = 24; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    let avg = Math.floor(Math.random() * 30) + 20;
    if (i === 14) avg = 120;
    if (i === 2) avg = 17;
    data.push({ date: dateStr, avgDuration: avg });
  }
  return { code: 200, message: 'success', data };
};

export const fetchDailyStartupDurationDetails = async (): Promise<ApiResponse<DailyStartupDurationDetail[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const data: DailyStartupDurationDetail[] = [];
  const teams = ['甲', '乙', '丙', '丁'] as const;
  const shifts: AnalysisShiftType[] = ['早班', '中班', '晚班'];
  for (let i = 0; i < 50; i++) {
    const date = new Date('2026-02-04');
    date.setDate(date.getDate() - Math.floor(i / 3)); 
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    date.setHours(hour, minute, 0);
    data.push({
      time: date.toISOString().replace('T', ' ').slice(0, 19),
      duration: Math.floor(Math.random() * 50) + 15,
      team: teams[Math.floor(Math.random() * teams.length)],
      shiftType: shifts[Math.floor(Math.random() * shifts.length)]
    });
  }
  return { code: 200, message: 'success', data };
};

export const fetchDailyAvgStartupDurationDetails = async (): Promise<ApiResponse<DailyAvgStartupDurationDetail[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const data: DailyAvgStartupDurationDetail[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date('2026-02-04');
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    data.push({
      time: `${dateStr} 23:59:59`, 
      avgDuration: parseFloat((Math.random() * 30 + 20).toFixed(2))
    });
  }
  return { code: 200, message: 'success', data };
};

// 辅助函数：生成详细数据列表
const generateDetailedRecords = (count: number): any[] => {
    const teams = ['甲', '乙', '丙', '丁'] as const;
    const shifts: AnalysisShiftType[] = ['早班', '中班', '晚班'];
    const data = [];
    const today = new Date('2026-02-04');
    for (let i = 0; i < count; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - Math.floor(Math.random() * 30)); 
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        date.setHours(hour, minute, 0);
        const team = teams[Math.floor(Math.random() * teams.length)];
        let duration = 0;
        if (team === '甲') duration = 20 + Math.random() * 15; 
        else if (team === '乙') duration = 35 + Math.random() * 20; 
        else if (team === '丙') duration = 25 + Math.random() * 10; 
        else duration = 40 + Math.random() * 30; 
        data.push({
            startTime: date.toISOString().replace('T', ' ').slice(0, 19),
            duration: parseFloat(duration.toFixed(1)),
            team: team,
            shiftType: shifts[Math.floor(Math.random() * shifts.length)]
        });
    }
    return data.sort((a, b) => b.startTime.localeCompare(a.startTime));
};

export const fetchTeamStartupStabilityDetails = async (): Promise<ApiResponse<TeamStartupStabilityDetail[]>> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const data = generateDetailedRecords(80); 
  return { code: 200, message: 'success', data };
};

export const fetchStartupDurationDistributionDetails = async (): Promise<ApiResponse<StartupDurationDistributionDetail[]>> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const data = generateDetailedRecords(120); 
  return { code: 200, message: 'success', data };
};

// --- NEW: 合格率统计相关接口 ---

/**
 * 获取每日班组合格率统计 (Summary for Charts)
 * 供旧逻辑使用，新逻辑会使用 Details 聚合
 */
export const fetchDailyQualifiedRates = async (): Promise<ApiResponse<DailyTeamQualifiedRate[]>> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const data: DailyTeamQualifiedRate[] = [];
  const today = new Date('2025-11-21'); 
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const genRate = (base: number = 93) => parseFloat((base + (Math.random() - 0.5) * 6).toFixed(1));
    const totalF = parseFloat((92 + (Math.random() * 4)).toFixed(1));
    const totalL = parseFloat((95 + (Math.random() * 1)).toFixed(1));
    data.push({
      date: dateStr,
      freeness: { teamA: genRate(), teamB: genRate(), teamC: genRate(), teamD: genRate(), total: totalF },
      fiberLength: { teamA: genRate(95), teamB: genRate(95), teamC: genRate(95), teamD: genRate(95), total: totalL }
    });
  }
  return { code: 200, message: 'success', data };
};

/**
 * 获取合格率详细数据 (Detail for Drawer & Aggregation)
 * 增加数据量以支持图表聚合，覆盖过去30天
 */
export const fetchQualifiedRateDetails = async (): Promise<ApiResponse<QualifiedRateStatsDetail[]>> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const data: QualifiedRateStatsDetail[] = [];
  const teams: AnalysisQualifiedTeamType[] = ['甲', '乙', '丙', '丁'];
  const today = new Date('2025-11-21');

  // 生成过去30天的数据，每天每个班组生成1-2条记录，确保图表有数据
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 为每个班组生成数据
    teams.forEach(team => {
        // 叩解度合格率 (85-100)
        const freeness = 85 + Math.random() * 15;
        // 纤维长度合格率 (88-100)
        const fiber = 88 + Math.random() * 12;
        
        // 每天每班组可能有多条检测记录
        data.push({
            time: `${dateStr} ${String(8 + Math.floor(Math.random() * 8)).padStart(2, '0')}:00`,
            team: team,
            freenessQualifiedRate: parseFloat(freeness.toFixed(2)),
            fiberLengthQualifiedRate: parseFloat(fiber.toFixed(2))
        });
    });
  }
  
  // 增加一些“平均”类型的汇总记录（可选，模拟系统自动统计行）
  for (let i = 0; i < 30; i++) {
     const date = new Date(today);
     date.setDate(today.getDate() - i);
     data.push({
        time: `${date.toISOString().split('T')[0]} 23:59`,
        team: '平均',
        freenessQualifiedRate: parseFloat((93 + Math.random() * 2).toFixed(2)),
        fiberLengthQualifiedRate: parseFloat((95 + Math.random() * 1).toFixed(2))
     });
  }

  // 按时间倒序
  data.sort((a, b) => b.time.localeCompare(a.time));

  return { code: 200, message: 'success', data };
};
