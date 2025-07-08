<template>
  <div class="fullscreen-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 全屏布局逻辑
</script>

<style scoped>
.fullscreen-layout {
  width: 100vw;
  height: 100vh;
  background: #000;
}
</style>
