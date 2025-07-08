import axios from "axios"
import { ElMessage } from "element-plus"
import { useUserStore } from "@/store/user"

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

const userStore = useUserStore()

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      userStore.logoutAction()
      ElMessage.error("登录已过期，请重新登录")
    } else {
      ElMessage.error(error.response?.data?.message || "请求失败")
    }
    return Promise.reject(error)
  },
)

export default request
