pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    string(name: 'DOCKERHUB_ORG', defaultValue: 'wmdeneth', description: 'Docker Hub org/username to push images to')
    string(name: 'IMAGE_BASENAME', defaultValue: 'doc3', description: 'Base name for images, full names will be <org>/<basename>-backend and <org>/<basename>-frontend')
    string(name: 'DOCKERHUB_CREDENTIALS_ID', defaultValue: 'doc4', description: 'Jenkins credentials ID for Docker Hub (Username with password)')
    choice(name: 'TAG_STRATEGY', choices: ['sha', 'latest', 'both'], description: 'Which tags to push: commit SHA, latest, or both')
    string(name: 'EXTRA_TAG', defaultValue: '', description: 'Optional extra tag to push (e.g. 1.0.0). Leave empty to skip')
  }

  environment {
    BACKEND_CONTEXT = 'backend'
    FRONTEND_CONTEXT = 'frontend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.BRANCH_SAFE = env.BRANCH_NAME ? env.BRANCH_NAME.replaceAll('[^A-Za-z0-9._-]','-') : 'unknown'
        }
        echo "Branch: ${env.BRANCH_NAME}, Commit: ${env.COMMIT_SHORT}"
      }
    }

    stage('Prepare Node builds') {
      steps {
        dir('backend') {
          sh 'npm ci || npm install'
        }
        dir('frontend') {
          sh 'npm ci || npm install'
          // Optional compile check for React app
          sh 'npm run build'
        }
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(credentialsId: params.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
        }
      }
    }

    stage('Build images') {
      steps {
        script {
          def org = params.DOCKERHUB_ORG
          def base = params.IMAGE_BASENAME
          env.BACKEND_IMAGE = "${org}/${base}-backend"
          env.FRONTEND_IMAGE = "${org}/${base}-frontend"

          // Build docker images
          sh """
            docker build -t ${BACKEND_IMAGE}:build-${COMMIT_SHORT} ${BACKEND_CONTEXT}
            docker build -t ${FRONTEND_IMAGE}:build-${COMMIT_SHORT} ${FRONTEND_CONTEXT}
          """
        }
      }
    }

    stage('Tag and Push') {
      steps {
        script {
          def tags = []
          if (params.TAG_STRATEGY == 'sha' || params.TAG_STRATEGY == 'both') {
            tags << env.COMMIT_SHORT
          }
          if (params.TAG_STRATEGY == 'latest' || params.TAG_STRATEGY == 'both') {
            // Only push latest for main/master by default; adjust if desired
            if ((env.BRANCH_NAME == 'main') || (env.BRANCH_NAME == 'master')) {
              tags << 'latest'
            } else {
              echo "Skipping latest tag because branch is ${env.BRANCH_NAME}"
            }
          }
          if (params.EXTRA_TAG?.trim()) {
            tags << params.EXTRA_TAG.trim()
          }

          if (tags.isEmpty()) {
            error 'No tags to push. Adjust TAG_STRATEGY or EXTRA_TAG.'
          }

          // Tag both images for each tag and push
          for (t in tags) {
            sh """
              docker tag ${BACKEND_IMAGE}:build-${COMMIT_SHORT} ${BACKEND_IMAGE}:${t}
              docker tag ${FRONTEND_IMAGE}:build-${COMMIT_SHORT} ${FRONTEND_IMAGE}:${t}
              docker push ${BACKEND_IMAGE}:${t}
              docker push ${FRONTEND_IMAGE}:${t}
            """
          }
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
      // Cleanup dangling build tags
      sh '''
        docker rmi ${BACKEND_IMAGE}:build-${COMMIT_SHORT} || true
        docker rmi ${FRONTEND_IMAGE}:build-${COMMIT_SHORT} || true
      '''
      cleanWs()
    }
  }
}
