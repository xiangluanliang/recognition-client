import request from "@/utils/request"
import type { Camera } from "@/types/camera"
import axios from "axios";

export const getCameraList = (): Promise<Camera[]> => {
  return request.get("/cameras/")
}

export const getCameraCount = (): Promise<{ count: number }> => {
  return request.get("/cameras/count/")
}

export const getCameraDetail = (id: number): Promise<Camera> => {
  return request.get(`/cameras/${id}/`)
}

export const updateCamera = (id: number, data: Partial<Camera>) => {
  return request.patch(`/cameras/${id}/`, data)
}

export const deleteCamera = (id: number) => {
  return request.delete(`/cameras/${id}/`)
}


export interface CameraCreatePayload {
  name: string;
  location?: string;
  camera_type?: string;
  is_active: boolean;
  url?: string;
  password?: string;
}

export async function createCamera(data: CameraCreatePayload) {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Token ${token}` } : {};
  try {
    const response = await axios.post('/api/cameras/', data, { headers });
    return response.data;
  } catch (err) {
    console.error('添加摄像头失败', err);
    throw err;
  }
}

export async function getFlow(id: number) {
  const token = localStorage.getItem('token');
  return axios.get(`/api/cameras/${id}/flow_info/`, {
    headers: { Authorization: `Token ${token}` }
  });
}

// 获取当前用户摄像头列表
export async function fetchMyCameras() {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Token ${token}` } : {};
  try {
    const res = await axios.get('/api/cameras/my_cameras/', { headers });
    return res.data;
  } catch (err) {
    console.error('加载摄像头列表失败', err);
    throw err;
  }
}
