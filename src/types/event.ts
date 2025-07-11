export interface EventLog {
  id: number
  event_type: string
  time: string // ISO 时间字符串
  confidence: number
  image_path?: string | null
  video_clip_path?: string | null
  camera_id?: number | null
}
