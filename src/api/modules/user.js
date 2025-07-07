import apiClient from '../request.js';

export const login = (data) => {
    // DRF的 obtain_auth_token 视图需要表单数据
    return apiClient.post('/token-auth/', new URLSearchParams(data), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // 告诉拦截器不要为这个特定请求附加Token头
        // 因为登录本身就是为了获取Token
        transformRequest: [(data, headers) => {
            delete headers['Authorization'];
            return data;
        }]
    });
};