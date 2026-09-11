import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:3301',
  timeout: 10000, // 超时 10秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可在这里添加token
    // config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

export default service
