import request from "@/utils/request"
import type { LoginForm, RegisterForm } from "@/types/user"

export const login = (data: LoginForm) => {
  return request.post("/api/login/", data)
}

export const register = (data: RegisterForm) => {
  return request.post("/api/register/", data)
}

export const logout = () => {
  return request.post("/api/logout/")
}

export const getUserInfo = () => {
  return request.get("/api/user/")
}

export const refreshToken = () => {
  return request.post("/api/refresh/")
}
