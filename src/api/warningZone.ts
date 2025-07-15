import request from '@/utils/request'

export function postWarningZone(data: any) {
  return request.post('/warning_zones/', data)
}
