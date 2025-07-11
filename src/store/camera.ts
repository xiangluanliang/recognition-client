import { defineStore } from "pinia"
import { ref } from "vue"
import type { Camera } from "@/types/camera"
import { getCameraList } from "@/api/camera"

export const useCameraStore = defineStore("camera", () => {
  const cameras = ref<Camera[]>([])
  const loading = ref(false)

  const fetchCameras = async () => {
    loading.value = true
    try {
      const res = await getCameraList()
      cameras.value = res
    } catch (error) {
      console.error("获取摄像头列表失败", error)
    } finally {
      loading.value = false
    }
  }

  return {
    cameras,
    loading,
    fetchCameras,
  }
})
