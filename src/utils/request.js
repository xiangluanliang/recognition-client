// src/utils/request.js
import axios from 'axios'

#创建了一个axios实例,配置了一个和后端API通信的客户端.集中管理配置和请求

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // 后端API地址
    timeout: 10000,
})

export default apiClient
