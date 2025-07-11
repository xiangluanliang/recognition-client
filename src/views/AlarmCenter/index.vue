<template>
  <div class="alarm-center">
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

      <el-table :data="alarmStore.alarmLogs" v-loading="alarmStore.loading" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="event_type" label="事件类型" width="150" />
        <el-table-column prop="event_id" label="事件ID" width="100" />
        <el-table-column prop="time" label="告警时间" width="180" />
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
    console.log(alarmStore.alarmLogs)
    // console.log(alarmStore.alarmLogs[0].event_type)
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
</style>
