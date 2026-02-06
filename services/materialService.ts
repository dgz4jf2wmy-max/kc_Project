import { ApiResponse, MaterialFeedRecord } from '../types';

/**
 * 物料管理专属数据服务
 * 业务：精浆工段投料记录管理
 */

export const fetchMaterialFeedList = async (): Promise<ApiResponse<MaterialFeedRecord[]>> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    code: 200,
    message: 'success',
    data: [
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
      {
        id: 'FEED-20250526-01',
        feedDate: '2025-05-26',
        team: '丁',
        shiftTime: '16:00~24:00',
        batches: [
          {
            id: 'B-924924',
            batchNo: '924924',
            manufacturer: '湖北明丰特种纸业有限公司',
            productCode: '7T',
            pulpType: '三级棉浆板',
            quantity: 65.318,
            whiteness: 78,
            dust: 9.5,
            freeness: 16,
            breakingLength: 3782,
            foldingEndurance: 5,
            moisture: 0,
            grammage: 9.7,
            fluorescence: 702,
            L: 94.40,
            A: -0.04,
            B: '三级棉浆板',
            fiberLength: 3,
            foreignFiber: 0,
            phValue: 7,
            viscosity: 1647
          }
        ]
      }
    ]
  };
};
