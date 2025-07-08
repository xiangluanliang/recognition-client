import { ref, onUnmounted } from "vue"
import { useAlarmStore } from "@/store/alarm"
import { ElNotification } from "element-plus"

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const alarmStore = useAlarmStore()

  const connect = () => {
    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        isConnected.value = true
        console.log("WebSocket连接成功")
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (error) {
          console.error("解析WebSocket消息失败:", error)
        }
      }

      ws.value.onclose = () => {
        isConnected.value = false
        console.log("WebSocket连接关闭")
        // 重连逻辑
        setTimeout(connect, 5000)
      }

      ws.value.onerror = (error) => {
        console.error("WebSocket错误:", error)
      }
    } catch (error) {
      console.error("WebSocket连接失败:", error)
    }
  }

  const handleMessage = (data: any) => {
    switch (data.type) {
      case "alarm":
        // 新告警推送
        alarmStore.addAlarm(data.data)
        ElNotification({
          title: "新告警",
          message: data.data.title,
          type: "warning",
          duration: 0,
        })
        break
      case "system":
        // 系统消息
        ElNotification({
          title: "系统通知",
          message: data.message,
          type: "info",
        })
        break
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      isConnected.value = false
    }
  }

  const send = (data: any) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify(data))
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    send,
    isConnected,
  }
}
