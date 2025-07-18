/**
 * 单个识别人脸的结果对象结构
 */
export interface FaceRecognitionResult {
    liveness_info?: {
    oulu_result: string;
    combined_live_status: boolean;
  };
  /**
   * 人脸边界框坐标 [x1, y1, x2, y2]
   */
  box_coords: [number, number, number, number];
  
  /**
   * 人脸检测的置信度 (0-1)
   */
  confidence: number;

  /**
   * 识别出的身份 (例如 "张三" 或 "Stranger")
   */
  identity: string;

  /**
   * 与数据库中最相似人脸的距离值。
   * 对于 "Stranger"，此值为 null。
   * 值越小表示越相似。
   */
  distance: number | null;

  /**
   * 识别出的人员在数据库中的ID。
   * 对于 "Stranger"，此值为 null。
   */
  person_id: number | null;

  /**
   * 识别出的人员状态 (例如 0: 正常, 1: 黑名单)。
   * 对于 "Stranger"，此值为 null。
   */
  person_state: number | null;
}

/**
 * 后端 /ai/recognize-frame 接口返回的完整响应体结构
 */
export interface FaceRecognitionResponse {
  /**
   * 请求处理状态
   */
  status: 'success' | 'error';
  
  /**
   * 是否通过活体检测
   */
  liveness_passed: boolean;

  /**
   * 在画面中识别出的所有人员的结果列表
   */
  persons: FaceRecognitionResult[];

  /**
   * 后端生成的、带有识别框的处理后图像的Base64字符串
   * 这是一个可选字段，因为只有在成功处理时才会返回
   */
  processed_image?: string;
  
  /**
   * 当 status 为 'error' 时，附带的错误信息
   */
  message?: string;
  
  /**
   * 需要记录到后台的事件列表 (前端通常不直接使用此字段)
   */
  events_to_log: any[];
}