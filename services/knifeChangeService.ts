
import { ApiResponse, KnifeChangeRecord } from '../types';

/**
 * 换刀记录专属 Mock 数据服务
 * 
 * 搜索逻辑说明：
 * 换刀记录的搜索是“状态回溯”式的。
 * 如果搜索 2025-09-27，但当天没有换刀，我们应该展示最近一次换刀后的状态，
 * 因为那代表了当天的设备配置。
 * 
 * 数据关联说明：
 * Mock 数据中的刀盘型号已更新，严格对应后台【刀盘管理】中的型号数据 (如 'SCH改进(国产)', 'TC4K', 'TS(新)' 等)
 */

// 基础 Mock 数据池
const MOCK_DB: KnifeChangeRecord[] = [
  { 
    id: 'KCR-001', date: '2025-09-27', time: '14:00', team: '甲',
    device1_knife: 'JQJC-01-3*7CX(国产)', // 关联 ID: KD-2024-101
    device2_knife: 'TC2(内TC2,外TC)',     // 关联 ID: KD-2023-055
    device3_knife: 'TC4K',                // 关联 ID: KD-2023-002
    device4_knife: 'LM',                  // 关联 ID: KD-2022-012
    device5_knife: 'TS(新)',              // 关联 ID: KD-2024-004
    changedDeviceIds: [1] // 只有 1# 更换
  },
  { 
    id: 'KCR-002', date: '2025-09-15', time: '09:30', team: '乙',
    device1_knife: 'SCH改进(国产)',       // 旧型号
    device2_knife: 'TC2(内TC2,外TC)',
    device3_knife: '国产XC5',             // 之前是这个
    device4_knife: 'LM',
    device5_knife: 'TS(新)',
    changedDeviceIds: [3] // 3# 更换 (变成 TC4K 前的状态)
  },
  { 
    id: 'KCR-003', date: '2025-09-10', time: '16:45', team: '丙',
    device1_knife: 'SCH改进(国产)',
    device2_knife: 'SCKH2(旧)',           // 之前是这个
    device3_knife: '国产XC5',
    device4_knife: 'LM',
    device5_knife: 'TS(新)',
    changedDeviceIds: [2] // 2# 更换
  },
  { 
    id: 'KCR-004', date: '2025-09-08', time: '08:20', team: '丁',
    device1_knife: 'SCH改进(国产)',
    device2_knife: 'SCKH2(旧)',
    device3_knife: '国产XC5',
    device4_knife: 'JQJC-01-LFD(国产)',   // 之前是这个
    device5_knife: 'TS(新)',
    changedDeviceIds: [4] // 4# 更换
  },
  { 
    id: 'KCR-005', date: '2025-09-05', time: '11:10', team: '甲',
    device1_knife: 'SCH改进(国产)',
    device2_knife: 'SCKH2(旧)',
    device3_knife: '国产XC5',
    device4_knife: 'JQJC-01-LFD(国产)',
    device5_knife: 'JQJC-01-XC2(国产)',   // 之前是这个
    changedDeviceIds: [5] // 5# 更换
  },
  { 
    id: 'KCR-006', date: '2025-08-20', time: '10:00', team: '乙',
    device1_knife: 'SCKH2(旧)',           // 之前是这个
    device2_knife: 'SCKH2(旧)',
    device3_knife: '国产XC5',
    device4_knife: 'JQJC-01-LFD(国产)',
    device5_knife: 'JQJC-01-XC2(国产)',
    changedDeviceIds: [1] // 1# 更换
  },
];

/**
 * 获取换刀记录列表（支持特殊的日期搜索逻辑）
 * @param filterDate 搜索日期 (yyyy-mm-dd)
 */
export const fetchKnifeChangeRecords = async (filterDate?: string): Promise<ApiResponse<KnifeChangeRecord[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  let results = [...MOCK_DB];

  // 排序：按日期降序
  results.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

  if (filterDate) {
    // 逻辑：查找 <= filterDate 的记录
    // 如果存在完全匹配日期的记录，返回该日期的记录。
    // 如果不存在，返回 <= filterDate 的第一条记录（代表当时的状态）。
    
    // 1. 过滤掉未来的记录
    const validRecords = results.filter(r => r.date <= filterDate);
    
    // 2. 如果没有记录，说明查询日期比最早的记录还早
    if (validRecords.length === 0) {
      return {
        code: 200,
        message: 'success',
        data: []
      };
    }

    // 3. 找到最近的一条记录 (因为已经按降序排列，取第一个即可)
    const snapshotRecord = validRecords[0];
    
    // 4. 返回策略：
    // 列表页通常需要看历史。
    // 如果用户搜索某一天，我们可以只展示“这一天生效的配置”以及“在此之前的历史”。
    // 这里我们返回从 snapshotRecord 开始的所有历史记录。
    // 这样用户能看到当天状态，也能看到是怎么变过来的。
    const snapshotIndex = results.findIndex(r => r.id === snapshotRecord.id);
    results = results.slice(snapshotIndex);
  }

  return {
    code: 200,
    message: 'success',
    data: results
  };
};

/**
 * 获取最新的 N 条换刀记录（用于 Dashboard 小组件）
 */
export const fetchLatestKnifeChanges = async (limit: number = 5): Promise<ApiResponse<KnifeChangeRecord[]>> => {
    const all = await fetchKnifeChangeRecords();
    return {
        code: 200,
        message: 'success',
        data: all.data.slice(0, limit)
    };
};
