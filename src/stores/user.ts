import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCurrentUser, login, register } from '@/api'
import type { LoginRequest, RegisterRequest, UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const displayName = () => {
    if(!userInfo.value) return ''
    return userInfo.value.nickname || userInfo.value.username
  }

  // 登录
  const doLogin = async (loginData: LoginRequest): Promise<boolean> => {
    try {
      const res = await login(loginData)
      if (res.code === 200 && res.data) {
        token.value = res.data
        username.value = loginData.username
        localStorage.setItem('token', res.data)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // 注册
  const doRegister = async (registerData: RegisterRequest): Promise<boolean> => {
    try {
      const res = await register(registerData)
      return res.code === 200
    } catch {
      return false
    }
  }

  // 登出
  const logout = (): void => {
    token.value = ''
    username.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // 是否已登录
  const isLoggedIn = (): boolean => {
    return !!token.value
  }
  const getUserInfo = async (): Promise<boolean> => {
    if(!token.value) return false
    try {
      const res = await getCurrentUser()
      if(res.code == 200 && res.data) {
        userInfo.value = res.data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return {
    token,
    username,
    userInfo,
    doLogin,
    doRegister,
    logout,
    isLoggedIn,
    getUserInfo,
    displayName
  }
})