<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header><span>用户登录</span></template>
      <el-form :model="loginForm">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import API from '@/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loginForm = ref({ username: '', password: '' });
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    const response = await API.login(loginForm.value);
    localStorage.setItem('user_token', response.token);
    ElMessage.success('登录成功！');
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 80vh; }
.login-card { width: 400px; }
</style>