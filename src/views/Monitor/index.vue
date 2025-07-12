<template>
  <div class="monitor-container">
    <div class="monitor-header">
      <div class="header-left">
        <el-button-group>
          <el-button :type="monitorStore.viewMode === 'grid' ? 'primary' : 'default'" @click="monitorStore.setViewMode('grid')">
            <el-icon><Grid /></el-icon>
            网格视图
          </el-button>
          <el-button :type="monitorStore.viewMode === 'single' ? 'primary' : 'default'" @click="monitorStore.setViewMode('single')">
            <el-icon><Monitor /></el-icon>
            单屏视图
          </el-button>
        </el-button-group>
      </div>
      <div class="header-right">
        <el-button type="success" @click="addCameraDialogVisible = true">
          <el-icon><Plus /></el-icon>
          添加摄像头
        </el-button>
        <el-select 
          :model-value="monitorStore.selectedCameraId" 
          @change="handleSelectChange"
          placeholder="选择摄像头" 
          style="width: 200px" 
          filterable
        >
          <el-option
            v-for="camera in monitorStore.cameraList"
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

    <div class="monitor-content">
      <div v-if="monitorStore.viewMode === 'grid'" class="video-grid" v-loading="monitorStore.loading">
        <div
          v-for="camera in monitorStore.cameraList"
          :key="camera.id"
          class="video-item"
          @click="selectCamera(camera.id)"
        >
          <div class="video-wrapper">
            <video
              :src="`${monitorStore.streamBaseUrl}${camera.stream_key}`"
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
            </div>
          </div>
        </div>
        <el-empty v-if="!monitorStore.loading && monitorStore.cameraList.length === 0" description="您还没有添加摄像头"></el-empty>
      </div>

      <div v-else class="single-view">
        <div class="main-video">
          <video
            v-if="monitorStore.currentCamera"
            :key="monitorStore.currentCamera.id"
            :src="`${monitorStore.streamBaseUrl}${monitorStore.currentCamera.stream_key}`"
            controls
            autoplay
            muted
            class="main-video-player"
          >
            您的浏览器不支持视频播放
          </video>
          <div v-else class="no-video">
            <el-empty description="请从上方选择一个摄像头" />
          </div>
        </div>
        
        <div class="detection-panel">
          <el-card>
            <template #header>
              <span>实时检测结果</span>
            </template>
            <div v-if="monitorStore.eventList.length > 0">
              <div
                v-for="detection in monitorStore.eventList"
                :key="detection.id"
                class="detection-item"
              >
                <div class="detection-header">
                  <el-tag :type="getDetectionType(detection.level)">
                    {{ detection.event_type }}
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

    <el-dialog v-model="addCameraDialogVisible" title="添加新摄像头" width="500px">
      <el-form :model="newCameraForm" label-width="100px" ref="newCameraFormRef">
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="newCameraForm.name" placeholder="例如：站台A区-1号摄像头"></el-input>
        </el-form-item>
        <el-form-item label="物理地址" prop="location">
          <el-input v-model="newCameraForm.location" placeholder="（可选）"></el-input>
        </el-form-item>
        <el-form-item label="摄像头类型" prop="camera_type">
          <el-input v-model="newCameraForm.camera_type" placeholder="（可选）"></el-input>
        </el-form-item>
        <el-form-item label="推流地址">
          <el-input :value="monitorStore.streamBaseUrl" disabled></el-input>
        </el-form-item>
        <el-form-item label="推流码" prop="stream_key" required>
          <el-input v-model="newCameraForm.stream_key" placeholder="例如：stream1"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCameraDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddNewCamera">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // For navigation
import { useMonitorStore, DetectionEvent } from '@/store/monitor'; // Import the new store
import { ElMessage } from 'element-plus';

const router = useRouter();
const monitorStore = useMonitorStore(); // Initialize the store

// State for the "Add Camera" dialog (this is view-specific, so it's ok to keep it here)
const addCameraDialogVisible = ref(false);
const newCameraForm = ref({
  name: '',
  location: '',
  camera_type: '',
  stream_key: ''
});

// --- Lifecycle Hook ---
onMounted(() => {
  monitorStore.fetchCameras();
});

// --- Component Methods ---
const handleAddNewCamera = async () => {
  if (!newCameraForm.value.name || !newCameraForm.value.stream_key) {
    ElMessage.warning('请填写所有必填项');
    return;
  }
  const success = await monitorStore.createCamera(newCameraForm.value);
  if (success) {
    addCameraDialogVisible.value = false;
    newCameraForm.value = { name: '', location: '', camera_type: '', stream_key: '' }; // Reset form
  }
};

const selectCamera = (cameraId: number) => {
  monitorStore.setSelectedCamera(cameraId);
  monitorStore.setViewMode('single');
};

const handleSelectChange = (cameraId: number) => {
    monitorStore.setSelectedCamera(cameraId);
}

const getDetectionType = (level: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return types[level] || 'info';
};

// --- Placeholder/Navigation Functions ---
const viewDetectionDetail = (detection: DetectionEvent) => {
  router.push({ name: 'BehaviorDetectionRecord', query: { event_id: detection.id, camera_id: monitorStore.selectedCameraId } });
};

const createAlarm = (detection: DetectionEvent) => {
  router.push({ name: 'CreateAlarm', state: { detectionData: detection } });
};

const toggleFullscreen = () => {
  ElMessage.info('全屏监控功能开发中...');
};
</script>

<style scoped>
/* Your existing styles are good. No changes needed here. */
.monitor-container, .monitor-header, .video-grid, .single-view, etc... {
    /* ... all your existing styles ... */
}
</style>