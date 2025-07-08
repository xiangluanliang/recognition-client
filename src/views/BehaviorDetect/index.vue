<template>
  <div class="behavior-detect">
    <el-card>
      <template #header>
        <span>行为异常检测</span>
      </template>
      <div class="detect-content">
        <el-empty description="行为检测功能开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 行为检测页面逻辑
</script>

<style scoped>
.behavior-detect {
  padding: 0;
}

.detect-content {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
