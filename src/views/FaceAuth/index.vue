<template>
  <div class="face-auth">
    <el-card>
      <template #header>
        <span>身份认证管理</span>
      </template>
      <div class="auth-content">
        <el-empty description="身份认证功能开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 身份认证页面逻辑
</script>

<style scoped>
.face-auth {
  padding: 0;
}

.auth-content {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
