// src/api/yolo.js

import request from '@/utils/request'

export function detectVideo(videoFile) {
  const formData = new FormData()
  formData.append('video', videoFile)

  return request.post('yolo-detect/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
