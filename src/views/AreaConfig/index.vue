<template>
  <div class="area-config">
    <el-card>
      <template #header>
        <span>危险区域配置</span>
      </template>

      <!-- 摄像头选择框 -->
      <el-form style="margin-bottom: 16px;">
        <el-form-item label="选择摄像头">
          <el-select v-model="selectedCameraId" placeholder="请选择摄像头" @change="handleCameraChange">
            <el-option
              v-for="camera in cameraList"
              :key="camera.id"
              :label="camera.name"
              :value="camera.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="config-content">
        <!-- 摄像头视频预览 -->
        <video ref="videoRef" autoplay playsinline class="video" />

        <!-- 绘图图层 -->
        <canvas
          ref="canvasRef"
          class="overlay-canvas"
          @mousedown="startDraw"
          @mousemove="draw"
          @mouseup="endDraw"
        />

        <!-- 操作按钮区域 -->
        <div class="toolbar">
          <el-button type="success" @click="startDrawingMode" :disabled="isDrawingMode">开始绘制</el-button>
          <el-button type="primary" @click="saveRegion" :disabled="!points.length">保存区域</el-button>
          <el-button type="danger" @click="clearCanvas">清除</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getFlow, fetchMyCameras } from "@/api/camera"

const selectedCameraId = ref<number | null>(null)
const cameraList = ref<{ id: number; name: string }[]>([])
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let isDrawing = false
const isDrawingMode = ref(false)
let points: { x: number; y: number }[] = []

// 切换摄像头时，获取其播放地址
async function handleCameraChange(id: number) {
  selectedCameraId.value = id

  try {
    const res = await getFlow(id)
    const { url } = res.data
    console.log("摄像头流信息：", res.data)

    if (videoRef.value) {
      videoRef.value.srcObject = null
      videoRef.value.src = url
      videoRef.value.play().catch((e) => {
        console.warn("播放失败：", e)
      })
    }

    resizeCanvasToVideo()
  } catch (err) {
    console.error("获取摄像头流信息失败", err)
  }
}

// 页面加载时，加载摄像头列表 & 使用本地摄像头初始化
onMounted(() => {
  loadCameraList()

  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    resizeCanvasToVideo()
  })

  window.addEventListener("resize", resizeCanvasToVideo)
})

// 从后端获取当前用户可用的摄像头列表
async function loadCameraList() {
  try {
    const data = await fetchMyCameras()
    cameraList.value = data
  } catch (err) {
    console.error("摄像头列表加载失败", err)
  }
}

// 同步 canvas 尺寸到视频
function resizeCanvasToVideo() {
  if (videoRef.value && canvasRef.value) {
    canvasRef.value.width = videoRef.value.clientWidth
    canvasRef.value.height = videoRef.value.clientHeight
    redrawCanvas()
  }
}

// 开始绘图
function startDrawingMode() {
  isDrawingMode.value = true
  points = []
  redrawCanvas()
}

// 鼠标事件
function startDraw(e: MouseEvent) {
  if (!isDrawingMode.value) return
  isDrawing = true
  points = []
  addPoint(e)
}

function draw(e: MouseEvent) {
  if (!isDrawing || !isDrawingMode.value || !canvasRef.value) return
  addPoint(e)
  redrawCanvas()
}

function endDraw() {
  isDrawing = false
}

function addPoint(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  points.push({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  })
}

// 重绘区域
function redrawCanvas() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext("2d")
  if (!ctx) return

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  if (points.length === 0) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }

  ctx.closePath()
  ctx.strokeStyle = "red"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = "rgba(255, 0, 0, 0.2)"
  ctx.fill()
}

// 清除
function clearCanvas() {
  isDrawingMode.value = false
  points = []
  redrawCanvas()
}

// 保存区域点位（可扩展成发送后端）
function saveRegion() {
  console.log("✅ 区域已保存，点位坐标：", points)
  isDrawingMode.value = false
}
</script>


<style scoped>
.area-config {
  padding: 16px;
}

.config-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video {
  width: 640px;
  height: 480px;
  background: #000;
}

.overlay-canvas {
  position: absolute;
  top: 56px; /* header + margin */
  left: 0;
  width: 640px;
  height: 480px;
  z-index: 2;
  pointer-events: auto;
}

.toolbar {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
