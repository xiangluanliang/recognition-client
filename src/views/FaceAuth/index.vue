<template>
  <div class="face-auth">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>身份认证管理</span>
          <el-switch
            v-model="isRecognizing"
            @change="handleRecognitionToggle"
            active-text="开始识别"
            inactive-text="停止识别"
          />
        </div>
      </template>

      <div class="auth-top">
        <div class="camera-box">
          <img v-if="processedImage" :src="processedImage" alt="AI 处理后的视频流" class="video-stream-img" />
          <video v-else ref="videoRef" autoplay playsinline muted></video>
        </div>

        <div class="info-box">
          <p class="info-title">实时识别结果</p>
          <div class="info-content" v-loading="isLoading">
            <div v-if="recognitionResult.length > 0">
              <div v-for="(person, index) in recognitionResult" :key="index" class="result-item" :class="getPersonStatusClass(person)">
                <p><strong>姓名:</strong> {{ person.identity === 'Stranger' ? '陌生人' : person.identity }}</p>
                <p><strong>状态:</strong> {{ getPersonStatusText(person) }}</p>
                <p><strong>相似度:</strong> {{ person.identity === 'Stranger' ? 'N/A' : (1 - person.distance).toFixed(2) }}</p>
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useFaceAuthStore } from '@/store/faceAuth';
import { ElMessage } from 'element-plus';

const faceAuthStore = useFaceAuthStore();
const { startRecognition, stopRecognition, stopRecognitionLoop, clearResults, getPersonStatusText } = faceAuthStore;
const { isLoading, statusText, recognitionResult, historyLog, processedImage } = storeToRefs(faceAuthStore);

const videoRef = ref<HTMLVideoElement | null>(null);
const isRecognizing = ref(false);
const localStream = ref<MediaStream | null>(null); // 用于保存本地摄像头流的引用

// --- 摄像头控制函数 ---
const startLocalCamera = async () => {
  // 确保之前的流已停止
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      localStream.value = stream;
      if (videoRef.value) {
        videoRef.value.srcObject = stream;
      }
    } catch (err) {
      console.error("无法访问摄像头:", err);
      ElMessage.error('无法访问摄像头，请检查设备和浏览器权限！');
    }
  }
};

// --- 开关处理函数 ---
const handleRecognitionToggle = (newValue: boolean) => {
  if (newValue) {
    startRecognition(videoRef.value);
  } else {
    stopRecognition();
  }
};

// --- 监听识别结果，并处理摄像头的重新启动 ---
watch(processedImage, (newImage, oldImage) => {
  if (newImage) {
    stopRecognitionLoop();
    isRecognizing.value = false;
    statusText.value = '识别成功！结果显示3秒...';

    setTimeout(() => {
      clearResults();
    }, 3000);
  } 
  else if (oldImage && !newImage) {
    nextTick(() => {
      startLocalCamera();
    });
  }
});

onMounted(() => {
  startLocalCamera();
});

onUnmounted(() => {
  stopRecognition();
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
  }
});

const getPersonStatusClass = (person: any) => {
  if (person.identity === 'Stranger') return 'status-stranger';
  if (person.person_state === 1) return 'status-danger';
  return 'status-known';
};
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
.video-stream-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background: #000;
}
</style>