<!-- src/views/YoloView.vue -->
<template>
  <div>
    <h2>YOLO 视频目标检测</h2>
    <input type="file" @change="onFileChange" />
    <div v-if="frames.length">
      <div v-for="(img, index) in frames" :key="index">
        <img :src="'data:image/jpeg;base64,' + img" style="width: 300px; margin: 10px;" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { detectVideo } from '@/api/yolo'

const frames = ref([])

function onFileChange(e) {
  const file = e.target.files[0]
  detectVideo(file).then(res => {
    frames.value = res.data.frames
  })
}
</script>
