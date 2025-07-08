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
    <div class="app">
      <h1>👋 趣味问候机</h1>
      <div class="greeting">{{ greetings[currentIndex] }}</div>
      <button @click="nextGreeting">换一个</button>
    </div>
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

const greetings = [
  '🌞 早上好！今天也要元气满满哦！',
  '😎 Yo！准备好大干一场了吗？',
  '👽 嗨，外星人上线了！',
  '🐢 慢一点没关系，乌龟也能赢兔子！',
  '🍕 吃饱了吗？来点代码当饭后甜点吧～',
  '🐱‍👤 你好，隐藏的高手！',
  '🧠 智慧如你，今天又准备做些什么神奇的事情？',
  '🍵 闲聊几句，休息一下吧～',
]

const currentIndex = ref(0)

function nextGreeting() {
  currentIndex.value = (currentIndex.value + 1) % greetings.length
}
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 80vh; }
.login-card { width: 400px; }
.app {
  max-width: 500px;
  margin: 100px auto;
  padding: 20px;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  background: #fffaf0;
  font-family: 'Segoe UI', sans-serif;
}

.greeting {
  font-size: 1.5rem;
  margin: 30px 0;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  background: #fe8d2d;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: #e67e22;
}
</style>
