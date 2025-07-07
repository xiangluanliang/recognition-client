<template>
  <main>
    <TheWelcome />
    <h1>项目初始化成功</h1>
    <p>请查看浏览器控制台获取API调用信息。</p>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import api from '@/api';
import { ElMessage } from 'element-plus';

onMounted(async () => {
  try {
    const response = await api.getHelloWorld();
    console.log('API Response:', response.data);
    ElMessage.success('成功从后端获取信息: ' + response.data.message);
  } catch (error) {
    console.error('API Error:', error);
    ElMessage.error('连接后端失败，请确保后端服务已启动！');
  }
});
</script>
