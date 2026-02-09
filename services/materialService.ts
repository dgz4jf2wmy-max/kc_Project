
import { ApiResponse, MaterialFeedRecord, MaterialBatchDetail } from '../types';

/**
 * 物料管理专属数据服务
 * 业务：精浆工段投料记录管理
 */

const MOCK_FEED_RECORDS = [
      {
        id: 'FEED-20250523-01',
        feedDate: '2025-05-23',
        team: '甲',
        shiftTime: '08:00~16:00',
        batches: [
          {
            id: 'B-20250613',
            batchNo: '20250613/20250717',
            manufacturer: '安徽阜阳银丰棉花有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 64.652,
            whiteness: 79,
            dust: 5.7,
            freeness: 14,
            breakingLength: 3499,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 8.4,
            fluorescence: 720,
            L: 94.78,
            A: -0.17,
            B: '三级棉浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1626
          },
          {
            id: 'B-20250614',
            batchNo: '20250613/20250718',
            manufacturer: '湖北明丰特种纸业有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 32.500,
            whiteness: 80,
            dust: 4.8,
            freeness: 15,
            breakingLength: 3550,
            foldingEndurance: 6,
            moisture: 0,
            grammage: 8.2,
            fluorescence: 710,
            L: 94.88,
            A: -0.15,
            B: '三级棉浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1630
          }
        ]
      },
      {
        id: 'FEED-20250523-02',
        feedDate: '2025-05-23',
        team: '乙',
        shiftTime: '16:00~24:00',
        batches: [
          {
            id: 'B-20250815',
            batchNo: '20250815/20250818',
            manufacturer: '安徽阜阳银丰棉花有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 64.702,
            whiteness: 79,
            dust: 6.3,
            freeness: 17,
            breakingLength: 3506,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 9.3,
            fluorescence: 698,
            L: 94.64,
            A: -0.11,
            B: '三级棉浆板',
            fiberLength: 3,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1636
          }
        ]
      },
      {
        id: 'FEED-20250524-01',
        feedDate: '2025-05-24',
        team: '丙',
        shiftTime: '00:00~08:00',
        batches: [
          {
            id: 'B-20250907',
            batchNo: '20250613/20250717',
            manufacturer: '湖北明丰特种纸业有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 98.517,
            whiteness: 79,
            dust: 9.3,
            freeness: 16,
            breakingLength: 3557,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 9.3,
            fluorescence: 727,
            L: 94.65,
            A: 0.01,
            B: '三级棉浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 8,
            viscosity: 1635
          },
          {
            id: 'B-20250908',
            batchNo: '20250608/20250721',
            manufacturer: '深圳东初特种浆板有限公司',
            productCode: '7T',
            pulpType: '棉短绒浆板',
            quantity: 45.200,
            whiteness: 79,
            dust: 7.2,
            freeness: 16,
            breakingLength: 1573,
            foldingEndurance: 4,
            moisture: 0,
            grammage: 11.4,
            fluorescence: 602,
            L: 94.96,
            A: -0.14,
            B: '棉短绒浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 8,
            viscosity: 0
          },
          {
            id: 'B-20250909',
            batchNo: '20250815/20250818',
            manufacturer: '深圳东初特种浆板有限公司',
            productCode: '7T',
            pulpType: '棉短绒浆板',
            quantity: 66.583,
            whiteness: 79,
            dust: 5.7,
            freeness: 17,
            breakingLength: 1395,
            foldingEndurance: 4,
            moisture: 0,
            grammage: 10.8,
            fluorescence: 589,
            L: 94.87,
            A: -0.17,
            B: '棉短绒浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 0
          }
        ]
      },
      {
        id: 'FEED-20250524-02',
        feedDate: '2025-05-24',
        team: '丁',
        shiftTime: '08:00~16:00',
        batches: [
          {
            id: 'B-20250716',
            batchNo: '20250815/20250818',
            manufacturer: '湖北明丰特种纸业有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 65.378,
            whiteness: 79,
            dust: 8.1,
            freeness: 17,
            breakingLength: 3553,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 8.2,
            fluorescence: 652,
            L: 94.48,
            A: -0.01,
            B: '三级棉浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1627
          }
        ]
      },
      {
        id: 'FEED-20250525-01',
        feedDate: '2025-05-25',
        team: '甲',
        shiftTime: '16:00~24:00',
        batches: [
          {
            id: 'B-20250608',
            batchNo: '20250608/20250721',
            manufacturer: '深圳东初特种浆板有限公司',
            productCode: '7T',
            pulpType: '棉短绒浆板',
            quantity: 64.232,
            whiteness: 79,
            dust: 7.2,
            freeness: 16,
            breakingLength: 1573,
            foldingEndurance: 4,
            moisture: 0,
            grammage: 11.4,
            fluorescence: 602,
            L: 94.96,
            A: -0.14,
            B: '棉短绒浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 8,
            viscosity: 0
          }
        ]
      },
      {
        id: 'FEED-20250525-02',
        feedDate: '2025-05-25',
        team: '丙',
        shiftTime: '08:00~16:00',
        batches: [
          {
            id: 'B-20250502-1',
            batchNo: '20250613/20250717',
            manufacturer: '安徽阜阳银丰棉花有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 64.742,
            whiteness: 79,
            dust: 4.8,
            freeness: 15,
            breakingLength: 3705,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 10.2,
            fluorescence: 675,
            L: 94.40,
            A: -0.13,
            B: '三级棉浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1627
          },
          {
            id: 'B-20250502-2',
            batchNo: '20250815/20250818',
            manufacturer: '安徽阜阳银丰棉花有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 65.172,
            whiteness: 80,
            dust: 8.7,
            freeness: 16,
            breakingLength: 3615,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 8.7,
            fluorescence: 626,
            L: 94.57,
            A: -0.13,
            B: '三级棉浆板',
            fiberLength: 2,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1628
          }
        ]
      },
];

