pipeline {
    agent any

    environment {
        DOCKER_HUB = "reshma0209"
        FRONTEND_IMAGE = "campusync-client"
        BACKEND_IMAGE = "campusync-server"
        TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Build Docker Images') {
            parallel {

                stage('Frontend Build') {
                    steps {
                        dir('campusyncclient') {
                            sh """
                            docker build -t $DOCKER_HUB/$FRONTEND_IMAGE:$TAG .
                            """
                        }
                    }
                }

                stage('Backend Build') {
                    steps {
                        dir('compusyncserver') {
                            sh """
                            docker build -t $DOCKER_HUB/$BACKEND_IMAGE:$TAG .
                            """
                        }
                    }
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
            parallel {

                stage('Push Frontend') {
                    steps {
                        sh 'docker push $DOCKER_HUB/$FRONTEND_IMAGE:$TAG'
                    }
                }

                stage('Push Backend') {
                    steps {
                        sh 'docker push $DOCKER_HUB/$BACKEND_IMAGE:$TAG'
                    }
                }
            }
        }

        stage('Tag as Latest') {
            steps {
                sh """
                docker tag $DOCKER_HUB/$FRONTEND_IMAGE:$TAG $DOCKER_HUB/$FRONTEND_IMAGE:latest
                docker tag $DOCKER_HUB/$BACKEND_IMAGE:$TAG $DOCKER_HUB/$BACKEND_IMAGE:latest

                docker push $DOCKER_HUB/$FRONTEND_IMAGE:latest
                docker push $DOCKER_HUB/$BACKEND_IMAGE:latest
                """
            }
        }

        stage('Run Containers') {
            steps {
                sh """
                # Stop old containers if running
                docker rm -f frontend-container || true
                docker rm -f backend-container || true

                # Run backend
                docker run -d -p 5000:5000 --name backend-container \
                $DOCKER_HUB/$BACKEND_IMAGE:latest

                # Run frontend
                docker run -d -p 3000:80 --name frontend-container \
                $DOCKER_HUB/$FRONTEND_IMAGE:latest
                """
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }

        stage('Logs') {
            steps {
                sh 'docker logs backend-container || true'
                sh 'docker logs frontend-container || true'
            }
        }

        stage('Cleanup') {
            steps {
                sh """
                docker rmi $DOCKER_HUB/$FRONTEND_IMAGE:$TAG || true
                docker rmi $DOCKER_HUB/$BACKEND_IMAGE:$TAG || true
                """
            }
        }

        stage('Deploy (Optional)') {
            steps {
                echo "Deployment ready using tag: $TAG"
            }
        }
    }
}
