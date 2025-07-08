import request from "@/utils/request"
import type { LoginForm, RegisterForm } from "@/types/user"

export const login = (data: LoginForm) => {
  return request.post("/auth/login/", data)
}

export const register = (data: RegisterForm) => {
  return request.post("/auth/register/", data)
}

export const logout = () => {
  return request.post("/auth/logout/")
}

export const getUserInfo = () => {
  return request.get("/auth/user/")
}

export const refreshToken = () => {
  return request.post("/auth/refresh/")
}
