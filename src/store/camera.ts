// store/camera.ts
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Camera } from "@/types/camera"
import { getCameraList, createCamera as apiCreateCamera } from "@/api/camera"
import { ElMessage } from "element-plus"

export const useCameraStore = defineStore("camera", () => {
  const cameras = ref<Camera[]>([])
  const selectedCameraId = ref<number | null>(null)
  const loading = ref(false)
  
  const streamBaseUrl = ref('https://8.152.101.217')

  const fetchCameras = async () => {
    loading.value = true
    try {
      const res = await getCameraList()
      cameras.value = res
      // 默认选中第一个摄像头，但不主动获取事件
      if (res.length > 0 && selectedCameraId.value === null) {
        selectedCameraId.value = res[0].id
      }
    } catch (error) {
      console.error("获取摄像头列表失败", error)
      ElMessage.error('获取摄像头失败')
    } finally {
      loading.value = false
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
    // 暂时不获取事件
    // fetchEvents() 
  }

  // 使用 computed 属性来获取当前选中的摄像头对象
  const currentCamera = computed(() => {
    return cameras.value.find(c => c.id === selectedCameraId.value)
  })

  return {
    cameras,
    loading,
    selectedCameraId,
    streamBaseUrl, // <-- 暴露给组件使用
    fetchCameras,
    createCamera,
    setSelectedCamera,
    currentCamera
  }
})