import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Camera } from "@/types/camera"
import type { EventLog } from '@/types/event'
import { getCameraList, createCamera as apiCreateCamera, updateCamera as apiUpdateCamera } from "@/api/camera"
import { getDetectionEventsByCameraId } from "@/api/event"
import { ElMessage } from "element-plus"

export const useCameraStore = defineStore("camera", () => {
  const cameras = ref<Camera[]>([])
  const selectedCameraId = ref<number | null>(null)
  const eventList = ref<EventLog[]>([])
  const loading = ref(false)
  
  const streamBaseUrl = ref('https://8.152.101.217')

  const fetchCameras = async () => {
    loading.value = true
    try {
      const res = await getCameraList()
      cameras.value = res
      if (res.length > 0 && selectedCameraId.value === null) {
        setSelectedCamera(res[0].id)
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
      const res = await getDetectionEventsByCameraId(selectedCameraId.value);
      eventList.value = res
    } catch (error) {
      console.error("轮询事件失败", error)
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
  
  const updateCameraConfig = async (id: number, config: Partial<Camera>): Promise<boolean> => {
    try {
      await apiUpdateCamera(id, config);
      const index = cameras.value.findIndex(c => c.id === id);
      if (index !== -1) {
        // 更新本地数据以立即反映UI变化
        cameras.value[index] = { ...cameras.value[index], ...config };
      }
      ElMessage.success('摄像头配置更新成功！');
      return true;
    } catch (error) {
      ElMessage.error('配置更新失败！');
      console.error("更新摄像头配置失败:", error);
      return false;
    }
  }

  const setSelectedCamera = (id: number | null) => {
    selectedCameraId.value = id
  }

  const currentCamera = computed(() => {
    return cameras.value.find(c => c.id === selectedCameraId.value)
  })

  return {
    cameras,
    loading,
    selectedCameraId,
    eventList,
    streamBaseUrl,
    fetchCameras,
    fetchEvents,

    createCamera,
    updateCameraConfig,
    setSelectedCamera,
    currentCamera
  }
})