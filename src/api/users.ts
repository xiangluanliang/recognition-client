// api/user.ts
import request from "@/utils/request"

export const getUserCount = () => {
  return request.get('/users/count/')
}
