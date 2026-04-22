pipeline {
    agent any

    environment {
        DOCKER_HUB = "reshma0209"
        FRONTEND_IMAGE = "campusync-client"
        BACKEND_IMAGE = "campusync-server"
        TAG = "${BUILD_NUMBER}"

        DB_NAME = "compussync"
        DB_USER = "root"
        DB_PASSWORD = "NAveen@9393"
        DB_PORT = "3306"
    }

    stages {

        stage('Build Images') {
            parallel {

                stage('Frontend Build') {
                    steps {
                        dir('campusyncclient') {
                            sh 'docker build -t $DOCKER_HUB/$FRONTEND_IMAGE:$TAG .'
                        }
                    }
                }

                stage('Backend Build') {
                    steps {
                        dir('compusyncserver') {
                            sh 'docker build -t $DOCKER_HUB/$BACKEND_IMAGE:$TAG .'
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
            steps {
                sh 'docker push $DOCKER_HUB/$FRONTEND_IMAGE:$TAG'
                sh 'docker push $DOCKER_HUB/$BACKEND_IMAGE:$TAG'
            }
        }

        stage('Tag Latest') {
            steps {
                sh """
                docker tag $DOCKER_HUB/$FRONTEND_IMAGE:$TAG $DOCKER_HUB/$FRONTEND_IMAGE:latest
                docker tag $DOCKER_HUB/$BACKEND_IMAGE:$TAG $DOCKER_HUB/$BACKEND_IMAGE:latest

                docker push $DOCKER_HUB/$FRONTEND_IMAGE:latest
                docker push $DOCKER_HUB/$BACKEND_IMAGE:latest
                """
            }
        }

        stage('Create Network') {
            steps {
                sh 'docker network create campusync-network || true'
            }
        }

        stage('Run MySQL Container') {
            steps {
                sh """
                docker rm -f mysql-container || true

                docker run -d \
                --name mysql-container \
                --network campusync-network \
                -e MYSQL_ROOT_PASSWORD=$DB_PASSWORD \
                -e MYSQL_DATABASE=$DB_NAME \
                -p 3306:3306 \
                mysql:8
                """
            }
        }

        stage('Run Backend Container') {
            steps {
                sh """
                docker rm -f backend-container || true

                docker run -d \
                --name backend-container \
                --network campusync-network \
                -p 5000:5000 \
                -e DB_HOST=mysql-container \
                -e DB_USER=$DB_USER \
                -e DB_PASSWORD=$DB_PASSWORD \
                -e DB_PORT=$DB_PORT \
                -e DB_NAME=$DB_NAME \
                $DOCKER_HUB/$BACKEND_IMAGE:latest
                """
            }
        }

        stage('Run Frontend Container') {
            steps {
                sh """
                docker rm -f frontend-container || true

                docker run -d \
                --name frontend-container \
                --network campusync-network \
                -p 3000:80 \
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
    }
}
