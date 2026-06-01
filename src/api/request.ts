import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types'
import { useUserStore } from '@/stores/user'
// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.token = `${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<Result<any>>) => {
    return response.data
  },
  (error) => {
    const userStore = useUserStore()
    if (error.response?.status === 401) {
      userStore.logout()
      // window.location.href = '/login'
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

export default request