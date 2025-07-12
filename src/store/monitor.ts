// src/store/monitor.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import axios from 'axios';

// This would typically be your backend's public IP or domain
const API_BASE_URL = 'http://YOUR_BACKEND_SERVER_IP/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // You would configure authentication headers here
});

// --- Data Structures (Interfaces) ---
export interface DetectionEvent {
  id: number;
  event_type: string; // Matched the field from your alarm log for consistency
  level: 'high' | 'medium' | 'low';
  description: string;
  time: string;
}

export interface Camera {
  id: number;
  name: string;
  location?: string;
  camera_type?: string;
  stream_key: string;
  status: 'online' | 'offline';
}

// --- Store Definition ---
export const useMonitorStore = defineStore('monitor', {
  // State: All the data for our component
  state: () => ({
    cameraList: [] as Camera[],
    eventList: [] as DetectionEvent[],
    selectedCameraId: null as number | null,
    loading: false,
    viewMode: 'grid' as 'grid' | 'single',
    streamBaseUrl: 'http://127.0.0.1:5000/stream/',
  }),

  // Getters: Computed properties derived from state
  getters: {
    currentCamera(state): Camera | undefined {
      return state.cameraList.find(camera => camera.id === state.selectedCameraId);
    },
  },

  // Actions: Methods that contain business logic and can be asynchronous
  actions: {
    // Fetches all cameras from the backend
    async fetchCameras() {
      this.loading = true;
      try {
        const response = await apiClient.get<Camera[]>('/cameras/');
        this.cameraList = response.data;
        
        // Auto-select the first camera if the list is not empty
        if (this.cameraList.length > 0 && !this.selectedCameraId) {
          this.setSelectedCamera(this.cameraList[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch cameras:", error);
        ElMessage.error('获取摄像头列表失败');
      } finally {
        this.loading = false;
      }
    },

    // Fetches events for a specific camera
    async fetchEventsForSelectedCamera() {
      if (!this.selectedCameraId) {
        this.eventList = [];
        return;
      }
      try {
        const response = await apiClient.get<DetectionEvent[]>(`/events/?camera_id=${this.selectedCameraId}`);
        this.eventList = response.data;
      } catch (error) {
        console.error(`Failed to fetch events for camera ${this.selectedCameraId}:`, error);
        ElMessage.error('获取事件列表失败');
      }
    },

    // Creates a new camera
    async createCamera(cameraData: { name: string; location?: string; camera_type?: string; stream_key: string }) {
      try {
        await apiClient.post('/cameras/', cameraData);
        ElMessage.success('摄像头添加成功！');
        await this.fetchCameras(); // Refresh the list after creation
        return true; // Indicate success
      } catch (error) {
        console.error("Failed to create camera:", error);
        ElMessage.error('添加摄像头失败');
        return false; // Indicate failure
      }
    },

    // Action to update the selected camera ID and fetch its events
    setSelectedCamera(cameraId: number) {
      this.selectedCameraId = cameraId;
      this.fetchEventsForSelectedCamera();
    },

    // Action to switch view mode
    setViewMode(mode: 'grid' | 'single') {
        this.viewMode = mode;
    }
  },
});