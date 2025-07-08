pipeline {
    agent any

    environment {
        DEPLOY_PATH = '/var/www/recognition-client'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "正在拉取分支: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '执行 npm install'
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                    sh '''
                        npm config set registry https://registry.npmmirror.com
                        rm -rf node_modules package-lock.json
                        npm install --legacy-peer-deps
                    '''
                }
            }
        }

        stage('Build Project') {
            steps {
                echo "为分支 ${env.BRANCH_NAME} 进行打包"
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                sh "VITE_BASE=/${env.BRANCH_NAME}/ npm run build"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "部署到目录: ${DEPLOY_PATH}/${env.BRANCH_NAME}"
                sh "cp -R dist/* ${DEPLOY_PATH}/${env.BRANCH_NAME}/"
                echo '部署成功!'
            }
        }
    }
}