<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon online">
              <el-icon>
                <User/>
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.onlineUsers }}</h3>
              <p>注册用户</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon alarm">
              <el-icon>
                <Bell/>
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.todayAlarms }}</h3>
              <p>今日告警</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon camera">
              <el-icon>
                <VideoCamera/>
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.cameraCount }}</h3>
              <p>监控设备</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon status">
              <el-icon>
                <CircleCheck/>
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>正常</h3>
              <p>系统状态</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>告警趋势</span>
              <el-button
                  type="primary"
                  size="small"
                  @click="handleGenerateReport"
                  :loading="isReportLoading"
              >
                生成日报
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="alarmTrendOption"/>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 改进后的日报弹窗 -->
    <el-dialog
        v-model="reportDialogVisible"
        :title="reportDialogTitle"
        width="70%"
        top="5vh"
        class="report-dialog"
        :close-on-click-modal="false"
    >
      <div class="report-container">
        <!-- 加载状态 -->
        <div v-if="isGeneratingReport" class="loading-container">
          <div class="loading-spinner">
            <el-icon class="is-loading">
              <Loading/>
            </el-icon>
          </div>
          <p class="loading-text">正在生成AI监控日报...</p>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- 报告内容 -->
        <div v-else class="report-content-wrapper">
          <div class="report-header">
            <div class="report-title">
              <el-icon class="title-icon"><Document/></el-icon>
              <span>AI监控系统日报</span>
            </div>
            <div class="report-date">{{ getCurrentDate() }}</div>
          </div>

          <!-- 使用v-html渲染格式化后的内容 -->
          <div class="report-content" v-html="formattedReportContent"></div>

          <div class="report-footer">
            <div class="footer-info">
              <el-icon><InfoFilled/></el-icon>
              <span>本报告由AI智能分析生成</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reportDialogVisible = false" size="large">
            <el-icon><Close/></el-icon>
            关闭
          </el-button>
          <el-button
            type="primary"
            @click="handleDownloadReport"
            size="large"
            :disabled="isGeneratingReport"
          >
            <el-icon><Download/></el-icon>
            下载报告
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 最新告警 -->
    <el-row class="recent-alarms">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新告警</span>
              <el-button type="primary" size="small" @click="$router.push('/alarm-center')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentAlarms" style="width: 100%" row-key="id" border>
            <el-table-column prop="event_type" label="事件类型"/>
            <el-table-column prop="event_id" label="事件ID"/>
            <el-table-column prop="time" label="告警时间"/>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="statusTagType[row.status]" effect="light">
                  {{ statusLabel[row.status] }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {use} from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'
import {LineChart, PieChart} from 'echarts/charts'
import {GridComponent, LegendComponent, TooltipComponent} from 'echarts/components'
import VChart from 'vue-echarts'
import {getAlarmTrend, getTodayAlarmCount} from "@/api/alarm.ts";
import {Bell, CircleCheck, Download, User, VideoCamera, Loading, Document, InfoFilled, Close} from "@element-plus/icons-vue";
import {getUserCount} from "@/api/users.ts";
import {getCameraCount} from "@/api/camera.ts";
import {ElMessage} from "element-plus";
import {generateDailyReport} from "@/api/report.ts";
import {useAlarmStore} from "@/store/alarm.ts";

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

// 统计数据
const stats = ref({
  onlineUsers: 0,
  todayAlarms: 0,
  cameraCount: 0,
  systemStatus: '正常'
})

// 告警趋势图表配置
const alarmTrendOption = ref<{
  title: { text: string }
  tooltip: { trigger: string }
  xAxis: { type: string; data: string[] }
  yAxis: { type: string }
  series: {
    data: number[]
    type: string
    smooth: boolean
    itemStyle: { color: string }
  }[]
}>({
  title: {text: '近7天告警趋势'},
  tooltip: {trigger: 'axis'},
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {type: 'value'},
  series: [
    {
      data: [],
      type: 'line',
      smooth: true,
      itemStyle: {color: '#409EFF'}
    }
  ]
})

const updateTrendData = (trendData: { dates: string[]; counts: number[] }) => {
  alarmTrendOption.value.xAxis.data = trendData.dates
  alarmTrendOption.value.series[0].data = trendData.counts
}

// 报告相关状态
const isReportLoading = ref(false);
const reportDialogVisible = ref(false);
const currentReportContent = ref('');
const isGeneratingReport = ref(false);

// 计算弹窗标题
const reportDialogTitle = computed(() => {
  return isGeneratingReport.value ? '生成中...' : 'AI监控日报'
});

// Markdown转HTML的函数
const parseMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown;

  // 处理标题 (### ## #)
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // 处理粗体 **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 处理斜体 *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 处理代码块 `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 处理无序列表
  html = html.replace(/^[\s]*[-*+]\s+(.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // 处理有序列表
  html = html.replace(/^[\s]*\d+\.\s+(.*$)/gm, '<li>$1</li>');

  // 处理链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // 处理图片语法 ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />');

  // 处理 Markdown 表格
  html = html.replace(/^\|(.+)\|\n\|[-| ]+\|\n((?:\|.*\|\n?)*)/gm, (_, headerRow, bodyRows) => {
    const headers = headerRow.trim().split('|').map(h => `<th>${h.trim()}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map(row => {
      const cleanRow = row.trim().replace(/^(\|)?(.*?)(\|)?$/, '$2'); // 去掉开头和结尾的 |
      const cells = cleanRow.split('|').map(c => `<td>${c.trim()}</td>`).join('');

      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table class="markdown-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });


  // 处理换行
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // 包装段落
  if (html && !html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  // 清理多余的段落标签
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');

  return html;
};

// 格式化后的报告内容
const formattedReportContent = computed(() => {
  const raw = currentReportContent.value;

  // 尝试匹配表格 HTML（支持多个表格）
  const tableMatches = raw.match(/<table[\s\S]*?<\/table>/gi);

  let markdownPart = raw;
  let htmlPart = '';

  if (tableMatches && tableMatches.length > 0) {
    // 移除 HTML 表格内容，仅保留 Markdown 部分
    tableMatches.forEach(table => {
      markdownPart = markdownPart.replace(table, '[[TABLE_PLACEHOLDER]]');
    });

    // 转 Markdown → HTML
    let html = parseMarkdownToHtml(markdownPart);

    // 插入表格回去
    tableMatches.forEach(table => {
      html = html.replace('[[TABLE_PLACEHOLDER]]', table);
    });

    return html;
  }

  // 无 HTML 表格时，正常解析
  return parseMarkdownToHtml(raw);
});


// 获取当前日期
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[today.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
};

const handleGenerateReport = async () => {
  isReportLoading.value = true;
  reportDialogVisible.value = true;
  isGeneratingReport.value = true;

  try {
    const res = await generateDailyReport();
    currentReportContent.value = res.content;
    isGeneratingReport.value = false;
    ElMessage.success('日报生成成功！');
  } catch (error) {
    setTimeout(() => {
      isGeneratingReport.value = false;
      reportDialogVisible.value = false;
    }, 1000);
    console.error("生成日报失败:", error);
  } finally {
    isReportLoading.value = false;
  }
};

/**
 * 处理"下载"按钮的点击事件
 */
const handleDownloadReport = () => {
  if (!currentReportContent.value) {
    ElMessage.warning('报告内容为空，无法下载。');
    return;
  }

  const today = new Date();
  const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const filename = `AI监控日报-${dateString}.txt`;

  const blob = new Blob([currentReportContent.value], {type: 'text/plain;charset=utf-8'});

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  ElMessage.success('报告下载成功！');
};

const alarmStore = useAlarmStore()
const recentAlarms = computed(() => alarmStore.alarmLogs.slice(0, 3))

// 状态映射
const statusLabel = {
  0: '未处理',
  1: '处理中',
  2: '已处理'
}

const statusTagType = {
  0: 'danger',
  1: 'warning',
  2: 'success'
}

onMounted(async () => {
  try {
    await alarmStore.fetchAlarmLogs()
    const nums = await getAlarmTrend()
    updateTrendData(nums)
    stats.value.todayAlarms = await getTodayAlarmCount()
    const users = await getUserCount()
    stats.value.onlineUsers = users.count
    const cam = await getCameraCount()
    stats.value.cameraCount = cam.count
  } catch (e) {
    console.error('获取失败', e)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stat-icon.online {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.alarm {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.camera {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.status {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #303133;
}

.stat-info p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-alarms {
  margin-bottom: 20px;
}

/* 报告弹窗样式 */
:deep(.report-dialog) {
  .el-dialog {
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 24px;
    border-radius: 12px 12px 0 0;
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
  }

  .el-dialog__headerbtn .el-dialog__close {
    color: white;
    font-size: 18px;
  }

  .el-dialog__body {
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 20px 24px;
    background: #f8f9fa;
    border-radius: 0 0 12px 12px;
  }
}

.report-container {
  min-height: 400px;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-spinner .el-icon {
  font-size: 48px;
  color: #409EFF;
}

.loading-text {
  font-size: 18px;
  color: #606266;
  margin: 0 0 20px 0;
  font-weight: 500;
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409EFF;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 报告内容样式 */
.report-content-wrapper {
  background: white;
}

.report-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
}

.title-icon {
  font-size: 24px;
}

.report-date {
  font-size: 16px;
  opacity: 0.9;
}

/* 改进的报告内容样式 - 支持HTML格式 */
.report-content {
  padding: 32px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: #2c3e50;
  background: #fafbfc;
  border-left: 4px solid #409EFF;
  margin: 0;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
}

/* HTML元素样式 */
.report-content :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.report-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 20px 0 12px 0;
  padding-left: 12px;
  border-left: 4px solid #4299e1;
}

.report-content :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
  margin: 16px 0 10px 0;
  padding-left: 8px;
  border-left: 3px solid #68d391;
}

.report-content :deep(p) {
  margin: 12px 0;
  text-align: justify;
}

.report-content :deep(strong) {
  font-weight: 600;
  color: #2d3748;
}

.report-content :deep(em) {
  font-style: italic;
  color: #4a5568;
}

.report-content :deep(code) {
  background: #f7fafc;
  color: #e53e3e;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.report-content :deep(ul) {
  margin: 16px 0;
  padding-left: 0;
}

.report-content :deep(li) {
  list-style: none;
  margin: 8px 0;
  padding-left: 24px;
  position: relative;
}

.report-content :deep(li::before) {
  content: '•';
  color: #4299e1;
  font-weight: bold;
  position: absolute;
  left: 8px;
  font-size: 16px;
}

.report-content :deep(a) {
  color: #4299e1;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.report-content :deep(a:hover) {
  border-bottom-color: #4299e1;
}

.report-content :deep(br) {
  line-height: 1.2;
}

.report-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px auto;
  background-color: #ffffff;
  /* 移除表格整体的阴影和圆角，以匹配图片中更简洁的样式 */
  box-shadow: none;
  border-radius: 0;
  border: none; /* 移除表格整体边框 */
}

.report-content :deep(th),
.report-content :deep(td) {
  border: none; /* 移除所有单元格边框 */
  padding: 12px 15px;
  text-align: left; /* 默认左对齐 */
  font-size: 14px;
  color: #333;
}

.report-content :deep(th) {
  background-color: transparent; /* 表头背景透明 */
  font-weight: 700; /* 表头字体加粗 */
  color: #303133; /* 表头字体颜色更深 */
  text-align: left; /* 表头左对齐，与图片一致 */
  border-bottom: 2px solid #e0e0e0; /* 表头下方粗线 */
}

.report-content :deep(td) {
  border-bottom: 1px solid #e0e0e0; /* 数据行下方细线 */
}

/* 移除表格最后一行的底部边框 */
.report-content :deep(tr:last-child td) {
  border-bottom: none;
}

/* 移除偶数行的背景色，以匹配图片中统一的背景 */
.report-content :deep(tr:nth-child(even)) {
  background-color: transparent;
}

.report-content :deep(tr:hover) {
  background-color: #f0f8ff; /* 保留悬停效果 */
}

/* 针对表格列的对齐调整 */
.report-content :deep(th:first-child),
.report-content :deep(td:first-child) {
  text-align: left; /* 第一列左对齐 */
}

.report-content :deep(th:not(:first-child)),
.report-content :deep(td:not(:first-child)) {
  text-align: center; /* 其他列居中对齐 */
}

.report-footer {
  padding: 20px 32px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 8px;
}
</style>
