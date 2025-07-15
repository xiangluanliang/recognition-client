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
        <video ref="videoRef" autoplay playsinline class="video"/>

        <!-- 绘图图层 -->
        <canvas
            ref="canvasRef"
            class="overlay-canvas"
            @click="handleClick"
        />
      </div>
    </el-card>
  </div>
  <!-- 操作按钮区域 -->
  <div class="toolbar">
    <el-input
        v-model="safeDistance"
        type="number"
        placeholder="安全距离/m"
        style="width: 120px"
    />
    <el-input
        v-model="safeTime"
        type="number"
        placeholder="安全时间/s"
        style="width: 120px"
    />
    <el-button type="success" @click="startDrawingMode" :disabled="isDrawingMode">开始绘制</el-button>
    <el-button type="primary" @click="handleFinishDrawing">完成绘制</el-button>
    <el-button type="primary" @click="saveRegion" :disabled="points.length < 3">保存区域</el-button>
    <el-button type="danger" @click="clearCanvas">清除</el-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import {getCameraList, getFlow} from "@/api/camera"
import {ElMessage} from "element-plus";
import {postWarningZone} from "@/api/warningZone.ts";

const selectedCameraId = ref<number | null>(null)
const cameraList = ref<{ id: number; name: string }[]>([])
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const safeDistance = ref<number | null>(null)
const safeTime = ref<number | null>(null)

const isDrawingMode = ref(false)
// let points: { x: number; y: number }[] = []

const points = ref<{ x: number; y: number }[]>([])

// 切换摄像头时，获取播放地址
async function handleCameraChange(id: number) {
  selectedCameraId.value = id

  try {
    const res = await getFlow(id)
    const {url} = res.data

    if (videoRef.value) {
      videoRef.value.srcObject = null
      videoRef.value.src = url
      videoRef.value.play().catch(() => {
      })
    }

    resizeCanvasToVideo()
  } catch (err) {
    console.error("获取摄像头流信息失败", err)
  }
}

// 点击画布绘点
function handleClick(e: MouseEvent) {
  if (!isDrawingMode.value) return
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (points.value.length >= 3) {
    const first = points.value[0]
    const distance = Math.hypot(first.x - x, first.y - y)
    if (distance < 10) {
      points.value.push({...first})
      redrawCanvas()
      isDrawingMode.value = false
      return
    }
  }

  points.value.push({x, y})
  redrawCanvas()
}

// 页面加载，初始化摄像头和视频
onMounted(() => {
  loadCameraList()

  navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
    if (videoRef.value) videoRef.value.srcObject = stream
    resizeCanvasToVideo()
  })

  window.addEventListener("resize", resizeCanvasToVideo)
})

// 加载摄像头列表
async function loadCameraList() {
  try {
    cameraList.value = await getCameraList()
  } catch {
    console.error("摄像头列表加载失败")
  }
}

// 调整canvas大小匹配视频尺寸
function resizeCanvasToVideo() {
  if (videoRef.value && canvasRef.value) {
    canvasRef.value.width = videoRef.value.clientWidth
    canvasRef.value.height = videoRef.value.clientHeight
    redrawCanvas()
  }
}

// 开始绘制，重置点
function startDrawingMode() {
  if (!safeDistance.value || safeDistance.value <= 0 || !safeTime.value || safeTime.value <= 0) {
    ElMessage.warning('请设置合理的安全距离和时间')
    return
  }
  isDrawingMode.value = true
  points.value = getConvexHull(points.value)
  redrawCanvas()
}

// 计算凸包，防止多边形自交
function getConvexHull(points: { x: number, y: number }[]) {
  if (points.length < 3) return points.slice()

  const base = points.reduce((res, p) => {
    if (p.y < res.y || (p.y === res.y && p.x < res.x)) return p
    return res
  }, points[0])

  const sorted = points.slice().sort((a, b) => {
    if (a === base) return -1
    if (b === base) return 1
    const angleA = Math.atan2(a.y - base.y, a.x - base.x)
    const angleB = Math.atan2(b.y - base.y, b.x - base.x)
    return angleA - angleB
  })

  const stack: { x: number, y: number }[] = []

  function cross(o: any, a: any, b: any) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  for (const p of sorted) {
    while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) {
      stack.pop()
    }
    stack.push(p)
  }

  return stack
}

// 画布重绘多边形
function redrawCanvas() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext("2d")
  if (!ctx) return

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  if (points.value.length === 0) return

  ctx.beginPath()
  ctx.moveTo(points.value[0].x, points.value[0].y)
  for (let i = 1; i < points.value.length; i++) {
    ctx.lineTo(points.value[i].x, points.value[i].y)
  }
  ctx.closePath()

  ctx.strokeStyle = "red"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = "rgba(255, 0, 0, 0.2)"
  ctx.fill()
}

function handleFinishDrawing() {
  if (points.value.length < 3) {
    ElMessage.warning('至少选三个点才能完成绘制')
    return
  }
  points.value = getConvexHull(points.value)
  redrawCanvas()
  isDrawingMode.value = false
}

// 清除画布和点
function clearCanvas() {
  isDrawingMode.value = false
  points.value = []
  redrawCanvas()
}

async function saveRegion() {
  if (points.value.length < 3) {
    ElMessage.warning("请先绘制完整区域")
    return
  }
  if (!selectedCameraId.value) {
    ElMessage.warning("请选择摄像头")
    return
  }
  if (!safeDistance.value || safeDistance.value <= 0 || !safeTime.value || safeTime.value <= 0) {
    ElMessage.warning("请填写合理的安全距离和安全时间")
    return
  }

  const payload = {
    name: '未命名区域',
    zone_type: 1,
    zone_points: points.value,
    is_active: true,
    camera_id: selectedCameraId.value
  }

  postWarningZone(payload).then(() => {
    ElMessage.success("区域保存成功")
    isDrawingMode.value = false
  }).catch(err => {
    console.error("保存失败", err)
    ElMessage.error("保存失败")
  })
}


</script>

<style scoped>
.area-config {
  padding: 16px;
  text-align: center;
}

.config-content {
  position: relative;
  display: inline-block;
}

.video {
  width: 640px;
  height: 480px;
  background: #000;
}

.overlay-canvas {
  position: absolute;
  top: 56px;
  left: 0;
  width: 640px;
  height: 480px;
  z-index: 2;
  pointer-events: auto;
}

.toolbar {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
</style>
