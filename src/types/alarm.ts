export interface AlarmLog {
  id: number
  source_type: string
  source_id: number
  time: string
  method: string
  receiver: string
  result?: string
}
