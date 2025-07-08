pipeline {
    agent any

    // 定义一个环境变量，用来存放部署的根目录
    environment {
        DEPLOY_PATH = '/var/www/recognition-client'
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins会自动根据分支拉取代码
                echo "正在拉取分支: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '执行 npm install'
                // 使用官方推荐的node工具来确保环境隔离和正确性
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Project') {
            steps {
                echo "为分支 ${env.BRANCH_NAME} 进行打包"
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                    // 关键步骤: 根据分支名设置Vue的publicPath，确保资源路径正确
                    sh "npm run build -- --base=/${env.BRANCH_NAME}/"
                }
            }
        }

        stage('Deploy') {
            steps {
                // 根据分支名，部署到对应的子目录
                echo "部署到目录: ${DEPLOY_PATH}/${env.BRANCH_NAME}"
                sh "cp -R dist/* ${DEPLOY_PATH}/${env.BRANCH_NAME}/"
                echo '部署成功!'
            }
        }
    }
}