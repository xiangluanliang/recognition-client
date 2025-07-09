import { defineStore } from "pinia"
import { ref } from "vue"
import { getAlarmList } from "@/api/alarm"

export interface AlarmLog {
  id: number
  source_type: string
  source_id: number
  time: string
  method: string
  receiver: string
  result?: string
}

export const useAlarmStore = defineStore("alarm", () => {
  const alarmLogs = ref<AlarmLog[]>([])
  const loading = ref(false)

  const fetchAlarmLogs = async () => {
    loading.value = true
    try {
      const res = await getAlarmList()
      alarmLogs.value = res
    } catch (error) {
      // 你也可以在这里统一处理错误，比如用全局消息组件
      console.error("获取告警记录失败", error)
    } finally {
      loading.value = false
    }
  }

  return {
    alarmLogs,
    loading,
    fetchAlarmLogs,
  }
})
