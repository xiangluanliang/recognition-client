<template>
  <div class="alarm-center">
    <!-- 告警列表卡片 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>告警记录</span>
          <el-button type="primary" @click="handleRefresh" :loading="alarmStore.loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="alarmStore.alarmLogs"
        v-loading="alarmStore.loading"
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="source_type" label="来源类型" />
        <el-table-column prop="source_id" label="来源 ID" />
        <el-table-column prop="time" label="告警时间" width="180" />
        <el-table-column prop="method" label="检测方式" />
        <el-table-column prop="receiver" label="接收人" />
        <el-table-column prop="result" label="处理结果" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useAlarmStore } from '@/store/alarm'

const alarmStore = useAlarmStore()

const handleRefresh = async () => {
  try {
    await alarmStore.fetchAlarmLogs()
  } catch {
    ElMessage.error('获取告警记录失败')
  }
}

onMounted(() => {
  alarmStore.fetchAlarmLogs()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-button {
  float: right;
}
</style>