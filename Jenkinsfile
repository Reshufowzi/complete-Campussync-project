pipeline {
    agent any

    environment {
        DOCKER_HUB = "your-dockerhub-username"
        FRONTEND_IMAGE = "campusync-client"
        BACKEND_IMAGE = "campusync-server"
    }

    stages {

        stage('Clone Repo') {
            steps {
                git 'https://github.com/your-username/complete-Campussync-project.git'
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('campusyncclient') {
                    sh 'docker build -t $DOCKER_HUB/$FRONTEND_IMAGE:latest .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('compusyncserver') {
                    sh 'docker build -t $DOCKER_HUB/$BACKEND_IMAGE:latest .'
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push $DOCKER_HUB/$FRONTEND_IMAGE:latest'
                sh 'docker push $DOCKER_HUB/$BACKEND_IMAGE:latest'
            }
        }

        stage('Deploy (Optional)') {
            steps {
                echo "Deploy to Kubernetes / EC2 here"
            }
        }
    }
}
