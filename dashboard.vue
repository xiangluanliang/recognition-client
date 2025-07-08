<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <Shield class="h-8 w-8 text-blue-600 mr-3" />
            <h1 class="text-xl font-bold text-gray-900">星链智核·交通安防协同领航平台</h1>
          </div>
          <p class="text-sm text-gray-500 mt-1">StarLink IntelliCore: Integrated Traffic Security & Behavioral Analysis Command Center</p>
          <div class="flex items-center space-x-4">
            <div class="flex items-center text-sm text-gray-600">
              <Clock class="h-4 w-4 mr-1" />
              {{ currentTime }}
            </div>
            <div class="flex items-center">
              <User class="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
              <span class="ml-2 text-sm font-medium text-gray-700">管理员</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- 系统状态概览 -->
      <div class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">系统状态概览</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Users class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">在线人数</p>
                <p class="text-2xl font-semibold text-gray-900">{{ onlineUsers }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <AlertTriangle class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">今日告警</p>
                <p class="text-2xl font-semibold text-gray-900">{{ todayAlerts }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Camera class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">监控设备</p>
                <p class="text-2xl font-semibold text-gray-900">{{ cameraCount }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Activity class="h-8 w-8 text-red-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">系统状态</p>
                <p class="text-2xl font-semibold text-green-600">正常</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能模块 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- 身份认证模块 -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <UserCheck class="h-6 w-6 text-blue-600 mr-2" />
              <h3 class="text-lg font-medium text-gray-900">身份认证</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">人脸信息管理</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">实时身份识别</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">防伪认证检测</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">异常身份告警</span>
                <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">{{ faceAlerts }}条</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              进入管理
            </button>
          </div>
        </div>

        <!-- 危险区域监控模块 -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <MapPin class="h-6 w-6 text-red-600 mr-2" />
              <h3 class="text-lg font-medium text-gray-900">危险区域监控</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">区域配置管理</span>
                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{{ dangerZones }}个区域</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">目标检测识别</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">入侵事件处理</span>
                <span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">{{ intrusionEvents }}次</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              查看监控
            </button>
          </div>
        </div>

        <!-- 行为异常检测模块 -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <Eye class="h-6 w-6 text-purple-600 mr-2" />
              <h3 class="text-lg font-medium text-gray-900">行为异常检测</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">异常行为识别</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">驾驶行为监测</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">声学事件检测</span>
                <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">可选</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">异常事件联动</span>
                <span class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">{{ behaviorAlerts }}条</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              行为分析
            </button>
          </div>
        </div>

        <!-- 告警中心模块 -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <Bell class="h-6 w-6 text-yellow-600 mr-2" />
              <h3 class="text-lg font-medium text-gray-900">告警中心</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">实时告警通知</span>
                <span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">{{ activeAlerts }}条</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">告警日志归档</span>
                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{{ totalAlerts }}条</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">处理状态管理</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{{ processedAlerts }}已处理</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">AI日报生成</span>
                <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">可选</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              告警管理
            </button>
          </div>
        </div>

        <!-- 交通数据分析模块 -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <BarChart3 class="h-6 w-6 text-green-600 mr-2" />
              <h3 class="text-lg font-medium text-gray-900">交通数据分析</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">轨迹数据处理</span>
                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">扩展功能</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">客流聚类分析</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">运行中</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">影响因素可视化</span>
                <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">ECharts</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">异常行为联动</span>
                <span class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">分析中</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              数据分析
            </button>
          </div>
        </div>

        <!-- 系统支撑与管理模块 -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <Settings class="h-6 w-6 text-gray-600 mr-2" />
              <h3 class="text-lg font-medium text-gray-900">系统支撑与管理</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">用户权限管理</span>
                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">JWT认证</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">接口文档管理</span>
                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Swagger</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">代码版本管理</span>
                <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Git</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700">系统日志管理</span>
                <span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">归档中</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              系统管理
            </button>
          </div>
        </div>
      </div>

      <!-- 最新告警信息 -->
      <div class="mt-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">最新告警信息</h2>
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-900">实时告警列表</h3>
              <button class="text-sm text-blue-600 hover:text-blue-800">查看全部</button>
            </div>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-for="alert in recentAlerts" :key="alert.id" class="px-6 py-4 flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <AlertTriangle :class="getAlertColor(alert.level)" class="h-5 w-5" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ alert.title }}</p>
                  <p class="text-sm text-gray-500">{{ alert.description }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 mr-4">{{ alert.time }}</span>
                <span :class="getStatusColor(alert.status)" class="px-2 py-1 text-xs rounded">
                  {{ alert.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Shield, Clock, User, Users, AlertTriangle, Camera, Activity, 
  UserCheck, MapPin, Eye, Bell, BarChart3, Settings 
} from 'lucide-vue-next'

// 响应式数据
const currentTime = ref('')
const onlineUsers = ref(1247)
const todayAlerts = ref(23)
const cameraCount = ref(48)
const faceAlerts = ref(5)
const dangerZones = ref(12)
const intrusionEvents = ref(8)
const behaviorAlerts = ref(15)
const activeAlerts = ref(7)
const totalAlerts = ref(1856)
const processedAlerts = ref(1849)

// 最新告警数据
const recentAlerts = ref([
  {
    id: 1,
    title: '危险区域入侵告警',
    description: '检测到人员进入站台危险区域',
    time: '2分钟前',
    level: 'high',
    status: '未处理'
  },
  {
    id: 2,
    title: '异常行为检测',
    description: '检测到乘客在候车区域吸烟',
    time: '5分钟前',
    level: 'medium',
    status: '处理中'
  },
  {
    id: 3,
    title: '身份认证失败',
    description: '多次人脸识别失败，疑似伪造身份',
    time: '8分钟前',
    level: 'high',
    status: '已处理'
  },
  {
    id: 4,
    title: '设备异常告警',
    description: '3号摄像头连接异常',
    time: '12分钟前',
    level: 'low',
    status: '已处理'
  }
])

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取告警级别颜色
const getAlertColor = (level) => {
  switch (level) {
    case 'high': return 'text-red-600'
    case 'medium': return 'text-yellow-600'
    case 'low': return 'text-blue-600'
    default: return 'text-gray-600'
  }
}

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case '未处理': return 'bg-red-100 text-red-800'
    case '处理中': return 'bg-yellow-100 text-yellow-800'
    case '已处理': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* 自定义样式 */
.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
</style>
