import request from "@/utils/request"

export const getAlarmList = (params?: any) => {
  return request.get("/alarms/", { params })
}

export const getAlarmDetail = (id: number) => {
  return request.get(`/alarms/${id}/`)
}

export const updateAlarmStatus = (id: number, status: string) => {
  return request.patch(`/alarms/${id}/`, { status })
}

export const deleteAlarm = (id: number) => {
  return request.delete(`/alarms/${id}/`)
}

export const getAlarmStats = () => {
  return request.get("/alarms/stats/")
}