// 模拟已出库、待投料的物料池
const MOCK_OUTBOUND_MATERIALS: MaterialBatchDetail[] = [
  {
    id: 'OUT-001',
    batchNo: '20250928/A01',
    manufacturer: '新疆阿克苏棉业',
    productCode: '7T',
    pulpType: '一级棉浆板',
    quantity: 42.500,
    whiteness: 82,
    dust: 4.5,
    freeness: 13,
    breakingLength: 3600,
    foldingEndurance: 6,
    moisture: 0.1,
    grammage: 8.0,
    fluorescence: 0,
    L: 95.2,
    A: -0.1,
    B: '标准',
    fiberLength: 2.1,
    foreignFiber: 0,
    phValue: 7.1,
    viscosity: 1600
  },
  {
    id: 'OUT-002',
    batchNo: '20250928/A02',
    manufacturer: '新疆阿克苏棉业',
    productCode: '7T',
    pulpType: '一级棉浆板',
    quantity: 40.000,
    whiteness: 81,
    dust: 4.8,
    freeness: 14,
    breakingLength: 3580,
    foldingEndurance: 6,
    moisture: 0.1,
    grammage: 8.1,
    fluorescence: 0,
    L: 95.0,
    A: -0.1,
    B: '标准',
    fiberLength: 2.0,
    foreignFiber: 0,
    phValue: 7.0,
    viscosity: 1610
  },
  {
    id: 'OUT-003',
    batchNo: '20250927/B05',
    manufacturer: '山东潍坊浆纸有限公司',
    productCode: 'TC',
    pulpType: '针叶木浆',
    quantity: 120.000,
    whiteness: 88,
    dust: 2.0,
    freeness: 18,
    breakingLength: 4200,
    foldingEndurance: 8,
    moisture: 0.2,
    grammage: 7.5,
    fluorescence: 0,
    L: 96.5,
    A: -0.05,
    B: '优等',
    fiberLength: 2.5,
    foreignFiber: 0,
    phValue: 6.8,
    viscosity: 1500
  },
  {
    id: 'OUT-004',
    batchNo: '20250926/C01',
    manufacturer: '加拿大北木',
    productCode: 'MP',
    pulpType: '进口针叶浆',
    quantity: 200.000,
    whiteness: 90,
    dust: 1.0,
    freeness: 20,
    breakingLength: 4500,
    foldingEndurance: 10,
    moisture: 0,
    grammage: 7.0,
    fluorescence: 0,
    L: 97.0,
    A: 0,
    B: '特级',
    fiberLength: 2.8,
    foreignFiber: 0,
    phValue: 6.9,
    viscosity: 1450
  }
];

export const fetchMaterialFeedList = async (): Promise<ApiResponse<MaterialFeedRecord[]>> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return { code: 200, message: 'success', data: MOCK_FEED_RECORDS };
};

// 获取已出库但未投料的物料 (支持搜索)
export const fetchOutboundMaterials = async (query?: string): Promise<ApiResponse<MaterialBatchDetail[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let data = [...MOCK_OUTBOUND_MATERIALS];
  if (query) {
    const q = query.toLowerCase();
    data = data.filter(item => 
      item.batchNo.toLowerCase().includes(q) || 
      item.manufacturer.toLowerCase().includes(q)
    );
  }
  
  return { code: 200, message: 'success', data };
};

// 提交投料记录
export const submitMaterialFeed = async (record: MaterialFeedRecord): Promise<ApiResponse<boolean>> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // 模拟提交延迟
  console.log('Submitted Feed Record:', record);
  return { code: 200, message: 'success', data: true };
};
