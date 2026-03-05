import { ProductionExceptionRecord } from '../types';

// Extend the interface to match the UI usage in AnalysisDashboard
// and add necessary fields for management
export interface ProcessExceptionItem {
  id: string;
  startDate: string;
  startTime: string;
  endTime: string;
  startVal: number;
  endVal: number;
  isManual: boolean;
  isAuto: boolean;
  exceptionType: string;
  isDeleted: boolean; // Soft delete flag
}

// Initial Mock Data
let PROCESS_EXCEPTIONS: ProcessExceptionItem[] = [
    {
      id: 'pe-001',
      startDate: '09-27', startTime: '10:15', endTime: '10:20',
      startVal: 55.2, endVal: 54.0,
      isManual: true, isAuto: false, 
      exceptionType: '叩解度异常',
      isDeleted: false
    },
    {
      id: 'pe-002',
      startDate: '09-27', startTime: '09:30', endTime: '09:42',
      startVal: 0.76, endVal: 0.81,
      isManual: false, isAuto: true,
      exceptionType: '纤维长度异常',
      isDeleted: false
    },
    {
      id: 'pe-003',
      startDate: '09-27', startTime: '08:12', endTime: '08:18',
      startVal: 2.65, endVal: 2.80,
      isManual: true, isAuto: false,
      exceptionType: '纤维长度异常',
      isDeleted: false
    },
    {
      id: 'pe-004',
      startDate: '09-26', startTime: '23:50', endTime: '00:05',
      startVal: 52.8, endVal: 54.5,
      isManual: false, isAuto: true,
      exceptionType: '叩解度异常',
      isDeleted: false
    },
    // Mock Deleted Data
    {
      id: 'pe-005',
      startDate: '09-25', startTime: '14:30', endTime: '14:45',
      startVal: 50.1, endVal: 48.5,
      isManual: true, isAuto: false,
      exceptionType: '叩解度异常',
      isDeleted: true
    },
    {
      id: 'pe-006',
      startDate: '09-24', startTime: '09:10', endTime: '09:20',
      startVal: 2.55, endVal: 2.40,
      isManual: false, isAuto: true,
      exceptionType: '纤维长度异常',
      isDeleted: true
    },
    {
      id: 'pe-007',
      startDate: '09-23', startTime: '16:00', endTime: '16:15',
      startVal: 12.5, endVal: 13.2,
      isManual: true, isAuto: true,
      exceptionType: '湿重异常',
      isDeleted: true
    },
    {
      id: 'pe-008',
      startDate: '09-22', startTime: '11:20', endTime: '11:35',
      startVal: 45.0, endVal: 46.5,
      isManual: false, isAuto: false, 
      exceptionType: '叩解度异常',
      isDeleted: true
    }
];

export const getActiveProcessExceptions = (): ProcessExceptionItem[] => {
  return PROCESS_EXCEPTIONS.filter(item => !item.isDeleted);
};

export const getDeletedProcessExceptions = (): ProcessExceptionItem[] => {
  return PROCESS_EXCEPTIONS.filter(item => item.isDeleted);
};

export const deleteProcessException = (id: string): void => {
  const index = PROCESS_EXCEPTIONS.findIndex(item => item.id === id);
  if (index !== -1) {
    PROCESS_EXCEPTIONS[index].isDeleted = true;
    // In a real app, we might move this to a separate "deleted" collection/table
    // But for this mock, toggling the flag is sufficient and robust.
  }
};

export const restoreProcessException = (id: string): void => {
  const index = PROCESS_EXCEPTIONS.findIndex(item => item.id === id);
  if (index !== -1) {
    PROCESS_EXCEPTIONS[index].isDeleted = false;
  }
};
