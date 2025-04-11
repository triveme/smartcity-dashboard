# Project Dependencies

This document lists the dependencies used in the Smart City Suite project.

## General Dependencies
- **Node.js**: v20.13.0
- **Docker**: Used for containerization
- **Kubernetes**: Used for orchestration
- **Helm**: Used for managing Kubernetes applications

## Frontend Dependencies
The frontend is built using Next.js and includes the following dependencies:

- **Next.js**: A React framework for server-side rendering and static site generation.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.

For a complete list of frontend dependencies, refer to the package.json file in the frontend directory.

## Backend Dependencies
The backend consists of several microservices built using the NestJS framework. Each microservice has its own set of dependencies.

### Common Dependencies
- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Drizzle ORM**: A type-safe ORM for PostgreSQL.

### Microservices
Each microservice has its own dependencies. Below are the Dockerfiles for each microservice, which include the dependencies:

- [infopin-service](../microservices/Dockerfile.infopin-service)
- [ngsi-service](../microservices/Dockerfile.ngsi-service)
- [orchideo-connect-service](../microservices/Dockerfile.orchideo-connect-service)
- [mail-service](../microservices/Dockerfile.mail-service)
- [dashboard-service](../microservices/Dockerfile.dashboard-service)
- [static-data-service](../microservices/Dockerfile.static-data-service)
- [report-service](../microservices/Dockerfile.report-service)

## Database Dependencies
The project uses PostgreSQL for data storage, managed via Drizzle ORM. The database setup and migrations are handled using the following dependencies:

- **PostgreSQL**: A powerful, open-source object-relational database system.
- **Drizzle ORM**: A type-safe ORM for PostgreSQL.

For more details, refer to the drizzle.config.ts file and the [database README](../database/README.adoc).

## Single Sign-On (SSO)
The project uses Keycloak for authentication and authorization. Keycloak dependencies include:

- **Keycloak**: An open-source identity and access management solution.

For more details, refer to the [keycloak README](../keycloak/README.adoc).

## Environment Variables
The project requires several environment variables to be configured. Detailed documentation for these variables can be found in the respective README files of each component:

- [General Environment Variables](../README-Env-Variables.adoc)
- [Frontend Environment Variables](../frontend/README.adoc)
- [Backend Environment Variables](../microservices/README.adoc)
- [Database Environment Variables](../database/README.adoc)

## Additional Documentation
- [Technical Documentation](technical-documentation.md)
- [Kubernetes Setup (Internal Deployment)](../k8s/README-internal.adoc)
- [Kubernetes Setup (External Deployment)](../k8s/README-external.adoc)

For more detailed information, refer to the respective README files of each component.
