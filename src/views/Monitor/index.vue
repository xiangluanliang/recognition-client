<template>
  <div class="monitor-container">
    <!-- 监控头部控制栏 -->
    <div class="monitor-header">
      <div class="header-left">
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
            <el-icon><Grid /></el-icon>
            网格视图
          </el-button>
          <el-button :type="viewMode === 'single' ? 'primary' : 'default'" @click="viewMode = 'single'">
            <el-icon><Monitor /></el-icon>
            单屏视图
          </el-button>
        </el-button-group>
      </div>
      <div class="header-right">
        <el-select v-model="selectedCamera" placeholder="选择摄像头" style="width: 200px">
          <el-option
            v-for="camera in cameraList"
            :key="camera.id"
            :label="camera.name"
            :value="camera.id"
          />
        </el-select>
        <el-button type="primary" @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
          全屏监控
        </el-button>
      </div>
    </div>

    <!-- 监控视频区域 -->
    <div class="monitor-content">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="video-grid">
        <div
          v-for="camera in cameraList"
          :key="camera.id"
          class="video-item"
          @click="selectCamera(camera.id)"
        >
          <div class="video-wrapper">
            <video
              :src="camera.stream_url"
              :poster="camera.snapshot_url"
              controls
              muted
              class="video-player"
            >
              您的浏览器不支持视频播放
            </video>
            <div class="video-overlay">
              <div class="camera-info">
                <h4>{{ camera.name }}</h4>
                <span :class="['status', camera.status]">
                  {{ camera.status === 'online' ? '在线' : '离线' }}
                </span>
              </div>
              <div class="detection-info" v-if="camera.detections.length > 0">
                <el-tag
                  v-for="detection in camera.detections"
                  :key="detection.type"
                  :type="getDetectionType(detection.level)"
                  size="small"
                >
                  {{ detection.type }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 单屏视图 -->
      <div v-else class="single-view">
        <div class="main-video">
          <video
            v-if="currentCamera"
            :src="currentCamera.stream_url"
            :poster="currentCamera.snapshot_url"
            controls
            autoplay
            muted
            class="main-video-player"
          >
            您的浏览器不支持视频播放
          </video>
          <div v-else class="no-video">
            <el-empty description="请选择摄像头" />
          </div>
        </div>
        
        <!-- 检测结果面板 -->
        <div class="detection-panel">
          <el-card>
            <template #header>
              <span>实时检测结果</span>
            </template>
            <div v-if="currentCamera && currentCamera.detections.length > 0">
              <div
                v-for="detection in currentCamera.detections"
                :key="detection.id"
                class="detection-item"
              >
                <div class="detection-header">
                  <el-tag :type="getDetectionType(detection.level)">
                    {{ detection.type }}
                  </el-tag>
                  <span class="detection-time">{{ detection.time }}</span>
                </div>
                <p class="detection-desc">{{ detection.description }}</p>
                <div class="detection-actions">
                  <el-button size="small" @click="viewDetectionDetail(detection)">
                    查看详情
                  </el-button>
                  <el-button size="small" type="warning" @click="createAlarm(detection)">
                    生成告警
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无检测结果" />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 视图模式
const viewMode = ref<'grid' | 'single'>('grid')
const selectedCamera = ref<number | null>(null)

// 摄像头列表
const cameraList = ref([
  {
    id: 1,
    name: '站台A区-1号摄像头',
    stream_url: '/api/video/stream/1',
    snapshot_url: '/api/video/snapshot/1',
    status: 'online',
    detections: [
      {
        id: 1,
        type: '人员入侵',
        level: 'high',
        description: '检测到人员进入危险区域',
        time: '14:30:25'
      }
    ]
  },
  {
    id: 2,
    name: '候车大厅-2号摄像头',
    stream_url: '/api/video/stream/2',
    snapshot_url: '/api/video/snapshot/2',
    status: 'online',
    detections: [
      {
        id: 2,
        type: '异常行为',
        level: 'medium',
        description: '检测到吸烟行为',
        time: '14:28:15'
      }
    ]
  },
  {
    id: 3,
    name: '安检口-3号摄像头',
    stream_url: '/api/video/stream/3',
    snapshot_url: '/api/video/snapshot/3',
    status: 'offline',
    detections: []
  },
  {
    id: 4,
    name: '出入口-4号摄像头',
    stream_url: '/api/video/stream/4',
    snapshot_url: '/api/video/snapshot/4',
    status: 'online',
    detections: []
  }
])

// 当前选中的摄像头
const currentCamera = computed(() => {
  return cameraList.value.find(camera => camera.id === selectedCamera.value)
})

// 选择摄像头
const selectCamera = (cameraId: number) => {
  selectedCamera.value = cameraId
  if (viewMode.value === 'grid') {
    viewMode.value = 'single'
  }
}

// 获取检测类型样式
const getDetectionType = (level: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || 'info'
}

// 查看检测详情
const viewDetectionDetail = (detection: any) => {
  ElMessage.info('查看检测详情功能开发中...')
}

// 生成告警
const createAlarm = (detection: any) => {
  ElMessage.success('告警已生成')
}

// 全屏监控
const toggleFullscreen = () => {
  ElMessage.info('全屏监控功能开发中...')
}

onMounted(() => {
  // 初始化选择第一个摄像头
  if (cameraList.value.length > 0) {
    selectedCamera.value = cameraList.value[0].id
  }
})
</script>

<style scoped>
.monitor-container {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.monitor-content {
  flex: 1;
  overflow: hidden;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.video-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.video-item:hover {
  transform: translateY(-2px);
}

.video-wrapper {
  position: relative;
  height: 300px;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
  padding: 12px;
  color: white;
}

.camera-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.camera-info h4 {
  margin: 0;
  font-size: 14px;
}

.status.online {
  color: #67C23A;
}

.status.offline {
  color: #F56C6C;
}

.detection-info {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.single-view {
  display: flex;
  gap: 16px;
  height: 100%;
}

.main-video {
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-video {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detection-panel {
  width: 350px;
  flex-shrink: 0;
}

.detection-item {
  padding: 12px;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  margin-bottom: 12px;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detection-time {
  font-size: 12px;
  color: #909399;
}

.detection-desc {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.detection-actions {
  display: flex;
  gap: 8px;
}
</style>
