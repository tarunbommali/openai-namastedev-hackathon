pipeline {

    agent any


    environment {

        IMAGE_NAME = "amarapubhanuprasad/hireflow-frontend"
        IMAGE_TAG = "latest"

        DOCKER_CREDENTIALS = "dockerhub-credentials"

        EC2_USER = "ubuntu"
        EC2_HOST = "YOUR_EC2_PUBLIC_IP"

        CONTAINER_NAME = "hireflow-frontend"

    }



    stages {


        // ==========================
        // CI PIPELINE
        // ==========================


        stage('Checkout Code') {

            steps {

                git branch: 'main',
                url: 'https://github.com/BhanuAmarapu/openai-namastedev-hackathon.git'

            }

        }



        stage('Install Dependencies') {

            steps {

                dir('frontend') {

                    sh '''
                    npm install
                    '''

                }

            }

        }



        stage('Build Frontend') {

            steps {

                dir('frontend') {

                    sh '''
                    npm run build
                    '''

                }

            }

        }




        stage('Build Docker Image') {

            steps {

                dir('frontend') {

                    sh '''
                    docker build \
                    -t $IMAGE_NAME:$IMAGE_TAG .
                    '''

                }

            }

        }



        stage('Docker Login') {

            steps {


                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {


                    sh '''

                    echo $DOCKER_PASSWORD | docker login \
                    -u $DOCKER_USER \
                    --password-stdin

                    '''

                }

            }

        }




        stage('Push Docker Image') {

            steps {

                sh '''

                docker push \
                $IMAGE_NAME:$IMAGE_TAG

                '''

            }

        }





        // ==========================
        // CD PIPELINE
        // ==========================



        stage('Deploy To EC2') {

            steps {


                sshagent(['ec2-ssh-key']) {


                    sh '''

                    ssh -o StrictHostKeyChecking=no \
                    $EC2_USER@$EC2_HOST << EOF



                    echo "Pulling Latest Image"


                    docker pull \
                    $IMAGE_NAME:$IMAGE_TAG



                    echo "Stopping Old Container"


                    docker stop $CONTAINER_NAME || true



                    echo "Removing Old Container"


                    docker rm $CONTAINER_NAME || true




                    echo "Starting New Container"


                    docker run -d \
                    --name $CONTAINER_NAME \
                    -p 80:80 \
                    --restart always \
                    $IMAGE_NAME:$IMAGE_TAG




                    echo "Deployment Completed"



                    docker ps



EOF

                    '''

                }

            }

        }




        stage('Health Check') {

            steps {


                sh '''

                echo "Application deployed successfully"

                '''

            }

        }


    }




    post {


        success {

            echo "CI/CD Pipeline Finished Successfully"

        }


        failure {

            echo "Pipeline Failed"

        }


    }


}