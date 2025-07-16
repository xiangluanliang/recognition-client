import { aiRequest } from '@/utils/request';
// 它会自动请求 https://8.152.101.217/api/ai/recognize-frame
export const recognizeFrameAPI = (imageData: string) => {
  return aiRequest.post('/recognize-frame', { image_data: imageData });
};
export class LivenessCheckService {
  private socket: WebSocket | null = null;
  // 定义回调函数类型
  private onOpenCallback: () => void;
  private onResultCallback: (data: any) => void;
  private onErrorCallback: (error: Event) => void;
  private onCloseCallback: () => void;

  constructor(callbacks: {
    onOpen: () => void;
    onResult: (data: any) => void;
    onError: (error: Event) => void;
    onClose: () => void;
  }) {
    this.onOpenCallback = callbacks.onOpen;
    this.onResultCallback = callbacks.onResult;
    this.onErrorCallback = callbacks.onError;
    this.onCloseCallback = callbacks.onClose;
  }

  public start() {
    const socketUrl = `wss://8.152.101.217/ws/liveness_check`;
    
    this.socket = new WebSocket(socketUrl);

    this.socket.onopen = this.onOpenCallback;
    this.socket.onerror = this.onErrorCallback;
    this.socket.onclose = this.onCloseCallback;
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onResultCallback(data);
      } catch (e) {
        console.error("WebSocket: Failed to parse server message.", e);
      }
    };
  }

  public sendFrame(imageDataUrl: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(imageDataUrl);
    }
  }

  public stop() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
