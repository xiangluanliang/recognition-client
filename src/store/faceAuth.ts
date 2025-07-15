// src/store/faceAuth.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { recognizeFrameAPI } from '@/api/faceAuth';
import type { FaceRecognitionResult, FaceRecognitionResponse } from '@/types/face';

export const useFaceAuthStore = defineStore('faceAuth', () => {
  const isLoading = ref(false);
  const statusText = ref('等待开始识别...');
  const recognitionResult = ref<FaceRecognitionResult[]>([]);
  const historyLog = ref<any[]>([]);
  const processedImage = ref<string | null>(null);
  let recognitionTimeout: ReturnType<typeof setTimeout> | null = null;

  const updateHistoryLog = () => {
    if (recognitionResult.value.length > 0) {
      const timestamp = new Date().toLocaleTimeString();
      recognitionResult.value.forEach(person => {
        historyLog.value.unshift({ ...person, statusText: getPersonStatusText(person), timestamp });
      });
      if (historyLog.value.length > 10) historyLog.value.pop();
    }
  };

  const scheduleNextRecognition = (videoElement: HTMLVideoElement) => {
    if (recognitionTimeout !== null) {
      recognitionTimeout = setTimeout(() => captureAndRecognize(videoElement), 800);
    }
  };

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
      const data: FaceRecognitionResponse = await recognizeFrameAPI(imageDataUrl);

      // 1. 定义什么是“有效成功”的识别
      const isSuccess = data.liveness_passed && data.persons && data.persons.length > 0;

      // 2. 无论成功与否，都更新JSON结果以在右侧面板显示
      recognitionResult.value = data.persons || [];
      if (isSuccess) {
          updateHistoryLog(); // 只有成功时才更新历史记录
      }

      // 3. 根据是否成功，决定下一步行为
      if (isSuccess) {
        // 【成功分支】
        // 更新处理后的图片，这将触发 index.vue 中的 watch 逻辑来停止循环
        processedImage.value = data.processed_image || null;
      } else {
        // 【失败分支】
        // a. 保持 processedImage 为 null，这样前端画面不会改变
        processedImage.value = null;
        // b. 更新提示文字，告诉用户正在发生什么
        if (!data.liveness_passed) {
            statusText.value = '未通过活体检测，正在重试...';
        } else {
            statusText.value = '未检测到人脸，正在重试...';
        }
        // c. 不做任何特殊操作，让 finally 中的 scheduleNextRecognition 继续下一次循环
      }

    } catch (error) {
      console.error("识别请求失败:", error);
      statusText.value = '请求AI服务失败';
      stopRecognition();
    } finally {
      isLoading.value = false;
      // 只要循环没有被外部停止，就会安排下一次识别
      scheduleNextRecognition(videoElement);
    }
  };

  // --- Actions (保持不变) ---
  const stopRecognitionLoop = () => {
    if (recognitionTimeout !== null) {
      clearTimeout(recognitionTimeout);
      recognitionTimeout = null;
      isLoading.value = false;
    }
  };

  const clearResults = () => {
    recognitionResult.value = [];
    processedImage.value = null;
    statusText.value = '识别已停止';
  };

  const startRecognition = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      ElMessage.error("摄像头未就绪，无法开始识别。");
      return;
    }
    clearResults();
    statusText.value = '正在识别中...';
    if (recognitionTimeout) clearTimeout(recognitionTimeout);
    recognitionTimeout = 0;
    captureAndRecognize(videoElement);
  };

  const stopRecognition = () => {
    stopRecognitionLoop();
    clearResults();
    ElMessage.info('识别已停止');
  };

  const getPersonStatusText = (person: FaceRecognitionResult) => {
    if (person.identity === 'Stranger') return '陌生人';
    if (person.person_state === 1) return '黑名单';
    if (person.person_state === 0) return '正常人员';
    return '未知状态';
  }

  // --- 返回 (保持不变) ---
  return {
    isLoading,
    statusText,
    recognitionResult,
    historyLog,
    processedImage,
    startRecognition,
    stopRecognition,
    stopRecognitionLoop,
    clearResults,
    getPersonStatusText,
  };
});