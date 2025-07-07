import axios from 'axios';
import { ElMessage } from 'element-plus';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000,
});

// 请求拦截器：自动附加Token
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('user_token');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器：统一处理错误和数据结构
apiClient.interceptors.response.use(response => {
    // DRF的obtain_auth_token成功时直接返回数据，没有code字段
    // 所以我们直接返回response.data
    // 对于我们自己写的其他接口，可以遵循code判断的逻辑
    const res = response.data;
    if (res.code !== undefined && res.code !== 0) {
        ElMessage.error(res.message || 'Error');
        return Promise.reject(new Error(res.message || 'Error'));
    }
    return res; // 直接返回整个响应体数据
}, error => {
    ElMessage.error(error.response?.data?.non_field_errors?.[0] || error.message || '服务器错误');
    return Promise.reject(error);
});

export default apiClient;