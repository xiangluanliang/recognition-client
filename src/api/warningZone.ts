import request from '@/utils/request'

export function postWarningZone(data: any) {
  return request.post('/api/warning_zones/', data)
}
