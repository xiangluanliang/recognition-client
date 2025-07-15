// store/camera.ts
import { defineStore } from "pinia"
import { ref } from "vue"
import type { Camera } from "@/types/camera"
import type { EventLog } from '@/types/event'
import { getCameraList, createCamera as apiCreateCamera } from "@/api/camera"
import { ElMessage } from "element-plus"
import axios from "axios"

export const useCameraStore = defineStore("camera", () => {
  const cameras = ref<Camera[]>([])
  const selectedCameraId = ref<number | null>(null)
  const eventList = ref<EventLog[]>([])
  const loading = ref(false)
  const viewMode = ref<'grid' | 'single'>('grid')
  const streamBaseUrl = ref('http://127.0.0.1:5000/stream/')

  const fetchCameras = async () => {
    loading.value = true
    try {
      const res = await getCameraList()
      cameras.value = res
      if (res.length > 0 && selectedCameraId.value === null) {
        selectedCameraId.value = res[0].id
        fetchEvents()
      }
    } catch (error) {
      console.error("获取摄像头列表失败", error)
      ElMessage.error('获取摄像头失败')
    } finally {
      loading.value = false
    }
  }

  const fetchEvents = async () => {
    if (!selectedCameraId.value) {
      eventList.value = []
      return
    }
    try {
      const res = await axios.get(`/api/events/?camera_id=${selectedCameraId.value}`)
      eventList.value = res.data
    } catch (error) {
      console.error("事件获取失败", error)
      ElMessage.error('获取事件失败')
    }
  }

  const createCamera = async (data: any): Promise<boolean> => {
    try {
      await apiCreateCamera(data)
      await fetchCameras()
      return true
    } catch (error) {
      ElMessage.error('添加摄像头失败')
      return false
    }
  }

  const setSelectedCamera = (id: number) => {
    selectedCameraId.value = id
    fetchEvents()
  }

  const setViewMode = (mode: 'grid' | 'single') => {
    viewMode.value = mode
  }

  const currentCamera = () => {
    return cameras.value.find(c => c.id === selectedCameraId.value)
  }

  return {
    cameras,
    loading,
    selectedCameraId,
    eventList,
    streamBaseUrl,
    viewMode,
    fetchCameras,
    fetchEvents,
    createCamera,
    setSelectedCamera,
    setViewMode,
    currentCamera
  }
})
