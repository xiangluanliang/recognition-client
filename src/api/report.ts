// src/api/report.ts
import { aiRequest } from '@/utils/request'

export const generateDailyReport = () => {
  return aiRequest.post('/generate-report');
}
