<template>
  <div class="face-auth">
    <el-card>
      <template #header>
        <span>身份认证管理</span>
      </template>

      <!-- 上半部分：左右两栏 -->
      <div class="auth-top">
        <!-- 左：摄像头画面 -->
        <div class="camera-box">
          <video ref="videoRef" autoplay playsinline muted></video>
        </div>

        <!-- 右：识别结果 -->
        <div class="info-box">
          <p class="info-title">识别结果</p>
          <div class="info-content">
            <el-empty description="等待识别..." />
          </div>
        </div>
      </div>

      <!-- 下半部分：表格区域 -->
      <div class="auth-bottom">
        <el-table :data="[]" height="200px">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="识别姓名" />
          <el-table-column prop="confidence" label="置信度" />
          <el-table-column prop="time" label="识别时间" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  // 启用摄像头
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      if (videoRef.value) {
        videoRef.value.srcObject = stream
      }
    })
    .catch((err) => {
      console.error("无法访问摄像头：", err)
    })
})
</script>

<style scoped>
.face-auth {
  padding: 16px;
}

.auth-top {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.camera-box,
.info-box {
  flex: 1;
  min-height: 280px;
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
}

.info-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.auth-bottom {
  padding-top: 16px;
}
</style>
