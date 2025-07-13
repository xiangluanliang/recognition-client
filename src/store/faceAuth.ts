// src/store/faceAuth.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
// 导入我们定义好的、会通过Nginx代理的API请求函数
import { recognizeFrameAPI } from '@/api/faceAuth'; 
import type { FaceRecognitionResult, FaceRecognitionResponse } from '@/types/face';
import { da } from 'element-plus/es/locales.mjs';

export const useFaceAuthStore = defineStore('faceAuth', () => {
  // --- State: 状态定义，保持不变 ---
  const isLoading = ref(false);
  const statusText = ref('等待开始识别...');
  const recognitionResult = ref<FaceRecognitionResult[]>([]);
  const historyLog = ref<any[]>([]);
  const processedImage = ref<string | null>(null);
  // 使用 a let variable for the timeout handle is standard practice
  let recognitionTimeout: ReturnType<typeof setTimeout> | null = null;

  // --- Getters/Helpers: 辅助函数，用于在组件中格式化显示 ---
  function getPersonStatusText(person:FaceRecognitionResult) {
    if (person.identity === 'Stranger') return '陌生人';
    if (person.person_state === 1) return '黑名单';
    if (person.person_state === 0) return '正常人员';
    return '未知状态';
  }

  // --- Private Actions: 内部辅助Action ---
  const updateHistoryLog = () => {
    // 只有当识别到人脸时才更新历史记录
    if (recognitionResult.value.length > 0) {
      const timestamp = new Date().toLocaleTimeString();
      recognitionResult.value.forEach(person => {
        historyLog.value.unshift({
          ...person,
          statusText: getPersonStatusText(person),
          timestamp,
        });
      });
      // 限制历史记录最多为10条
      if (historyLog.value.length > 10) {
        historyLog.value.pop();
      }
    }
  };
  
  const scheduleNextRecognition = (videoElement: HTMLVideoElement) => {
    // 只有当识别循环仍在运行时（recognitionTimeout不为null），才安排下一次
    if (recognitionTimeout !== null) {
      // 使用setTimeout而不是setInterval，确保一次请求完成后再安排下一次，避免网络拥堵时请求堆积
      recognitionTimeout = setTimeout(() => captureAndRecognize(videoElement), 800);
    }
  };

  // --- Actions: 组件调用的核心动作 ---
  
  /**
   * 截图并调用API进行识别
   * @param videoElement HTML video 元素
   */
    const captureAndRecognize = async (videoElement: HTMLVideoElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');

        isLoading.value = true;
        try {
            const data: FaceRecognitionResponse =  await recognizeFrameAPI(imageDataUrl);
            recognitionResult.value = data.persons || [];
            processedImage.value = data.processed_image || null;
            if (data.persons && data.persons.length > 0) {
                statusText.value = '已识别到人脸';
                updateHistoryLog();
            } else if (data.liveness_passed === false) {
                statusText.value = '未通过活体检测';
            } else {
                statusText.value = '未检测到匹配人员';
            }
        } catch (error) {
            console.error("识别请求失败 (已在拦截器中提示):", error);
            statusText.value = '请求AI服务失败';
            recognitionResult.value = [];
            stopRecognition();
        } finally {
            isLoading.value = false;
            scheduleNextRecognition(videoElement);
        }
    };


  /**
   * 开始识别循环
   * @param videoElement HTML video 元素
   */
  const startRecognition = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      ElMessage.error("摄像头未就绪，无法开始识别。");
      return;
    }
    ElMessage.success('识别已开始');
    statusText.value = '正在识别中...';
    
    // 清理可能存在的旧定时器
    if (recognitionTimeout) clearTimeout(recognitionTimeout);
    
    // 设置一个非null的初始值来表示循环正在运行
    recognitionTimeout = 0;
    
    // 立即执行第一次识别
    captureAndRecognize(videoElement);
  };

  /**
   * 停止识别循环
   */
  const stopRecognition = () => {
    if (recognitionTimeout !== null) {
      clearTimeout(recognitionTimeout);
      recognitionTimeout = null; // 将句柄设为null，作为循环停止的标志
      isLoading.value = false;
      statusText.value = '识别已停止';
      recognitionResult.value = [];
      processedImage.value = null;
      ElMessage.info('识别已停止');
    }
  };

  // 返回组件需要用到的所有状态和方法
  return {
    isLoading,
    statusText,
    recognitionResult,
    historyLog,
    processedImage,
    startRecognition,
    stopRecognition,
    getPersonStatusText,
  };
});