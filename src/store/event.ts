import { defineStore } from "pinia"
import { ref } from "vue"
import { getEventList } from "@/api/event"
import { EventLog } from "@/types/event"

export const useEventStore = defineStore("event", () => {
  const eventLogs = ref<EventLog[]>([])
  const loading = ref(false)

  const fetchEventLogs = async () => {
    loading.value = true
    try {
      const res = await getEventList()
      eventLogs.value = res
    } catch (error) {
      console.error("获取事件记录失败", error)
    } finally {
      loading.value = false
    }
  }

  return {
    eventLogs,
    loading,
    fetchEventLogs,
  }
})
