<template>
  <el-container class="layout-container">
    <el-aside width="250px" class="sidebar">
      <div class="logo">
        <h2>星链智核</h2>
      </div>
   <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/monitor">
          <el-icon><VideoCamera /></el-icon>
          <span>实时监控</span>
        </el-menu-item>
        <el-menu-item index="/alarm-center">
          <el-icon><Bell /></el-icon>
          <span>告警中心</span>
          <el-badge v-if="alarmStore.unreadCount > 0" :value="alarmStore.unreadCount" class="alarm-badge" />
        </el-menu-item>
        <el-menu-item index="/area-config">
          <el-icon><MapLocation /></el-icon>
          <span>区域配置</span>
        </el-menu-item>
        <el-menu-item index="/behavior-detect">
          <el-icon><View /></el-icon>
          <span>行为检测</span>
        </el-menu-item>
        <el-menu-item index="/face-auth">
          <el-icon><User /></el-icon>
          <span>身份认证</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h3>{{ $route.meta.title || '星链智核·交通安防协同领航平台' }}</h3>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" />
              <span class="username">{{ userStore.userInfo?.username || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAlarmStore } from '@/store/alarm'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const alarmStore = useAlarmStore()

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      userStore.logoutAction()
      ElMessage.success('退出登录成功')
      break
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #434a50;
}

.logo h2 {
  font-size: 16px;
  font-weight: 600;
}

.header {
  background: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h3 {
  color: #303133;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  color: #606266;
}

.main-content {
  background: #f5f5f5;
  padding: 20px;
}

.alarm-badge {
  margin-left: 10px;
}
</style>
