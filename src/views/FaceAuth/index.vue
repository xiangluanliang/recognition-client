<template>
  <div class="face-auth">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>身份认证管理</span>
          <el-switch
            v-model="isRecognizing"
            active-text="开始识别"
            inactive-text="停止识别"
          />
        </div>
      </template>

      <div class="auth-top">
        <div class="camera-box">
          <video ref="videoRef" autoplay playsinline muted></video>
          <canvas ref="canvasRef" style="display: none;"></canvas>
        </div>

        <div class="info-box">
          <p class="info-title">实时识别结果</p>
          <div class="info-content" v-loading="isLoading">
            <div v-if="recognitionResult.length">
              <div v-for="(person, index) in recognitionResult" :key="index" class="result-item" :class="getPersonStatusClass(person)">
                <p><strong>姓名:</strong> {{ person.identity === 'Stranger' ? '陌生人' : person.identity }}</p>
                <p><strong>状态:</strong> {{ getPersonStatusText(person) }}</p>
                <p><strong>相似度:</strong> {{ (1 - person.distance).toFixed(2) }}</p>
              </div>
            </div>
            <el-empty v-else :description="statusText" />
          </div>
        </div>
      </div>

      <div class="auth-bottom">
        <p class="info-title">识别历史记录 (最近10条)</p>
        <el-table :data="historyLog" height="250px" stripe>
          <el-table-column prop="identity" label="识别姓名" />
          <el-table-column prop="statusText" label="状态" />
          <el-table-column prop="confidence" label="置信度" >
             <template #default="{ row }">
              {{ row.confidence.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="timestamp" label="识别时间" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// --- 响应式状态定义 ---
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isRecognizing = ref(false) // 控制是否进行识别的开关
const isLoading = ref(false) // API请求的加载状态
const statusText = ref('等待识别...') // 信息框中的状态文本
const recognitionResult = ref<any[]>([]) // 当前帧的识别结果
const historyLog = ref<any[]>([]) // 识别历史记录
let recognitionInterval: any = null // 定时器句柄

// --- AI Worker API配置 ---
const AI_WORKER_URL = 'http://127.0.0.1:5000/ai/recognize-frame'

// --- 核心逻辑 ---

// 1. 启动/停止识别的逻辑
watch(isRecognizing, (newValue) => {
  if (newValue) {
    startRecognition()
  } else {
    stopRecognition()
  }
})

// 2. 开始识别
const startRecognition = () => {
  if (recognitionInterval) return; // 防止重复启动
  ElMessage.success('识别已开始')
  // 每1.5秒识别一次
  recognitionInterval = setInterval(captureAndRecognize, 800)
}

// 3. 停止识别
const stopRecognition = () => {
  if (recognitionInterval) {
    clearInterval(recognitionInterval)
    recognitionInterval = null
    isLoading.value = false
    statusText.value = '识别已停止'
    ElMessage.info('识别已停止')
  }
}

// 4. 截图并发送识别请求
const captureAndRecognize = async () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value

  // 将canvas尺寸设置为视频的实际尺寸
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 在canvas上绘制当前视频帧
  const context = canvas.getContext('2d')
  if (!context) return
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // 将canvas内容转换为Base64编码的图片
  const imageDataUrl = canvas.toDataURL('image/jpeg')

  // 发送API请求
  try {
    isLoading.value = true
    const response = await axios.post(AI_WORKER_URL, {
      image_data: imageDataUrl
    })
    
    // 处理后端返回的数据
    handleApiResponse(response.data)

  } catch (error) {
    console.error("识别请求失败:", error)
    statusText.value = '请求后端失败'
    recognitionResult.value = []
  } finally {
    isLoading.value = false
  }
}

// 5. 处理API返回结果
const handleApiResponse = (data: any) => {
  if (data.status === 'error') {
    statusText.value = data.message
    recognitionResult.value = []
    return
  }

  // 更新当前识别结果
  recognitionResult.value = data.persons || []
  if (!recognitionResult.value.length) {
    statusText.value = '未检测到人脸'
  }

  // 更新历史记录
  if (recognitionResult.value.length) {
    const timestamp = new Date().toLocaleTimeString()
    recognitionResult.value.forEach(person => {
      historyLog.value.unshift({
        ...person,
        statusText: getPersonStatusText(person),
        timestamp
      })
    })
    // 保持最多10条记录
    if (historyLog.value.length > 10) {
      historyLog.value.pop()
    }
  }
}


// --- 辅助函数 ---
const getPersonStatusText = (person: any) => {
  if (person.identity === 'Stranger') return '陌生人'
  if (person.person_state === 1) return '危险人物'
  return '已知人员'
}

const getPersonStatusClass = (person: any) => {
  if (person.identity === 'Stranger') return 'status-stranger'
  if (person.person_state === 1) return 'status-danger'
  return 'status-known'
}

// --- 生命周期函数 ---
onMounted(() => {
  // 启用摄像头
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.value) {
          videoRef.value.srcObject = stream
        }
      })
      .catch((err) => {
        console.error("无法访问摄像头:", err)
        ElMessage.error('无法访问摄像头，请检查设备和浏览器权限！')
        statusText.value = '摄像头访问失败'
      })
  } else {
    ElMessage.error('您的浏览器不支持摄像头访问功能！')
    statusText.value = '浏览器不支持'
  }
})

onUnmounted(() => {
  // 组件销毁时，停止识别并释放摄像头资源
  stopRecognition()
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.face-auth {
  padding: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.auth-top {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.camera-box,
.info-box {
  flex: 1;
  min-height: 320px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}
video {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background: #000;
}
.info-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 16px;
  color: #303133;
}
.info-content {
  flex-grow: 1;
}
.result-item {
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  border-left: 4px solid;
}
.status-known {
  border-color: #67c23a;
  background-color: #f0f9eb;
}
.status-stranger {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}
.status-danger {
  border-color: #f56c6c;
  background-color: #fef0f0;
}
.auth-bottom {
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>