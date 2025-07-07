# 识别-前端

## 项目介绍

## 环境配置
### 环境要求 (Prerequisites)

在开始之前，请确保你的开发环境中已安装以下软件。本项目配置已在 **Node.js v18.x** 环境下验证通过，请务必使用兼容的版本。

  - **Node.js**: **v18.x** (长期支持版 LTS)。

      - **检查版本**: 在终端运行 `node -v`
      - **下载地址**: [https://nodejs.org/](https://nodejs.org/)

### 初始化 (Initialization Steps)

请严格按照以下步骤操作，以确保环境的一致性。

1. 获取项目代码

```bash
git clone git@github.com:xiangluanliang/recognition-client.git
```

2. 安装项目依赖

在项目根目录打开终端，运行以下命令。npm 将会根据 `package.json` 文件下载所有指定的库。

```bash
npm install
npm install element-plus axios #单独安装element组件库
npm install --save-dev vite-plugin-vue-devtools #单独安装Vite插件
```

3. 运行项目 (Running the Project)

```bash
npm run dev
```

云服务器架设前，需要本地后端运行 (`python manage.py runserver`)。

打开浏览器并访问终端中提示的[地址](http://localhost:5173)。

如果一切顺利，你将看到写有“登陆”字样的页面。至此，你的开发环境已搭建完毕。


### 添加一个完整功能接口的标准化流程

**功能目标**：创建一个新页面 `/stats`，用于显示当前登录用户的反馈统计数据。

### 第一步：在API层添加新函数 (`modules/user.js`)

**目标**：让我们的前端代码“知道”这个新后端接口的存在。

1.  **编辑API模块文件**：打开 `src/api/modules/user.js`，添加一个新的导出函数。

    ```javascript
    // src/api/modules/user.js
    import apiClient from '../request.js';

    // ... 已有的 login 和 doubleNum 函数 ...

    /**
     * 获取当前用户的统计数据
     * 这是一个GET请求，不需要传递任何参数，因为后端会通过Token识别用户
     * @returns Promise
     */
    export const getUserStats = () => {
        // apiClient会自动附加认证Token
        return apiClient.get('/me/stats/'); // 假设这是我们为统计功能设定的新URL
    };
    ```

    **请注意**：为了让这个例子能跑通，你需要在后端的 `api/urls.py` 和 `api/views/user_views.py` 中，按照我们之前学到的流程，添加这个 `/me/stats/` 接口。你也可以查询[接口文档](http://127.0.0.1:8000/swagger/)，替换成你需要的接口。

-----

### 第二步：创建新页面组件 (`views/UserStatsView.vue`)

**目标**：创建一个专门的页面来请求并展示用户的统计数据，调用接口即可。

1.  在 `src/views/` 目录下，创建一个新文件 `UserStatsView.vue`。

2.  写入以下代码：

    ```vue
    <template>
    <!-- 此处略 -->
    </template>

    <script setup>
    import { ref, onMounted } from 'vue';
    import API from '@/api'; // 导入我们统一的API对象

    // 定义响应式变量
    const stats = ref(null);
    const loading = ref(true);

    // 定义一个方法来获取数据
    const fetchUserStats = async () => {
      try {
        // 调用API层中定义好的函数
        // 我们不需要关心Token和错误弹窗，拦截器会自动处理
        const response = await API.getUserStats();
        stats.value = response.info; // 将后端返回的核心数据赋值给stats
      } catch (error) {
        console.error("在组件中捕获到获取统计数据失败:", error);
      } finally {
        loading.value = false; // 无论成功失败，都结束加载状态
      }
    };

    // 在组件挂载时自动调用该方法
    onMounted(() => {
      fetchUserStats();
    });
    </script>

    <!-- 样式略 -->
    ```

-----

### 第三步：添加页面路由 (`router/index.js`)

**目标**：为我们的新页面分配一个URL地址，让用户可以通过浏览器访问。这一步只有在创建新的`.vue`文件后才需要做。

1.  **编辑路由文件**：打开 `src/router/index.js`，添加 `/stats` 路由。

    ```javascript
    import { createRouter, createWebHistory } from 'vue-router'
    import HomeView from '../views/HomeView.vue'

    const router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes: [
        // ......若干已有路由
        // --- 添加以下统计页面路由 ---
        {
          path: '/stats',
          name: 'stats',
          component: () => import('../views/UserStatsView.vue')
        }
      ]
    })

    export default router
    ```

