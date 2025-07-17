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
        <el-select v-model="selectedMode" placeholder="检测模式" style="width: 200px" filterable clearable>
          <el-option
              v-for="item in detectionModeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>

      </div>
    </div>

    <div class="monitor-content">
      <div v-if="viewMode === 'grid'" class="video-grid" v-loading="loading">
        <div v-for="camera in cameras" :key="camera.id" class="video-item" @click="selectAndSwitchView(camera.id)">
          <div class="video-wrapper">
            <img
                v-if="selectedMode !== 'none'"
                :src="`${streamBaseUrl}ai/${selectedMode}/${camera.password}/${camera.id}`"
                class="video-player"
            />
            <div class="video-overlay">
              <div class="camera-info">
                <h4>{{ camera.name }}</h4>
                <el-tag size="small" type="success">在线</el-tag>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && cameras.length === 0" description="您还没有添加摄像头"></el-empty>
      </div>

      <div v-else class="single-view">
        <div class="main-video">
          <video
              v-if="currentCamera && selectedMode !== 'none'"
              :key="currentCamera.id"
              :src="videoStreamUrl"
              controls autoplay muted
              class="main-video-player"
          >
            您的浏览器不支持视频播放
          </video>

          <div v-else class="no-video">
            <el-empty description="请从上方或网格视图中选择一个摄像头"/>
          </div>
        </div>

        <div class="detection-panel">
          <el-card>
            <template #header>
              <span>实时检测结果</span>
            </template>
            <div class="event-list-container">
              <el-timeline v-if="eventList.length > 0">
                <el-timeline-item
                    v-for="event in eventList"
                    :key="event.id"
                    :timestamp="event.time"
                    :type="getDetectionType(event.confidence)"
                >
                  <strong>{{ event.event_type }}</strong>
                  <p>置信度：{{ event.confidence.toFixed(2) }}</p>
                  <div class="detection-actions">
                    <el-button size="small" @click="viewDetectionDetail(event)">查看详情</el-button>
                    <el-button size="small" type="warning" @click="createAlarm(event)">生成告警</el-button>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无检测结果"/>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <el-dialog v-model="addCameraDialogVisible" title="添加新摄像头" width="500px" @closed="resetForm">
      <el-form :model="newCameraForm" label-width="100px" ref="cameraFormRef">
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="newCameraForm.name"/>
        </el-form-item>
        <el-form-item label="物理地址" prop="location">
          <el-input v-model="newCameraForm.location"/>
        </el-form-item>
        <el-form-item label="摄像头类型" prop="camera_type">
          <el-input v-model="newCameraForm.camera_type"/>
        </el-form-item>
        <el-form-item label="推流地址">
          <el-input
              :value="`${streamBaseUrl}${newCameraForm.stream_key}`"
              disabled
              readonly
          />
        </el-form-item>

        <el-form-item label="推流码" prop="stream_key" required>
          <el-input v-model="newCameraForm.stream_key"/>
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
import {computed, onMounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {useCameraStore} from '@/store/camera';
import {createCamera} from '@/api/camera';
import type {EventLog} from '@/types/event';
import {ElMessage} from 'element-plus';
import {Grid, Monitor, Plus} from "@element-plus/icons-vue";

const router = useRouter();
const cameraStore = useCameraStore();
const {cameras, loading, fetchCameras} = cameraStore;

const streamBaseUrl = 'https://8.152.101.217:5000/';
const viewMode = ref<'grid' | 'single'>('grid');
const selectedCameraId = ref<number | null>(null);
const currentCamera = computed(() => cameras.value.find(c => c.id === selectedCameraId.value));
const eventList = ref<EventLog[]>([]);

const addCameraDialogVisible = ref(false);
const isSubmitting = ref(false);
const newCameraForm = ref({name: '', location: '', camera_type: '', stream_key: ''});


// 👇功能选择相关
const selectedMode = ref<'none' | 'abnormal_detection'>('abnormal_detection');

const detectionModeOptions = [
  {label: '无', value: 'none'},
  {label: '目标检测', value: 'abnormal_detection'},
];

onMounted(() => {
  fetchCameras();
});

const handleCameraSelect = (id: number) => {
  selectedCameraId.value = id;
  viewMode.value = 'single';
};

const setViewMode = (mode: 'grid' | 'single') => {
  viewMode.value = mode;
};

const videoStreamUrl = computed(() => {
  if (!selectedMode.value || !currentCamera.value || !selectedCameraId.value) return '';
  return `${streamBaseUrl}${selectedMode.value}/${currentCamera.value.stream_key}/${selectedCameraId.value}`;
});

const selectAndSwitchView = (id: number) => {
  selectedCameraId.value = id;
  setViewMode('single');
};

watch([selectedMode, selectedCameraId], ([mode, camId]) => {
  if (mode && camId) {
    // fetchEvents(camId);
  } else {
    eventList.value = [];
  }
});

const handleAddNewCamera = async () => {
  if (!newCameraForm.value.name || !newCameraForm.value.stream_key) {
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
      url: `${streamBaseUrl}stream/${newCameraForm.value.stream_key}`,
      password: newCameraForm.value.stream_key,
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
  newCameraForm.value = {name: '', location: '', camera_type: '', stream_key: ''};
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
/* 样式部分保持不变 */
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
  object-fit: cover;
  background-color: #000;
  /* Add a black background for loading */
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
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

.detection-actions {
  display: flex;
  gap: 8px;
}

.header-left,
.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.video-wrapper,
.main-video {
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-player,
.main-video-player {
  width: 100%;
  height: 100%;
  display: block;
}

.video-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 8px;
  color: white;
}

.camera-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.single-view {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 16px;
  height: 100%;
}

.detection-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detection-panel .el-card :deep() {
  flex: 1;
  overflow-y: auto;
}

.detection-actions {
  margin-top: 8px;
}

.button-group {
  display: flex;
  gap: 8px; /* 按钮间距 */
}

</style>