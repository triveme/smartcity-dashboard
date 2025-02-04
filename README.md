# Smart City Suite

## Overview
The Smart City Suite is a comprehensive project that integrates several technologies including Next.js, NestJS, Keycloak, and PostgreSQL. It aims to provide a robust platform for managing various aspects of a smart city.

## Prerequisites
To run the application locally, ensure the following prerequisites are installed:
- Rancher Desktop
- Node.js (v20.13.0)
- PgAdmin or DBeaver
- K9S

## Setup Instructions

### Local Development
1. Clone the repository.
2. Install dependencies for all packages:
   ```bash
   npm install
   ```
3. Follow the Kubernetes setup instructions [here (internal deployment)](k8s/README-internal.adoc) or [here (external deployment)](k8s/README-external.adoc).

### Single Sign-On (SSO)
We use Keycloak as our SSO provider. For local development, access the SSO at [http://localhost:8080](http://localhost:8080/). More information can be found here.

### Database
We run a PostgreSQL database via Kubernetes. Before developing or testing locally, set up the database and run the migrations:
- [Local Setup](database/README.adoc#local-setup)
- Migrations

## Environment Variables
The project requires several environment variables to be configured. Detailed documentation for these variables can be found in the respective README files of each component:
- [General Environment Variables](README-Env-Variables.adoc)
- [Frontend Environment Variables](frontend/README.adoc)
- [Backend Environment Variables](microservices/README.adoc)
- [Database Environment Variables](database/README.adoc)

## Component Descriptions

### Frontend
The frontend is built using Next.js. It provides the user interface for interacting with the Smart City Suite. More details can be found here.

### Microservices
The backend consists of several microservices built using the NestJS framework. Each microservice handles a specific aspect of the Smart City Suite. More details can be found here.

### Keycloak
Keycloak is used for authentication and authorization. It manages user identities and access control. More details can be found here.

### Database
The project uses PostgreSQL for data storage, managed via Drizzle ORM. More details can be found here.

## Testing
To run tests, ensure the database is properly set up and migrated. Run the following commands:
```bash
# Commands to run tests
npm run test
```

## Docker
The project uses Docker for containerization. The Docker images are built using the following Dockerfiles:
- Migrations: `Dockerfile.migrations`
- Mail Service: `Dockerfile.mail-service`
- Infopin Service: `Dockerfile.infopin-service`
- Static Data Service: `Dockerfile.static-data-service`
- Report Service: `Dockerfile.report-service`
- Frontend: `Dockerfile.frontend`

## Jenkins Pipeline
The Jenkins pipeline is defined in the Jenkinsfile. It includes stages for building Docker images, running tests, and deploying the application.

## Additional Documentation
- [Technical Documentation](docs/technical-documentation.md)
- [Project Dependencies](docs/project-dependencies.md)
- [Kubernetes Setup (Internal Deployment)](k8s/README-internal.adoc)
- [Kubernetes Setup (External Deployment)](k8s/README-external.adoc)

For more detailed information, refer to the respective README files of each component.
