# 识别-前端

## 项目介绍

## 环境配置
### 环境要求 (Prerequisites)

在开始之前，请确保您的开发环境中已安装以下软件。本项目配置已在 **Node.js v18.x** 环境下验证通过，请务必使用兼容的版本。

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

如果一切顺利，您将看到“项目初始化成功”的页面，并收到一条来自后端的成功消息提示。至此，您的开发环境已搭建完毕。