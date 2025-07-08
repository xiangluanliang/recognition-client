import { defineStore } from "pinia"
import { ref } from "vue"

// 简化的用户信息接口
interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  role: string
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string>("")
  const userInfo = ref<UserInfo>({
    id: 1,
    username: "管理员",
    email: "admin@example.com",
    role: "admin",
  })
  const isLoggedIn = ref<boolean>(true) // 默认已登录状态

  // 简化的登录方法
  const loginAction = async (loginForm: any) => {
    token.value = "mock-token"
    isLoggedIn.value = true
    return { success: true }
  }

  // 简化的登出方法
  const logoutAction = async () => {
    token.value = ""
    isLoggedIn.value = false
  }

  // 初始化用户
  const initUser = async () => {
    // 暂时不做任何操作
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    loginAction,
    logoutAction,
    initUser,
  }
})
