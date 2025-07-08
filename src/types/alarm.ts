export interface AlarmItem {
  id: number
  title: string
  description: string
  level: "high" | "medium" | "low"
  type: string
  location: string
  status: "unprocessed" | "processing" | "processed"
  created_at: string
  updated_at: string
  image_url?: string
  video_url?: string
}

export interface AlarmStats {
  total: number
  unprocessed: number
  processing: number
  processed: number
  today_count: number
}
