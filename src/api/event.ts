import request from "@/utils/request"
import type { EventLog } from '@/types/event'

export const getEventList = (params?: any): Promise<EventLog[]> => {
  return request.get('/event_logs/', { params })
}

export const getEventDetail = (id: number): Promise<EventLog> => {
  return request.get(`/event_logs/${id}/`)
}

export const updateEvent = (id: number, data: Partial<EventLog>) => {
  return request.patch(`/event_logs/${id}/`, data)
}

export const deleteEvent = (id: number) => {
  return request.delete(`/event_logs/${id}/`)
}

// 疑似有问题
export const getDetectionEventsByCameraId = (cameraId: number): Promise<EventLog[]> => {
  return request.get(`/events_logs/?camera_id=${cameraId}`)
}