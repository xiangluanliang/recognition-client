export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  role: string
  created_at: string
}
