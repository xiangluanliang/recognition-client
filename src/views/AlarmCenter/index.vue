<template>
  <div class="alarm-center">
    <!-- 搜索和筛选栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="告警级别">
          <el-select v-model="searchForm.level" placeholder="全部级别" clearable>
            <el-option label="高危" value="high" />
            <el-option label="中等" value="medium" />
            <el-option label="低危" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="未处理" value="unprocessed" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="processed" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number total">{{ alarmStats.total }}</div>
            <div class="stat-label">总告警数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number unprocessed">{{ alarmStats.unprocessed }}</div>
            <div class="stat-label">未处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number processing">{{ alarmStats.processing }}</div>
            <div class="stat-label">处理中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number processed">{{ alarmStats.processed }}</div>
            <div class="stat-label">已处理</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>告警列表</span>
          <div>
            <el-button type="primary" @click="handleBatchProcess" :disabled="selectedAlarms.length === 0">
              批量处理
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="alarmList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="告警标题" min-width="200" />
        <el-table-column prop="level" label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)">
              {{ getAlarmLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="告警类型" width="120" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="created_at" label="发生时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'unprocessed'"
              size="small"
              type="warning"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              size="small"
              type="success"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 告警详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="告警详情" width="800px">
      <div v-if="currentAlarm" class="alarm-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警标题">{{ currentAlarm.title }}</el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getAlarmLevelType(currentAlarm.level)">
              {{ getAlarmLevelText(currentAlarm.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警类型">{{ currentAlarm.type }}</el-descriptions-item>
          <el-descriptions-item label="发生位置">{{ currentAlarm.location }}</el-descriptions-item>
          <el-descriptions-item label="发生时间">{{ currentAlarm.created_at }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusType(currentAlarm.status)">
              {{ getStatusText(currentAlarm.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警描述" :span="2">
            {{ currentAlarm.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 告警图片/视频 -->
        <div v-if="currentAlarm.image_url || currentAlarm.video_url" class="alarm-media">
          <h4>相关媒体</h4>
          <div class="media-content">
            <img v-if="currentAlarm.image_url" :src="currentAlarm.image_url" alt="告警截图" class="alarm-image" />
            <video v-if="currentAlarm.video_url" :src="currentAlarm.video_url" controls class="alarm-video">
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AlarmItem, AlarmStats } from '@/types/alarm' // 你的类型文件路径

// 搜索表单类型定义
interface SearchForm {
  level: '' | 'high' | 'medium' | 'low'
  status: '' | 'unprocessed' | 'processing' | 'processed'
  dateRange: [Date, Date] | null
}

// 搜索表单
const searchForm = reactive<SearchForm>({
  level: '',
  status: '',
  dateRange: null
})

// 告警统计
const alarmStats = ref<AlarmStats>({
  total: 156,
  unprocessed: 23,
  processing: 8,
  processed: 125,
  today_count: 0
})

// 告警列表
const alarmList = ref<AlarmItem[]>([
  {
    id: 1,
    title: '危险区域入侵告警',
    description: '检测到人员进入站台危险区域，存在安全隐患',
    level: 'high',
    type: '区域入侵',
    location: '站台A区',
    status: 'unprocessed',
    created_at: '2024-01-15 14:30:25',
    updated_at: '2024-01-15 14:30:25',
    image_url: '/api/images/alarm_1.jpg',
    video_url: '/api/videos/alarm_1.mp4'
  },
  {
    id: 2,
    title: '异常行为检测告警',
    description: '检测到乘客在候车区域吸烟',
    level: 'medium',
    type: '异常行为',
    location: '候车大厅',
    status: 'processing',
    created_at: '2024-01-15 14:25:18',
    updated_at: '2024-01-15 14:25:18',
    image_url: '/api/images/alarm_2.jpg'
  },
  {
    id: 3,
    title: '身份认证失败告警',
    description: '多次人脸识别失败，疑似伪造身份',
    level: 'high',
    type: '身份认证',
    location: '安检口1',
    status: 'processed',
    created_at: '2024-01-15 14:20:42',
    updated_at: '2024-01-15 14:20:42'
  }
])

// 分页
interface Pagination {
  page: number
  size: number
  total: number
}

const pagination = reactive<Pagination>({
  page: 1,
  size: 20,
  total: 156
})

// 其他状态
const loading = ref(false)
const selectedAlarms = ref<AlarmItem[]>([])
const detailDialogVisible = ref(false)
const currentAlarm = ref<AlarmItem | null>(null)

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAlarmList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    level: '',
    status: '',
    dateRange: null
  })
  handleSearch()
}

// 获取告警列表（模拟）
const fetchAlarmList = async () => {
  loading.value = true
  try {
    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 这里可以调用后端接口并更新 alarmList、alarmStats 和 pagination
  } catch (error) {
    ElMessage.error('获取告警列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新
const handleRefresh = () => {
  fetchAlarmList()
}

// 选择变化
const handleSelectionChange = (selection: AlarmItem[]) => {
  selectedAlarms.value = selection
}

// 批量处理
const handleBatchProcess = async () => {
  try {
    await ElMessageBox.confirm('确认批量处理选中的告警吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('批量处理成功')
    fetchAlarmList()
  } catch {
    // 用户取消
  }
}

// 查看详情
const handleViewDetail = (alarm: AlarmItem) => {
  currentAlarm.value = alarm
  detailDialogVisible.value = true
}

// 处理告警
const handleProcess = async (alarm: AlarmItem) => {
  try {
    await ElMessageBox.confirm('确认处理此告警吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    alarm.status = 'processing'
    ElMessage.success('告警已标记为处理中')
  } catch {
    // 用户取消
  }
}

// 完成处理
const handleComplete = async (alarm: AlarmItem) => {
  try {
    await ElMessageBox.confirm('确认完成此告警处理吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    alarm.status = 'processed'
    ElMessage.success('告警处理完成')
  } catch {
    // 用户取消
  }
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchAlarmList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchAlarmList()
}

// 工具函数
const getAlarmLevelType = (level: AlarmItem['level']): string => {
  const types: Record<AlarmItem['level'], string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || 'info'
}

const getAlarmLevelText = (level: AlarmItem['level']): string => {
  const texts: Record<AlarmItem['level'], string> = {
    high: '高危',
    medium: '中等',
    low: '低危'
  }
  return texts[level] || '未知'
}

const getStatusType = (status: AlarmItem['status']): string => {
  const types: Record<AlarmItem['status'], string> = {
    unprocessed: 'danger',
    processing: 'warning',
    processed: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status: AlarmItem['status']): string => {
  const texts: Record<AlarmItem['status'], string> = {
    unprocessed: '未处理',
    processing: '处理中',
    processed: '已处理'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  fetchAlarmList()
})
</script>

<style scoped>
.alarm-center {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-number.total {
  color: #409EFF;
}

.stat-number.unprocessed {
  color: #F56C6C;
}

.stat-number.processing {
  color: #E6A23C;
}

.stat-number.processed {
  color: #67C23A;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.table-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}

.alarm-detail {
  padding: 16px 0;
}

.alarm-media {
  margin-top: 20px;
}

.alarm-media h4 {
  margin-bottom: 12px;
  color: #303133;
}

.media-content {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.alarm-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.alarm-video {
  max-width: 400px;
  max-height: 300px;
  border-radius: 4px;
}
</style>
