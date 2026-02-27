import { ProcessIndicator } from '../types';

// --- Mock Data ---

const generateMockRecords = (): ProcessIndicator[] => {
  const records: ProcessIndicator[] = [
    {
      id: 'PI-20250606-01',
      productCode: '7T',
      startTime: '2025-06-06 19:48',
      endTime: '2025-02-14 10:10', // Finished (weird date range in prototype, but following format)
      freeness: 54,
      freenessDeviation: 1,
      fiberLength: 0.8,
      fiberLengthDeviation: 0.05,
      deviceConfigs: [
        { deviceId: '1', rotation: '正转' },
        { deviceId: '2', rotation: '反转' },
        { deviceId: '3', rotation: '反转' },
        { deviceId: '4', rotation: '正转' },
        { deviceId: '5', rotation: '正转' },
      ]
    },
    {
      id: 'PI-20250531-02',
      productCode: '7T',
      startTime: '2025-05-31 02:13',
      endTime: '2025-05-26 06:41',
      freeness: 56,
      freenessDeviation: 1,
      fiberLength: 0.8,
      fiberLengthDeviation: 0.05,
      deviceConfigs: [
        { deviceId: '1', rotation: '正转' },
        { deviceId: '2', rotation: '反转' },
        { deviceId: '3', rotation: '反转' },
        { deviceId: '4', rotation: '正转' },
        { deviceId: '5', rotation: '正转' },
      ]
    },
    {
      id: 'PI-CURRENT-03',
      productCode: '7T',
      startTime: '2025-10-14 23:47', // Future/Current
      endTime: '', // Ongoing
      freeness: 58,
      freenessDeviation: 1,
      fiberLength: 0.8,
      fiberLengthDeviation: 0.05,
      deviceConfigs: [
        { deviceId: '1', rotation: '正转' },
        { deviceId: '2', rotation: '正转' },
        { deviceId: '3', rotation: '反转' },
        { deviceId: '4', rotation: '反转' },
        { deviceId: '5', rotation: '正转' },
      ]
    },
    {
      id: 'PI-FUTURE-04',
      productCode: 'TC',
      startTime: '2026-03-01 08:00', // Future
      endTime: '',
      freeness: 55,
      freenessDeviation: 1,
      fiberLength: 0.85,
      fiberLengthDeviation: 0.05,
      deviceConfigs: [
        { deviceId: '1', rotation: '正转' },
        { deviceId: '2', rotation: '正转' },
        { deviceId: '3', rotation: '正转' },
        { deviceId: '4', rotation: '正转' },
        { deviceId: '5', rotation: '正转' },
      ]
    }
  ];
  
  // Generate more dummy data to fill the table
  for (let i = 0; i < 5; i++) {
    records.push({
      id: `PI-MOCK-${i}`,
      productCode: '7T',
      startTime: `2025-0${4-i}-0${5+i} 12:00`,
      endTime: `2025-0${4-i}-0${6+i} 18:00`,
      freeness: 54 + i,
      freenessDeviation: 1,
      fiberLength: 0.8,
      fiberLengthDeviation: 0.05,
      deviceConfigs: [
        { deviceId: '1', rotation: '正转' },
        { deviceId: '2', rotation: '反转' },
        { deviceId: '3', rotation: '正转' },
        { deviceId: '4', rotation: '反转' },
        { deviceId: '5', rotation: '正转' },
      ]
    });
  }

  return records;
};

let MOCK_RECORDS = generateMockRecords();

// --- Service Functions ---

export interface ProcessRecordFilter {
  freeness?: number;
  freenessDev?: number;
  fiberLength?: number;
  fiberLengthDev?: number;
  productCode?: string;
  startDate?: string;
  endDate?: string;
}

export const fetchProcessRecords = async (filter?: ProcessRecordFilter) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...MOCK_RECORDS];

  if (filter) {
    if (filter.productCode) {
      filtered = filtered.filter(r => r.productCode === filter.productCode);
    }
    if (filter.freeness) {
      filtered = filtered.filter(r => r.freeness === filter.freeness);
    }
    // Add other filters as needed... simple equality for now
  }

  // Sort by startTime desc
  return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

export const updateProcessRecord = async (record: ProcessIndicator) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  MOCK_RECORDS = MOCK_RECORDS.map(r => r.id === record.id ? record : r);
  return record;
};
