// src/api/report.ts
import request from '@/utils/request'

export const generateDailyReport = () => {
  return request.post('/api/test/api/generate_daily_report/')
}
