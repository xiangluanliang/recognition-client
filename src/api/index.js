import axios from 'axios';

// 创建一个axios实例
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // 指向你的Django后端API地址
    timeout: 10000,
});

// 定义一个对象来存放所有API方法
const api = {
    // 对应后端的 /api/hello/
    getHelloWorld: function() {
        return apiClient.get('/hello/');
    },

    // 以后可以像这样添加新方法
    // methodaaa: function(data) {
    //     return apiClient.post('/aaa/', data);
    // }
};

export default api;