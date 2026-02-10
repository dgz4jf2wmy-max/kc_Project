
import { ApiResponse, OperationPassword } from '../types';

/**
 * 操作口令数据服务 (Singleton Pattern)
 * 业务规则：系统中只允许存在一个全局操作口令，不可删除，不可新增，只能修改。
 */

// 模拟后端存储的唯一口令
let SYSTEM_PASSWORD_RECORD: OperationPassword = { 
  id: 'SYS_PWD_001', 
  code: '123456', // 默认初始口令已更新为 123456
  updatedAt: '2025-09-01 10:00:00' 
};

/**
 * 获取操作口令
 * @returns 返回包含单条记录的数组，以适配前端通用列表组件
 */
export const fetchPasswordList = async (): Promise<ApiResponse<OperationPassword[]>> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  // 始终返回包含唯一记录的数组
  return { code: 200, message: 'success', data: [SYSTEM_PASSWORD_RECORD] };
};

/**
 * 更新操作口令
 * @param id 预留ID字段，实际业务中可能固定为系统ID
 * @param data 更新内容
 */
export const updatePassword = async (id: string, data: Partial<OperationPassword>): Promise<ApiResponse<boolean>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 更新 Mock 数据
  if (data.code) {
    SYSTEM_PASSWORD_RECORD = {
      ...SYSTEM_PASSWORD_RECORD,
      code: data.code,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
  }
  
  console.log('System Password Updated:', SYSTEM_PASSWORD_RECORD);
  return { code: 200, message: 'success', data: true };
};

/**
 * 验证操作口令 (新增接口，供其他页面调用)
 * @param input 用户输入的口令
 * @returns boolean
 */
export const verifyOperationPassword = async (input: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return input === SYSTEM_PASSWORD_RECORD.code;
};
