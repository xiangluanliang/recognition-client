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
  const token = ref<string>("a166fff2de4dea199779a23a0c27aa466017364e")
  const userInfo = ref<UserInfo>({
    id: 1,
    username: "管理员",
    email: "admin@example.com",
    role: "admin",
  })
  const isLoggedIn = ref<boolean>(false)  // 默认未登录

  // 模拟登录的方法
  const loginAction = async (_loginForm: any) => {
    // 模拟从后端获取 Token
    // 如果你有一个后端接口，通常会在这里做 API 请求
    token.value = "ee0fa6bbb779010c0d9c56a853016b138ff18601"  // 模拟 Token
    isLoggedIn.value = true
    userInfo.value = {
      id: 1,
      username: "testuser",
      email: "testuser@example.com",
      role: "admin",
    }
    return { success: true }
  }

  // 登出方法
  const logoutAction = async () => {
    token.value = ""  // 清空 Token
    isLoggedIn.value = false  // 设置为未登录
  }

  // 初始化用户信息
  const initUser = async () => {
    // 你可以在这里做其他初始化操作，如果需要的话
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
