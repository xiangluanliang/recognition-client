<template>
  <div class="monitor-container">
    <div class="monitor-header">
      <div class="header-left">
        <div class="button-group">
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="setViewMode('grid')">
            <el-icon><Grid/></el-icon>网格视图
          </el-button>
          <el-button :type="viewMode === 'single' ? 'primary' : 'default'" @click="setViewMode('single')">
            <el-icon><Monitor/></el-icon>单屏视图
          </el-button>
        </div>
      </div>
      <div class="header-right">
        <el-button type="success" @click="addCameraDialogVisible = true"><el-icon><Plus/></el-icon>添加摄像头</el-button>
        <el-select v-model="selectedCameraId" @change="handleCameraSelect" placeholder="快速选择摄像头" style="width: 200px" filterable clearable>
          <el-option v-for="camera in cameras" :key="camera.id" :label="camera.name" :value="camera.id"/>
        </el-select>
        <el-select v-model="selectedMode" placeholder="检测模式" style="width: 200px" filterable>
          <el-option v-for="item in detectionModeOptions" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </div>
    </div>

    <div class="monitor-content">
      <div v-if="viewMode === 'grid'" class="video-grid" v-loading="loading">
        <div v-for="camera in cameras" :key="camera.id" class="video-item" @click="selectAndSwitchView(camera.id)">
          <div class="video-wrapper">
            <img v-if="cameraStatus[camera.id] === 'online'" :src="buildStreamUrl(camera)" class="video-player"/>
            <div v-else-if="cameraStatus[camera.id] === 'loading'" class="status-overlay">
              <el-icon class="is-loading" size="24"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else class="status-overlay offline">
              <el-icon size="24"><CircleClose /></el-icon>
              <span>视频流离线</span>
            </div>
            <div class="video-overlay">
              <div class="camera-info">
                <h4>{{ camera.name }}</h4>
                <el-tag size="small" :type="cameraStatus[camera.id] === 'online' ? 'success' : 'info'">
                  {{ cameraStatus[camera.id] || '未知' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && cameras.length === 0" description="您还没有添加摄像头"></el-empty>
      </div>

      <div v-else class="single-view">
        <div class="main-video">
          <img v-if="currentCamera && selectedMode !== 'none'" :key="videoStreamUrl" :src="videoStreamUrl" class="main-video-player"/>
          <div v-else class="no-video">
            <el-empty description="请从上方或网格视图中选择一个摄像头"/>
          </div>
        </div>
        <div class="detection-panel">
          <el-card>
            <template #header><span>事件日志 (已暂停)</span></template>
            <el-empty description="事件日志功能已暂停"/>
          </el-card>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useCameraStore } from '@/store/camera';
import { createCamera } from '@/api/camera';
import type { Camera } from '@/types/camera';
import { ElMessage } from 'element-plus';
import { Grid, Monitor, Plus, Loading, CircleClose } from "@element-plus/icons-vue";

const router = useRouter();
const cameraStore = useCameraStore();
// 使用 toRefs 保持响应性
const { cameras, loading, streamBaseUrl, currentCamera } = toRefs(cameraStore);
const { fetchCameras, setSelectedCamera } = cameraStore;

// ✅ 修改点 1: 默认视图改为 'single'
const viewMode = ref<'grid' | 'single'>('single');
const selectedCameraId = ref<number | null>(null);
const cameraStatus = ref<Record<number, 'loading' | 'online' | 'offline'>>({});

const addCameraDialogVisible = ref(false);
const isSubmitting = ref(false);
const newCameraForm = ref({ name: '', location: '', camera_type: '', password: '' });

const selectedMode = ref<'none' | 'abnormal_detection'>('abnormal_detection');
const detectionModeOptions = [
  { label: '无', value: 'none' },
  { label: '异常行为检测', value: 'abnormal_detection' },
];

onMounted(async () => {
  await fetchCameras();
  // 从 store 初始化 selectedCameraId
  selectedCameraId.value = cameraStore.selectedCameraId;
});

// ✅ 修改点 2: 统一的、正确的 URL 构建函数
const buildStreamUrl = (camera: Camera) => {
  if (!selectedMode.value || selectedMode.value === 'none' || !camera) return '';
  // 根据 Nginx 配置，路径必须包含 /stream/
  return `${streamBaseUrl.value}/stream/${selectedMode.value}/${camera.password}/${camera.id}`;
}

const videoStreamUrl = computed(() => {
  if (!currentCamera.value) return '';
  return buildStreamUrl(currentCamera.value);
});

// ✅ 修改点 3: 异步检查摄像头在线状态的函数
const checkStreamStatus = (camera: Camera) => {
  const url = buildStreamUrl(camera);
  if (!url) {
    cameraStatus.value[camera.id] = 'offline';
    return;
  }

  cameraStatus.value[camera.id] = 'loading';
  const img = new Image();
  
  const timeout = setTimeout(() => {
    img.onload = img.onerror = null;
    if (cameraStatus.value[camera.id] === 'loading') {
       cameraStatus.value[camera.id] = 'offline';
    }
  }, 5000); // 5秒超时

  img.onload = () => {
    clearTimeout(timeout);
    cameraStatus.value[camera.id] = 'online';
  };
  img.onerror = () => {
    clearTimeout(timeout);
    cameraStatus.value[camera.id] = 'offline';
  };
  img.src = url;
};

// ✅ 修改点 4: 仅在切换到网格视图时，才检查所有摄像头状态
watch(viewMode, (newMode) => {
  if (newMode === 'grid' && cameras.value.length > 0) {
    cameraStatus.value = {}; // 重置状态
    cameras.value.forEach(cam => checkStreamStatus(cam));
  }
});

const handleCameraSelect = (id: number | null) => {
  if (id === null) {
      selectedCameraId.value = null;
      setSelectedCamera(null);
      return;
  }
  selectedCameraId.value = id;
  setSelectedCamera(id);
  setViewMode('single');
};

const setViewMode = (mode: 'grid' | 'single') => {
  viewMode.value = mode;
};

const selectAndSwitchView = (id: number) => {
  selectedCameraId.value = id;
  setSelectedCamera(id);
  setViewMode('single');
};

const handleAddNewCamera = async () => {
  if (!newCameraForm.value.name || !newCameraForm.value.password) {
    ElMessage.warning('请填写名称和推流码');
    return;
  }
  isSubmitting.value = true;
  try {
    // url现在写死了，如果要改就这里
    await createCamera({
      name: newCameraForm.value.name,
      location: newCameraForm.value.location,
      camera_type: newCameraForm.value.camera_type,
      is_active: true,
      url: `${streamBaseUrl}stream/${newCameraForm.value.password}`,
      password: newCameraForm.value.password,
    });
    ElMessage.success('摄像头添加成功！');
    addCameraDialogVisible.value = false;
    resetForm();
    await fetchCameras();
  } catch (e) {
    ElMessage.error('添加失败，请检查表单输入');
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  newCameraForm.value = {name: '', location: '', camera_type: '', password: ''};
};

const getDetectionType = (confidence: number) => {
  if (confidence >= 0.9) return 'danger';
  if (confidence >= 0.6) return 'warning';
  return 'primary';
};

const viewDetectionDetail = (detection: EventLog) => {
  router.push({name: 'BehaviorDetectionRecord', query: {event_id: detection.id}});
};

const createAlarm = (detection: EventLog) => {
  localStorage.setItem('alarm_event', JSON.stringify(detection));
  router.push({name: 'CreateAlarm'});
};
</script>

<style scoped>
.status-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #888;
  background-color: #f5f7fa;
}
.status-overlay.offline {
  color: #F56C6C;
}
.status-overlay .el-icon {
  margin-bottom: 8px;
}
.monitor-container {
  height: calc(100vh - 90px);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.monitor-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #888;
  background-color: #f5f7fa;
}
.status-overlay.offline {
  color: #F56C6C;
}
.status-overlay .el-icon {
  margin-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
}

</style>