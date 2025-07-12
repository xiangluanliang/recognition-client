import request from "@/utils/request"
import type { Camera } from "@/types/camera"

export const getCameraList = (): Promise<Camera[]> => {
  return request.get("/cameras/")
}

export const getCameraCount = (): Promise<{ count: number }> => {
  return request.get("/cameras/count/")
}

export const getCameraDetail = (id: number): Promise<Camera> => {
  return request.get(`/cameras/${id}/`)
}

export const createCamera = (data: Partial<Camera>) => {
  return request.post("/cameras/", data)
}

export const updateCamera = (id: number, data: Partial<Camera>) => {
  return request.patch(`/cameras/${id}/`, data)
}

export const deleteCamera = (id: number) => {
  return request.delete(`/cameras/${id}/`)
}
