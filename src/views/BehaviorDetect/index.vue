<template>
  <div class="face-auth">
    <el-card>
      <template #header>
        <span>行为检测</span>
      </template>

      <!-- 上半部分：左右两栏 -->
      <div class="auth-top">
        <!-- 左：视频画面 -->
        <div class="camera-box">
          <video ref="videoRef" :src="videoUrl" controls autoplay muted></video>
        </div>

        <!-- 右：识别结果 -->
        <div class="info-box">
          <p class="info-title">相关信息</p>
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
import { getEventDetail } from '@/api/event'

const videoRef = ref<HTMLVideoElement | null>(null)
const videoUrl = ref('')  // 用于绑定 video 的 src

const eventId = 203 // 临时写死，后面可以传参或用路由拿

onMounted(async () => {
  try {
    const event = await getEventDetail(eventId)
    videoUrl.value = `http://8.152.101.217/${event.video_clip_path}`
    // console.log("拿到的视频路径：", videoUrl.value)
    // videoUrl.value = 'http://8.152.101.217/media/zxcFall.mp4'

    if (videoRef.value) {
      // videoRef.value.load()
      videoRef.value.play().catch(err => {
        console.error('播放失败：', err)
      })
    }
  } catch (error) {
    console.error('获取事件详情失败', error)
  }
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
