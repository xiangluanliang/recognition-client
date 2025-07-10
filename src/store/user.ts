import { defineStore } from "pinia"
import { ref } from "vue"
import request from '@/utils/request'

interface UserInfo {
  id: number
  username: string
  email: string
  status: number
  created_at: string
  role_id:number
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string>("")
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref(false)

  const loginAction = async (loginForm: { username: string; password: string }) => {
  try {
    const res = await request.post('/login/', loginForm)
    // 这里直接用res，因为response拦截器已经返回res.data了,
    // 不要管这个报错，不要改
    token.value = res.token
    userInfo.value = res.user
    isLoggedIn.value = true

    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(res.user))
    return { success: true }
  } catch (error: any) {
    const rawMessage =
      error.response?.data?.non_field_errors?.[0] ||
      error.response?.data?.detail ||
      error.response?.data?.message
    let message = rawMessage

    if (
      rawMessage === '无法使用提供的凭据登录。' ||
      rawMessage === 'Unable to log in with provided credentials.'
    ) {
      message = '用户不存在，请先注册'
    }

    return { success: false, message: message || '登录失败' }
  }
}



  const logoutAction = () => {
    token.value = ""
    userInfo.value = null
    isLoggedIn.value = false

    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const initUser = () => {
    const localToken = localStorage.getItem('token')
    const localUser = localStorage.getItem('userInfo')

    if (localToken && localUser) {
      token.value = localToken
      userInfo.value = JSON.parse(localUser)
      isLoggedIn.value = true
    }
  }

  const registerAction = async (registerForm: {
  username: string
  password: string
  email: string
}) => {
  try {
    const res = await request.post('/register/', registerForm)
    return { success: true, message: res.message || '注册成功！' }
  } catch (error: any) {
    const errors = error.response?.data
    let message = '注册失败'
    if (errors?.username?.[0]) {
      message = `用户名错误：${errors.username[0]}`
    } else if (errors?.email?.[0]) {
      message = `邮箱错误：${errors.email[0]}`
    } else if (errors?.password?.[0]) {
      message = `密码错误：${errors.password[0]}`
    }
    return { success: false, message }
  }
}


  return {
    token,
    userInfo,
    isLoggedIn,
    loginAction,
    logoutAction,
    initUser,
    registerAction
  }
})
