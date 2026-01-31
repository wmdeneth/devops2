pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "wmdeneth/frontend-app"
        BACKEND_IMAGE = "wmdeneth/backend-app"
        GIT_REPO = "https://github.com/wmdeneth/devops2.git"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile frontend"
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    sh "docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile backend"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to AWS') {
            environment {
                SERVER_IP = credentials('INVENTORY_SERVER_IP')
            }
            steps {
                sshagent(credentials: ['AWS_SSH_KEY']) {
                    sh """
                        # 1. Copy compose file to AWS
                        scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@${SERVER_IP}:~/
                        
                        # 2. Deploy using Docker Compose
                        ssh -o StrictHostKeyChecking=no ubuntu@${SERVER_IP} '
                            docker-compose pull
                            docker-compose up -d
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
    }
}
