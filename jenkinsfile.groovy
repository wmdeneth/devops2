pipeline {
    agent any

    triggers {
        // Run docker build annually (every February 14th at 00:00 UTC)
        cron('0 0 14 2 *')
    }

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
                    sh "docker compose build"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                retry(3) {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            timeout 120 bash -c "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        '''
                    }
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
                        set -e
                        cd terraform
                        
                        echo "========== TERRAFORM DIAGNOSTICS =========="
                        echo "Working directory: $(pwd)"
                        echo "Listing files:"
                        ls -la
                        
                        echo ""
                        echo "Checking AWS credentials..."
                        if [ -z "$AWS_ACCESS_KEY_ID" ]; then
                            echo "ERROR: AWS_ACCESS_KEY_ID is not set!"
                            exit 1
                        fi
                        if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
                            echo "ERROR: AWS_SECRET_ACCESS_KEY is not set!"
                            exit 1
                        fi
                        echo "✅ AWS_ACCESS_KEY_ID: ${#AWS_ACCESS_KEY_ID} characters"
                        echo "✅ AWS_SECRET_ACCESS_KEY: ${#AWS_SECRET_ACCESS_KEY} characters"
                        
                        echo ""
                        echo "Checking key file..."
                        if [ -f ../ruhuna-key.pub ]; then
                            echo "✅ Key file found:"
                            ls -lh ../ruhuna-key.pub
                            echo "Key file preview:"
                            head -c 100 ../ruhuna-key.pub
                            echo ""
                        else
                            echo "ERROR: Key file ../ruhuna-key.pub not found!"
                            echo "Listing parent directory:"
                            ls -la ../
                            exit 1
                        fi
                        
                        echo ""
                        echo "Checking Terraform version..."
                        terraform version
                        
                        echo ""
                        echo "Running Terraform init..."
                        terraform init -upgrade
                        
                        echo ""
                        echo "Running Terraform validate..."
                        terraform validate
                        
                        echo ""
                        echo "Running Terraform plan..."
                        terraform plan -out=tfplan
                        
                        echo ""
                        echo "✅ Terraform plan completed successfully!"
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
                sh '''
                    echo "========== DEPLOY DIAGNOSTICS =========="
                    echo "Checking if instance_ip.txt exists..."
                    if [ -f instance_ip.txt ]; then
                        echo "✅ File found:"
                        ls -lh instance_ip.txt
                        echo "Contents:"
                        cat instance_ip.txt
                    else
                        echo "❌ ERROR: instance_ip.txt not found!"
                        echo "Listing files in current directory:"
                        ls -la
                        exit 1
                    fi
                    
                    SERVER_IP=$(cat instance_ip.txt)
                    if [ -z "$SERVER_IP" ]; then
                        echo "❌ ERROR: SERVER_IP is empty!"
                        exit 1
                    fi
                    
                    echo "Server IP: $SERVER_IP"
                    echo "Note: Actual SSH deployment would happen here"
                '''
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
