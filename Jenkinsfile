pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        DEPLOY_PATH_PROD = "/var/www/frontend-prod"
        DEPLOY_PATH_TEST = "/var/www/frontend-test"
        VITE_API_URL_PROD = "http://127.0.0.1:8000/api" // 替换为后端正式IP和端口
        VITE_API_URL_TEST = "http://127.0.0.1:8088/api" // 替换为后端测试IP和端口
    }

    stages {
        stage('1. Clone Repository') {
            steps {
                // 从你的GitHub仓库拉取代码
                git branch: env.BRANCH_NAME, credentialsId: 'github_rsa', url: 'git@github.com:xiangluanliang/recognition-client.git'
            }
        }

        stage('2. Install Dependencies') {
            steps {
                // 安装项目依赖
                sh 'npm install'
            }
        }

        stage('3. Build & Deploy') {
            stages {
                stage('Deploy to Test') {
                    when { branch 'test' }
                    steps {
                        echo "Building for Test Environment..."
                        // 注入测试环境的API地址进行构建
                        sh "VITE_API_BASE_URL=${env.VITE_API_URL_TEST} npm run build"

                        echo "Deploying to Test Server..."
                        // 将构建好的文件复制到测试目录
                        sh "cp -R dist/* ${env.DEPLOY_PATH_TEST}/"
                    }
                }

                stage('Deploy to Production') {
                    when { branch 'master' }
                    steps {
                        echo "Building for Production Environment..."
                        // 注入生产环境的API地址进行构建
                        sh "VITE_API_BASE_URL=${env.VITE_API_URL_PROD} npm run build"

                        echo "Deploying to Production Server..."
                        // 将构建好的文件复制到正式目录
                        sh "cp -R dist/* ${env.DEPLOY_PATH_PROD}/"
                    }
                }
            }
        }
    }

    post {
        always {
            // 清理工作区
            cleanWs()
        }
    }
}