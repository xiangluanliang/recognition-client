import { defineStore } from "pinia"
import { ref } from "vue"

// 简化的告警项接口
interface AlarmItem {
  id: number
  title: string
  description: string
  level: "high" | "medium" | "low"
  type: string
  location: string
  status: "unprocessed" | "processing" | "processed"
  created_at: string
}

export const useAlarmStore = defineStore("alarm", () => {
  const alarmList = ref<AlarmItem[]>([])
  const unreadCount = ref<number>(5) // 默认未读数量
  const loading = ref<boolean>(false)

  // 模拟获取告警列表
  const fetchAlarmList = async (_params?: any) => {
    loading.value = true
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alarmList.value = [
        {
          id: 1,
          title: "危险区域入侵告警",
          description: "检测到人员进入危险区域",
          level: "high",
          type: "区域入侵",
          location: "站台A区",
          status: "unprocessed",
          created_at: "2024-01-15 14:30:25",
        },
      ]
    } catch (error) {
      console.error("获取告警列表失败:", error)
    } finally {
      loading.value = false
    }
  }

  // 更新告警状态
  const updateAlarm = async (id: number, status: string) => {
    const index = alarmList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      alarmList.value[index].status = status as any
      if (status === "processed") {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  }

  // 添加新告警
  const addAlarm = (alarm: AlarmItem) => {
    alarmList.value.unshift(alarm)
    if (alarm.status === "unprocessed") {
      unreadCount.value++
    }
  }

  return {
    alarmList,
    unreadCount,
    loading,
    fetchAlarmList,
    updateAlarm,
    addAlarm,
  }
})
