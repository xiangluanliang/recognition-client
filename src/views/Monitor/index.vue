<template>
  <div class="monitor-container">
    <div class="monitor-header">
      <div class="header-left">
        <div class="button-group">
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="setViewMode('grid')">
            <el-icon>
              <Grid/>
            </el-icon>
            网格视图
          </el-button>
          <el-button :type="viewMode === 'single' ? 'primary' : 'default'" @click="setViewMode('single')">
            <el-icon>
              <Monitor/>
            </el-icon>
            单屏视图
          </el-button>
        </div>
      </div>
      <div class="header-right">
        <el-button type="success" @click="addCameraDialogVisible = true">
          <el-icon>
            <Plus/>
          </el-icon>
          添加摄像头
        </el-button>
        <el-select v-model="selectedCameraId" @change="handleCameraSelect" placeholder="快速选择摄像头"
                   style="width: 200px" filterable clearable>
          <el-option v-for="camera in cameras" :key="camera.id" :label="camera.name" :value="camera.id"/>
        </el-select>
      </div>
    </div>

    <div class="monitor-content">
      <div v-if="viewMode === 'grid'" class="video-grid" v-loading="loading">
        <div v-for="camera in cameras" :key="camera.id" class="video-item">
          <div class="video-wrapper" @click="selectAndSwitchView(camera.id)">
            <img
              v-if="cameraStatus[camera.id] === 'online'"
              :src="buildStreamUrl(camera)"
              class="video-player event-image"
              alt="在线视频"
            />
            <div v-else-if="cameraStatus[camera.id] === 'loading'" class="status-overlay">
              <el-icon class="is-loading" size="24">
                <Loading/>
              </el-icon>
              <span>加载中...</span>
            </div>
            <div v-else class="status-overlay offline">
              <el-icon size="24">
                <CircleClose/>
              </el-icon>
              <span>视频流离线</span>
            </div>
          </div>
          <div class="video-overlay">
            <div class="camera-info">
              <h4>{{ camera.name }}</h4>
              <el-button type="primary" :icon="Setting" circle size="small" @click.stop="openConfigDialog(camera)"/>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && cameras.length === 0" description="您还没有添加摄像头"></el-empty>
      </div>

      <div v-else class="single-view two-column-view">
        <div class="left-panel">
          <div class="main-video">
            <img v-if="currentCamera" :key="videoStreamUrl" :src="videoStreamUrl" class="main-video-player" alt="主监控画面" />
            <div class="no-video" v-else>
              <el-empty description="请从上方或网格视图中选择一个摄像头" />
            </div>
          </div>
        </div>
        <div class="right-panel">
          <div class="detection-panel">
            <el-card>
              <template #header>
                <div class="panel-header">
                  <span>实时事件日志</span>
                  <el-button v-if="currentCamera" type="primary" :icon="Setting" circle @click="openConfigDialog(currentCamera)" />
                </div>
              </template>
              <div class="event-list-container">
                <el-timeline v-if="eventList && eventList.length > 0">
                  <el-timeline-item
                    v-for="event in eventList"
                    :key="event.id"
                    :timestamp="new Date(event.time).toLocaleString()"
                    type="primary"
                  >
                    <strong>{{ event.event_type }}</strong>
                    <p>置信度：{{ event.confidence ? event.confidence.toFixed(2) : 'N/A' }}</p>
                  </el-timeline-item>
                </el-timeline>
                <el-empty v-else description="暂无检测结果" />
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="configDialogVisible" title="摄像头AI功能配置" width="500px" @closed="editingCamera = null">
      <div v-if="editingCamera">
        <p>正在为 <strong>{{ editingCamera.name }}</strong> 配置功能：</p>
        <el-form label-position="top">
          <el-form-item label="启用的AI检测功能">
            <el-checkbox-group v-model="editingCamera.active_detectors">
              <el-checkbox v-for="detector in allDetectorOptions" :key="detector.value" :label="detector.value" border>
                {{ detector.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveConfig" :loading="isSubmitting">保存配置</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="addCameraDialogVisible" title="添加新摄像头" width="500px">
      <el-form :model="newCameraForm" label-width="100px">
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="newCameraForm.name"/>
        </el-form-item>
        <el-form-item label="推流码" prop="stream_key" required>
          <el-input v-model="newCameraForm.stream_key"/>
        </el-form-item>
        <el-form-item label="物理地址" prop="location">
          <el-input v-model="newCameraForm.location"/>
        </el-form-item>
        <el-form-item label="摄像头类型" prop="camera_type">
          <el-input v-model="newCameraForm.camera_type"/>
        </el-form-item>
        <el-form-item label="启用的AI检测功能">
          <el-checkbox-group v-model="newCameraForm.active_detectors">
            <el-checkbox v-for="detector in allDetectorOptions" :key="detector.value" :label="detector.value" border>
              {{ detector.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCameraDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddNewCamera" :loading="isSubmitting">确认添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onBeforeUnmount, ref, watch, toRefs} from 'vue';
import {useCameraStore} from '@/store/camera';
import type {Camera} from '@/types/camera';
import {ElMessage} from 'element-plus';
import {Grid, Monitor, Plus, Loading, CircleClose, Setting} from "@element-plus/icons-vue";
import { reactive } from 'vue';

// --- 状态管理 ---
const cameraStore = useCameraStore();
// 使用 toRefs 从 store 中解构出状态，保持响应性
const {cameras, loading, streamBaseUrl, currentCamera, eventList} = toRefs(cameraStore);
// 从 store 中解构出方法
const {fetchCameras, setSelectedCamera, fetchEvents, updateCameraConfig} = cameraStore;

// --- 本地UI状态 ---
const viewMode = ref<'grid' | 'single'>('single'); // 默认单屏视图
const selectedCameraId = ref<number | null>(null);
const cameraStatus = ref<Record<number, 'loading' | 'online' | 'offline'>>({});

// “添加摄像头”对话框状态
const addCameraDialogVisible = ref(false);
const isSubmitting = ref(false);
const newCameraForm = ref({name: '', location: '', camera_type: '', stream_key: '',active_detectors: [] as string[],});

// “配置AI功能”对话框状态
const configDialogVisible = ref(false);
const editingCamera = ref<Camera | null>(null);
const allDetectorOptions = [
  {label: '摔倒检测', value: 'fall_detection'},
  {label: '打架冲突检测', value: 'fight_detection'},
  {label: '区域入侵检测', value: 'intrusion_detection'},
];

// --- 定时器与生命周期 ---
let eventPollingTimer: number | null = null;

onMounted(async () => {
  await fetchCameras();
  selectedCameraId.value = cameraStore.selectedCameraId;
  // 首次加载和后续的轮询都在 watch 中统一处理，避免重复调用
});

onBeforeUnmount(() => {
  stopEventPolling(); // 组件销毁时，清理计时器，防止内存泄漏
});

// --- 核心逻辑 ---


// 构建视频流URL
const buildStreamUrl = (camera: Camera) => {
  if (!camera || !camera.password) return '';
  return `${streamBaseUrl.value}/stream/cameras/${camera.id}`;
}

// 单屏视图的URL计算属性
const videoStreamUrl = computed(() => {
  if (!currentCamera.value) return '';
  return buildStreamUrl(currentCamera.value);
});

// 异步检查摄像头在线状态
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

// 启动事件轮询
const startEventPolling = () => {
  stopEventPolling(); // 先停止旧的，防止重复
  if (selectedCameraId.value) {
    eventPollingTimer = window.setInterval(() => {
      fetchEvents();
    }, 10000); // 每10秒轮询一次
  }
};

// 停止事件轮询
const stopEventPolling = () => {
  if (eventPollingTimer) {
    clearInterval(eventPollingTimer);
    eventPollingTimer = null;
  }
};

// --- 监听器 ---

// 监听摄像头ID变化，以触发事件获取和轮询
watch(selectedCameraId, (newId) => {
  if (newId) {
    fetchEvents();       // 立即获取一次事件
    startEventPolling(); // 开始/重启轮询
  } else {
    stopEventPolling();  // 如果没有摄像头被选中，则停止轮询
  }
}, {immediate: true}); // immediate: true 确保组件挂载后立即执行一次

// 监听视图模式变化，仅在进入网格视图时检查所有摄像头状态
watch(viewMode, (newMode) => {
  if (newMode === 'grid' && cameras.value.length > 0) {
    cameraStatus.value = {};
    cameras.value.forEach(cam => checkStreamStatus(cam));
  }
});


// --- 事件处理函数 ---

const setViewMode = (mode: 'grid' | 'single') => {
  viewMode.value = mode;
};

const handleCameraSelect = (id: number | null) => {
  selectedCameraId.value = id;
  setSelectedCamera(id);
  if (id) {
    setViewMode('single');
  }
};

const selectAndSwitchView = (id: number) => {
  selectedCameraId.value = id;
  setSelectedCamera(id);
  setViewMode('single');
};

const openConfigDialog = (camera: Camera) => {
  editingCamera.value = reactive(JSON.parse(JSON.stringify(camera)));
  configDialogVisible.value = true;
};

const handleSaveConfig = async () => {
  if (!editingCamera.value) return;
  isSubmitting.value = true;
  const success = await updateCameraConfig(editingCamera.value.id, {
    active_detectors: editingCamera.value.active_detectors
  });
  if (success) {
    configDialogVisible.value = false;
  }
  isSubmitting.value = false;
};

const handleAddNewCamera = async () => {
  if (!newCameraForm.value.name || !newCameraForm.value.stream_key) {
    ElMessage.warning('请填写名称和推流码');
    return;
  }
  isSubmitting.value = true;
  try {
    const data = { // 使用 store 的 action
      name: newCameraForm.value.name,
      location: newCameraForm.value.location === '' ? null : newCameraForm.value.location,
      camera_type: newCameraForm.value.camera_type === '' ? null : newCameraForm.value.camera_type,
      is_active: true,
      // URL现在由后端或构建逻辑处理，这里可以不传或传空
      password: newCameraForm.value.stream_key, // 对应后端的 password/stream_key
      active_detectors: newCameraForm.value.active_detectors,
    };
    console.log(data)
    const success = await cameraStore.createCamera(data);
    if (success) {
      ElMessage.success('摄像头添加成功！');
      addCameraDialogVisible.value = false;
    }
  } catch (e) {
    // store 中已有错误提示，这里可以不再重复
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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

.two-column-view {
  display: flex;
  height: 100%;
  gap: 16px;
}

.left-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  min-width: 0;
  overflow: hidden;
}

.main-video-player {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.right-panel {
  width: 400px;
  flex-shrink: 0;
  overflow-y: auto;
}


</style>