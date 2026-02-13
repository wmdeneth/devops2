pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "wmdeneth/frontend-app"
        BACKEND_IMAGE = "wmdeneth/backend-app"
        GIT_REPO = "https://github.com/wmdeneth/devops2.git"
        AWS_DEFAULT_REGION = "us-east-1"
        TF_VAR_frontend_image = "${FRONTEND_IMAGE}:latest"
        TF_VAR_backend_image = "${BACKEND_IMAGE}:latest"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile frontend"
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

        stage('Push Docker Images') {
            steps {
                script {
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Terraform Init & Plan') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        cd terraform
                        terraform init
                        terraform plan -out=tfplan
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        cd terraform
                        terraform apply -auto-approve tfplan
                        terraform output -raw instance_ip > ../instance_ip.txt
                    '''
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                sshagent(credentials: ['AWS_SSH_KEY']) {
                    sh '''
                        # Get the instance IP from Terraform output
                        SERVER_IP=$(cat instance_ip.txt)
                        
                        # Wait for SSH to be ready
                        echo "Waiting for EC2 instance to be ready..."
                        for i in {1..30}; do
                            ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$SERVER_IP "echo 'SSH ready'" && break
                            sleep 10
                        done
                        
                        # Copy docker-compose file
                        scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@$SERVER_IP:~/
                        
                        # Deploy using Docker Compose
                        ssh -o StrictHostKeyChecking=no ubuntu@$SERVER_IP '
                            export DOCKER_HOST=unix:///var/run/docker.sock
                            docker-compose -f ~/docker-compose.yml pull
                            docker-compose -f ~/docker-compose.yml up -d
                            docker-compose -f ~/docker-compose.yml ps
                        '
                        
                        echo "Deployment complete! Application available at http://$SERVER_IP"
                    '''
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
        success {
            echo "✅ Deployment successful to http://3.83.237.70"
        }
        failure {
            echo "❌ Deployment failed. Check logs above."
        }
    }
}
