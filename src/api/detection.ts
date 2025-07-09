// src/api/detection.ts
import request from '@/utils/request'

export const getDetectionLogs = (params?: any) => {
  return request.get('/detection_logs/', { params })
}

