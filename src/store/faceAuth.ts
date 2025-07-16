import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { LivenessCheckService } from '@/api/faceAuth'; 
import type { FaceRecognitionResult, FaceRecognitionResponse } from '@/types/face';

export const useFaceAuthStore = defineStore('faceAuth', () => {
  // --- State (状态) ---
  const isLoading = ref(false);
  const statusText = ref('等待开始识别...');
  const recognitionResult = ref<FaceRecognitionResult[]>([]);
  const historyLog = ref<any[]>([]);
  const processedImage = ref<string | null>(null);
  
  let livenessService: LivenessCheckService | null = null;
  let frameSenderInterval: ReturnType<typeof setInterval> | null = null;

  // --- Actions (方法) ---
  const getPersonStatusText = (person: FaceRecognitionResult) => {
    if (person.identity === 'Stranger') return '陌生人';
    if (person.person_state === 1) return '危险人员'; // 根据你的代码，1是危险人员
    if (person.person_state === 0) return '正常人员';
    return '未知状态';
  };

  const updateHistoryLog = (finalResult: FaceRecognitionResponse) => {
    if (finalResult.persons && finalResult.persons.length > 0) {
      const timestamp = new Date().toLocaleTimeString();
      finalResult.persons.forEach(person => {
        historyLog.value.unshift({ ...person, statusText: getPersonStatusText(person), timestamp });
      });
      if (historyLog.value.length > 10) historyLog.value.pop();
    }
  };

  const stopRecognition = (reason: 'success' | 'manual' | 'error' | 'closed' = 'manual') => {
    console.log(`Stopping recognition, reason: ${reason}`); // 调试日志
    if (frameSenderInterval) {
      clearInterval(frameSenderInterval);
      frameSenderInterval = null;
    }
    if (livenessService) {
      livenessService.stop();
      livenessService = null;
    }
    
    if (reason === 'manual' && isLoading.value) {
      statusText.value = '识别已手动停止';
    } else if (reason === 'error') {
      statusText.value = '服务连接失败';
    } else if (reason === 'closed' && isLoading.value) {
      statusText.value = '连接意外断开';
    }
    isLoading.value = false;
  };
  
  const startRecognition = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      ElMessage.error("摄像头未就绪，无法开始识别。");
      return;
    }
    if (isLoading.value) return;

    clearResults();
    isLoading.value = true;
    statusText.value = '正在建立安全连接...';

    const callbacks = {
      onOpen: () => {
        statusText.value = '连接成功，开始进行连续活体检测...';
        frameSenderInterval = setInterval(() => {
          if (!videoElement || !livenessService) return;
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const context = canvas.getContext('2d');
          if (!context) return;
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          livenessService?.sendFrame(imageDataUrl);
        }, 150);
      },
      onResult: (data: FaceRecognitionResponse & { status: string }) => {
        console.log("Received message from backend:", data);
        if (data.status === 'processing') {
            statusText.value = data.message || '正在分析...';
            recognitionResult.value = data.persons || [];
        } else { // This is a final result
            statusText.value = data.message || (data.liveness_passed ? "活体检测通过" : "活体检测失败");
            recognitionResult.value = data.persons || [];
            
            if (data.processed_image) {
              processedImage.value = data.processed_image;
              if (data.liveness_passed && data.persons && data.persons.length > 0) {
                  updateHistoryLog();
              }
            }
            stopRecognition('success'); 
        }
      },
      onError: (error: Event) => {
        console.error("WebSocket connection error:", error);
        ElMessage.error("识别服务连接失败或中断！");
        stopRecognition('error');
      },
      onClose: () => {
        console.log("WebSocket connection closed.");
        // Only update status if it was an unexpected closure
        if (isLoading.value) {
            stopRecognition('closed');
        }
      }
    };

    livenessService = new LivenessCheckService(callbacks);
    livenessService.start();
  };

  const clearResults = () => {
    recognitionResult.value = [];
    processedImage.value = null;
    statusText.value = '等待开始识别';
  };


  return {
    isLoading,
    statusText,
    recognitionResult,
    historyLog,
    processedImage,
    startRecognition,
    stopRecognition,
    clearResults,
    getPersonStatusText,
  };
});
