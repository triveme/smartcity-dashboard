pipeline {
    environment {
        EMAIL_TO = 'smart.city@edag.com'
        NEXUS_REGISTRY = 'nexus.edag.de:8206'
        NEXUS_REPO = 'mobit-malaysia'
        NEXUS_PROJECT = 'scs'
        GITHUB_REGISTRY = 'docker.pkg.github.com/triveme/smartcity-dashboard'
        NKF_REGISTRY = 'edagacr.azurecr.io'
        NGSI_SERVICE = 'ngsi-service'
        DASHBOARD_SERVICE = 'dashboard-service'
        ORCHIDEO_CONNECT_SERVICE = 'orchideo-connect-service'
        MAIL_SERVICE = 'mail-service'
        INFOPIN_SERVICE = 'infopin-service'
        STATIC_DATA_SERVICE = 'static-data-service'
        REPORT_SERVICE = 'report-service'
        USI_PLATFORM_SERVICE = 'usi-platform-service'
        FRONTEND = 'frontend'
        MIGRATIONS = 'migrations'
        IMAGE_TAG = ''
        DOCKERFILE_NGSI_SERVICE = 'Dockerfile.ngsi-service'
        DOCKERFILE_DASHBOARD_SERVICE = 'Dockerfile.dashboard-service'
        DOCKERFILE_ORCHIDEO_CONNECT_SERVICE = 'Dockerfile.orchideo-connect-service'
        DOCKERFILE_FRONTEND = 'Dockerfile.frontend'
        DOCKERFILE_FRONTEND_BASEPATH = 'Dockerfile.frontend-with-basepath'
        DOCKERFILE_MIGRATIONS = 'Dockerfile.migrations'
        DOCKERFILE_MAIL_SERVICE = 'Dockerfile.mail-service'
        DOCKERFILE_INFOPIN_SERVICE = 'Dockerfile.infopin-service'
        DOCKERFILE_STATIC_DATA_SERVICE = 'Dockerfile.static-data-service'
        DOCKERFILE_REPORT_SERVICE = 'Dockerfile.report-service'
        DOCKERFILE_USI_PLATFORM_SERVICE = 'Dockerfile.usi-platform-service'
        USE_GITHUB_REGISTRY = false
        USE_NKF_REGISTRY = false
    }

    agent {
        kubernetes {
          yaml '''
          apiVersion: v1
          kind: Pod
          spec:
            containers:
            - name: npm
              image: node:20.11.0-bullseye
              command: ["cat"]
              tty: true
            - name: postgres
              image: postgres:13
              env:
              - name: POSTGRES_PASSWORD
                value: "postgres"
              - name: POSTGRES_DB
                value: "scs"
              tty: true
            - name: docker
              image: docker:20.10-dind
              command: ["sh", "-c", "dockerd-entrypoint.sh & exec tail -f /dev/null"]
              tty: true
              securityContext:
                privileged: true
            - name: clamav
              image: clamav/clamav
              tty: true
          '''
        }
    }

    stages {
      stage('Set Certificates') {
        steps {
            container('npm') {
                sh '''
                wget https://crl.edag.de/EDAG%20Engineering.crt -O edag-ssl.crt
                '''
            }
        }
      }

      stage('Checkout') {
        steps {
            checkout scm
        }
      }

      stage('Install Dashboard Dependencies') {
        steps {
            container('npm') {
                dir('microservices') {
                    echo "Installing Microservice Dependencies:"
                    sh "npm ci"
                }
                dir('frontend') {
                    echo "Installing Frontend Dependencies:"
                    sh "npm ci --force"
                }
            }
        }
      }

      stage('Run Tests') {
            steps {
                container('docker') {
                    withEnv(["NODE_ENV=test"]) {
                        withCredentials([usernamePassword(credentialsId: 'smartcity-nexus', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                            sh "docker login -u ${NEXUS_USER} -p ${NEXUS_PASS} ${NEXUS_REGISTRY}/${NEXUS_REPO}"
                            sh "docker pull ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/postgres:latest"
                        }
                        // Start the PostgreSQL container
                        script {
                            def postgresContainer = docker.image('nexus.edag.de:8206/mobit-malaysia/scs/postgres:latest').run("-e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=testing")
                            def containerId = postgresContainer.id.trim()
                            env.CONTAINER_ID = containerId
                            // Get PostgreSQL Host IP
                            def host = sh(script: "docker inspect --format '{{.NetworkSettings.IPAddress}}' ${containerId}", returnStdout: true).trim()
                            // Print PostgreSQL Host
                            println "PostgreSQL Host IP: ${host}"
                            // Set POSTGRES_HOST environment variable
                            env.POSTGRES_HOST = host
                        }
                        // Wait for PostgreSQL to be ready
                        sh 'sleep 15'
                    }
                }
                container('npm') {
                    withEnv([
                      "POSTGRES_HOST=${env.POSTGRES_HOST}",
                      "NODE_ENV=test",
                      "KEYCLOAK_CLIENT_ID=test-client",
                      "KEYCLOAK_CLIENT_SECRET=hlAMTAKxCfhXwC3YtBDtTC1Ct78vagYQ",
                      "KEYCLOAK_CLIENT_URI=https://mit-smartcity-suite-test-keycloak.container.edag/realms/testrealm/protocol/openid-connect/token",
                      "NEST_JWKS_URI=https://mit-smartcity-suite-test-keycloak.container.edag/realms/testrealm/protocol/openid-connect/certs"
                    ]) {
                        script {
                            // Finding the root path of the project in the jenkins context
                            def projectRoot = sh(script: "pwd", returnStdout: true).trim()
                            // Pointing the env var to our .pem file
                            env.NODE_EXTRA_CA_CERTS = "${projectRoot}/k8s/helm/certificates/trusted_ca.pem"
                        }
                        sh "npm install"
                        // Generate database migration scripts
                        sh "npm run db:gen"
                        // Run database migration scripts on test db
                        sh "npm run db:migrate:test"
                        // Export the NODE CA & Run e2e tests
                        sh "export NODE_EXTRA_CA_CERTS=${env.NODE_EXTRA_CA_CERTS} && npm run test:e2e"
                    }
                }
            }
        }


      // stage('Virus Scan') {
      //   steps {
      //     container('clamav') {
      //       sh '''clamscan -ir . \
      //           --alert-encrypted-doc=yes \
      //           --alert-encrypted-archive=yes \
      //           --alert-encrypted=yes \
      //           --alert-macros=yes \
      //           --alert-broken=yes \
      //           --exclude-dir=src/test \
      //           --exclude-dir=target/test-classes'''
      //     }
      //   }
      // }

      stage('Set City Registry Flag') {
        steps {
            script {
                def branchName = env.BRANCH_NAME

                // Set EDAG Github registry flag to true if the branch is "main"
                USE_GITHUB_REGISTRY = (branchName == 'main')
                println("USE_GITHUB_REGISTRY set to: ${USE_GITHUB_REGISTRY}")

                // Set NKF image registry flag to true if the branch is "main"
                USE_NKF_REGISTRY = (branchName == 'main')
                println("USE_NKF_REGISTRY set to: ${USE_NKF_REGISTRY}")
            }
        }
      }

      stage('Image Tag') {
        steps {
          script {
              def branchName = env.BRANCH_NAME

              if (branchName == 'dev') {
                  IMAGE_TAG = 'latest-dev'
              } else if (branchName.startsWith('feature/')) {
                  IMAGE_TAG = 'latest-feature'
              } else if (branchName.startsWith('bugfix/')) {
                  IMAGE_TAG = 'latest-bugfix'
              } else if (branchName.startsWith('testing/')) {
                  IMAGE_TAG = 'latest-testing'
              } else if (branchName.startsWith('PR-')) {
                  IMAGE_TAG = 'latest-PR'
              } else if (branchName == 'main') {
                  def version = sh(script: "grep VERSION .env | cut -d '=' -f2", returnStdout: true).trim()
                  IMAGE_TAG = version
              } else if (branchName == 'public') {
                  def version = sh(script: "grep VERSION .env | cut -d '=' -f2", returnStdout: true).trim()
                  IMAGE_TAG = version
              } else {
                // If branch is not dev or a feature-branch, do not publish.
                  echo "Skipping registry repository publish for branch: ${branchName}"
                  currentBuild.result = 'ABORTED'
              }
              println("Image tag determined: ${IMAGE_TAG}")
          }
        }
      }

        stage('Build Docker Images') {
            steps {
                container('docker') {
                    sh "docker build -t smartcity/migrations -f ${DOCKERFILE_MIGRATIONS} ."
                    dir('microservices') {
                      sh "docker build -t smartcity/dashboard-service -f ${DOCKERFILE_DASHBOARD_SERVICE} ."
                      sh "docker build -t smartcity/ngsi-service -f ${DOCKERFILE_NGSI_SERVICE} ."
                      sh "docker build -t smartcity/orchideo-connect-service -f ${DOCKERFILE_ORCHIDEO_CONNECT_SERVICE} ."
                      sh "docker build -t smartcity/mail-service -f ${DOCKERFILE_MAIL_SERVICE} ."
                      sh "docker build -t smartcity/infopin-service -f ${DOCKERFILE_INFOPIN_SERVICE} ."
                      sh "docker build -t smartcity/static-data-service -f ${DOCKERFILE_STATIC_DATA_SERVICE} ."
                      sh "docker build -t smartcity/report-service -f ${DOCKERFILE_REPORT_SERVICE} ."
                      sh "docker build -t smartcity/usi-platform-service -f ${DOCKERFILE_USI_PLATFORM_SERVICE} ."
                    }
                    dir('frontend') {
                      sh "docker build -t smartcity/frontend -f ${DOCKERFILE_FRONTEND} ."
                      sh "docker build -t smartcity/frontend-with-basepath -f ${DOCKERFILE_FRONTEND_BASEPATH} ."
                    }
                }
            }
        }

/* --------------------------- EDAG Nexus Specific Image Artifactory Push ------------------------*/

      stage('Push Images to EDAG Nexus') {
        steps {
          container('docker') {
            sh "docker tag smartcity/migrations ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${MIGRATIONS}:${IMAGE_TAG}"
            sh "docker tag smartcity/dashboard-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${DASHBOARD_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/ngsi-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${NGSI_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/orchideo-connect-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${ORCHIDEO_CONNECT_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/mail-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${MAIL_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/infopin-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${INFOPIN_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/static-data-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${STATIC_DATA_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/report-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${REPORT_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/usi-platform-service ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${USI_PLATFORM_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/frontend ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${FRONTEND}:${IMAGE_TAG}"
            sh "docker tag smartcity/frontend-with-basepath ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${FRONTEND}:${IMAGE_TAG}-with-basepath"
            withCredentials([usernamePassword(credentialsId: 'smartcity-nexus', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
              sh "docker login -u ${NEXUS_USER} -p ${NEXUS_PASS} ${NEXUS_REGISTRY}/${NEXUS_REPO}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${MIGRATIONS}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${DASHBOARD_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${NGSI_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${ORCHIDEO_CONNECT_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${MAIL_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${INFOPIN_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${STATIC_DATA_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${REPORT_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${USI_PLATFORM_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${FRONTEND}:${IMAGE_TAG}"
              sh "docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/${NEXUS_PROJECT}/${FRONTEND}:${IMAGE_TAG}-with-basepath"
            }
          }
        }
      }

/* --------------------------- EDAG Github Specific Image Artifactory Push ------------------------*/

      stage('Push Images to EDAG Github') {
        when {
            expression { USE_GITHUB_REGISTRY }
        }
        steps {
          container('docker') {
            sh "docker tag smartcity/migrations ${GITHUB_REGISTRY}/${MIGRATIONS}:${IMAGE_TAG}"
            sh "docker tag smartcity/dashboard-service ${GITHUB_REGISTRY}/${DASHBOARD_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/ngsi-service ${GITHUB_REGISTRY}/${NGSI_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/orchideo-connect-service ${GITHUB_REGISTRY}/${ORCHIDEO_CONNECT_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/mail-service ${GITHUB_REGISTRY}/${MAIL_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/infopin-service ${GITHUB_REGISTRY}/${INFOPIN_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/static-data-service ${GITHUB_REGISTRY}/${STATIC_DATA_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/report-service ${GITHUB_REGISTRY}/${REPORT_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/usi-platform-service ${GITHUB_REGISTRY}/${USI_PLATFORM_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/frontend ${GITHUB_REGISTRY}/${FRONTEND}:${IMAGE_TAG}"
            sh "docker tag smartcity/frontend-with-basepath ${GITHUB_REGISTRY}/${FRONTEND}:${IMAGE_TAG}-with-basepath"
            withCredentials([usernamePassword(credentialsId: 'smartcity-github', usernameVariable: 'GITHUB_USER', passwordVariable: 'GITHUB_PASS')]) {
              sh "docker login -u ${GITHUB_USER} -p ${GITHUB_PASS} ${GITHUB_REGISTRY}"
              sh "docker push ${GITHUB_REGISTRY}/${MIGRATIONS}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${DASHBOARD_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${NGSI_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${ORCHIDEO_CONNECT_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${MAIL_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${INFOPIN_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${STATIC_DATA_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${REPORT_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${USI_PLATFORM_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${FRONTEND}:${IMAGE_TAG}"
              sh "docker push ${GITHUB_REGISTRY}/${FRONTEND}:${IMAGE_TAG}-with-basepath"
            }
          }
        }
      }

/* --------------------------- NKF Project Specific Image Artifactory Push ------------------------*/

      stage('Push Images to NKF Registry') {
        when {
            expression { USE_NKF_REGISTRY }
        }
        steps {
          container('docker') {
            sh "docker tag smartcity/migrations ${NKF_REGISTRY}/${MIGRATIONS}:${IMAGE_TAG}"
            sh "docker tag smartcity/dashboard-service ${NKF_REGISTRY}/${DASHBOARD_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/ngsi-service ${NKF_REGISTRY}/${NGSI_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/orchideo-connect-service ${NKF_REGISTRY}/${ORCHIDEO_CONNECT_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/mail-service ${NKF_REGISTRY}/${MAIL_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/infopin-service ${NKF_REGISTRY}/${INFOPIN_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/static-data-service ${NKF_REGISTRY}/${STATIC_DATA_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/report-service ${NKF_REGISTRY}/${REPORT_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/usi-platform-service ${NKF_REGISTRY}/${USI_PLATFORM_SERVICE}:${IMAGE_TAG}"
            sh "docker tag smartcity/frontend ${NKF_REGISTRY}/${FRONTEND}:${IMAGE_TAG}"
            sh "docker tag smartcity/frontend-with-basepath ${NKF_REGISTRY}/${FRONTEND}:${IMAGE_TAG}-with-basepath"
            withCredentials([usernamePassword(credentialsId: 'smartcity-nkf-af', usernameVariable: 'NKF_USER', passwordVariable: 'NKF_PASS')]) {
              sh "docker login -u ${NKF_USER} --password ${NKF_PASS} ${NKF_REGISTRY}"
              sh "docker push ${NKF_REGISTRY}/${MIGRATIONS}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${DASHBOARD_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${NGSI_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${ORCHIDEO_CONNECT_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${MAIL_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${INFOPIN_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${STATIC_DATA_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${REPORT_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${USI_PLATFORM_SERVICE}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${FRONTEND}:${IMAGE_TAG}"
              sh "docker push ${NKF_REGISTRY}/${FRONTEND}:${IMAGE_TAG}-with-basepath"
            }
          }
        }
      }
    }

    post {
        failure {
            script {
                if (env.BRANCH_NAME == 'dev' || env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'public') {
                    mail to: "${env.EMAIL_TO}",
                    subject: "BUILD REQUIRES ATTENTION! Build ${env.BUILD_DISPLAY_NAME} on ${env.BRANCH_NAME} Failing.",
                    body: "${env.BUILD_URL}"
                }
            }
        }
    }
}
