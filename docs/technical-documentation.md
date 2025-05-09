
# Technical Documentation

## Overview
The Smart City Dashboard is a comprehensive project that integrates several technologies including Next.js, NestJS, Keycloak, and PostgreSQL. It aims to provide a robust platform for managing various aspects of a smart city.

The goal of this project was initially to visualize data from the FIWARE-based central Open Data Platform but has since been expanded to include other data plattforms as well. By providing data, especially in the form of charts, citizens and interested parties can get an overview of the current situation in the city. For example, it is possible to see how many visitors are currently in the swimming pool or what temperature and humidity values are measured by sensors in different parts of the city.

The data visualization can be adjusted by the operators in live operation without additional programming effort. This is possible by logging in as an administrator and using an integrated wizard to make the desired configuration. Consequently, newly ingested data into the Open Data Platform can be made directly accessible to the public with minimal adjustments. The data not only resides in the platform but also provides a direct benefit to all residents.

The website consists mainly of the menu on the left and the main area of the respective dashboard on the right. Users can select the desired dashboard via the menu and are redirected to the subpage of the single-page app via the corresponding URL. The content area on the right is divided into panels, which in turn contain widgets. The widgets are thematically grouped. On mobile devices, the menu is collapsed by default, and panels and widgets are wrapped according to the screen width to optimally utilize the limited space on smaller screens.

## Main Features
- Data Visualization: Provides real-time data visualization in the form of charts and graphs.
- User-Friendly Interface: Intuitive and easy-to-navigate user interface.
- Responsive Design: Optimized for both desktop and mobile devices.
- Administrator Configuration: Allows administrators to configure data visualization without additional programming.
- Single Sign-On (SSO): Integrated with Keycloak for authentication and authorization.
- Scalable Architecture: Built using microservices for scalability and maintainability.
- Kubernetes Deployment: Deployed using Kubernetes for easy scaling and management.
- Open Data Platform Integration: Integrates with FIWARE-based central Open Data Platform and other data platforms.
- Real-Time Updates: Provides real-time updates for data visualization.

## Architecture
![Smart City Dashboard](images/SC_Dashboard_Extended.png)

## Quality Goals
| Nr. | Quality             | Motivation                                                                                                             |
|-----|---------------------|-----------------------------------------------------------------------------------------------------------------------|
| 1   | Usability           | The application should be intuitive and accessible, ensuring ease of use for users of all ages. |
| 2   | Functional Stability| The application must consistently perform its required functions under all conditions, ensuring high stability and availability for a diverse user base. |
| 3   | Maintainability     | The system architecture should facilitate easy modifications and updates.                                            |
| 4   | Transferability     | The application should be easily adaptable to different environments or new technologies.                                 |

## Prerequisites
To run the application locally, ensure the following prerequisites are installed:
- Rancher Desktop
- Node.js (v.20.13.0)
- PgAdmin or DBeaver
- K9S

## Setup Instructions
### Local Development
1. Clone the repository.
2. Install dependencies for all packages:
   ```bash
   npm install
   ```
3. Follow the Kubernetes setup instructions [here (internal deployment)](../k8s/README-internal.adoc) or [here (external deployment)](../k8s/README-external.adoc).

### Single Sign-On (SSO)
We use Keycloak as our SSO provider. For local development, access the SSO at [http://localhost:8080](http://localhost:8080/). More information can be found [here](../keycloak/README.adoc).

### Database
We run a PostgreSQL database via Kubernetes. Before developing or testing locally, set up the database and run the migrations:
- [Local Setup](../database/README.adoc#local-setup)
- [Migrations](../database/README.adoc#migrations)

## Component Descriptions
### Frontend
The frontend is built using Next.js. It provides the user interface for interacting with the Smart City Dashboard. More details can be found [here](../frontend/README.adoc).

### Microservices
The backend consists of several microservices built using the NestJS framework. Each microservice handles a specific aspect of the Smart City Dashboard. More details can be found [here](../microservices/README.adoc).

### Keycloak
Keycloak is used for authentication and authorization. It manages user identities and access control. More details can be found [here](../keycloak/README.adoc).

### Database
The project uses PostgreSQL for data storage, managed via Drizzle ORM. More details can be found [here](../database/README.adoc).

### Kubernetes
The project is deployed using Kubernetes. Detailed setup instructions can be found [here (internal deployment)](../k8s/README-internal.adoc) or [here (external deployment)](../k8s/README-external.adoc).

## Environment Variables
The project requires several environment variables to be configured. Detailed documentation for these variables can be found in the respective README files of each component.

## Testing
To run tests, ensure the database is properly set up and migrated. Run the following commands:

# Deployment

## Motivation
The deployment strategy for the Smart City Dashboard leverages Jenkins for CI/CD, Kubernetes for managing the deployment and scaling of the application components. This approach ensures that the application is highly available, scalable, and can be easily maintained and updated.

## Quality and/or Performance Features

- **Scalability**: Kubernetes allows for easy scaling of application components based on load.
- **High Availability**: Applications can be distributed across multiple nodes to ensure high availability.
- **Automation**: Jenkins automates the build, test, and deployment process, reducing manual intervention and the potential for errors.
- **Flexibility**: Helm charts provide a flexible way to manage Kubernetes deployments.
- **Multi-Platform Support**: The CI/CD pipeline supports building and deploying web, Android, and iOS applications.

## Mapping of Building Blocks to Infrastructure

- **Backend**: Deploys the NestJS microservices, responsible for business logic and data processing.
- **Frontend**: Deploys the Smart City Dashboard frontend for residents.
- **CMS**: Deploys the City Management System for city officials.
- **Mobile Deployment**: Deploys the hybrid mobile apps to the Google Play Store and Apple App Store.

## Infrastructure Layer 1: CI/CD Pipeline

- **Jenkins**: Manages the build, test, and deployment process for all application components.

## Infrastructure Layer 2: Kubernetes Cluster

- **Backend**: Hosts the NestJS microservices.
- **Frontend**: Hosts the Smart City Dashboard frontend.
- **Keycloak**: Hosts the keycloak instance.
- **Database**: Hosts the PostgreSQL Database.

# CI/CD Pipeline Description

The CI/CD pipeline is managed using Jenkins and includes the following stages:

## Build Stage

- The pipeline is triggered by changes in the repository.
- Builds the application using the provided configurations.
- Runs tests to ensure the application is functioning correctly.
- Generates build artifacts.

## Docker Build and Push

- Builds Docker images for the application components.
- Runs a complete virus scan for all images.
- Pushes the images to the Docker registry.

## Deploy Stage (Web)

- Uses Helm charts to deploy the application components to the Kubernetes cluster.
- Ensures the deployments are updated with the latest Docker images.
- Monitors the deployment to ensure it completes successfully.

# Quality Requirements

## Quality Tree

### Performance
- **Response Time**: The system should respond to user actions within 2 seconds.
- **Throughput**: The system should handle 1000 concurrent users without performance degradation.

### Reliability
- **Availability**: The system should have an uptime of 99.9%.
- **Error Rate**: The system should have an error rate of less than 0.1%.

### Security
- **Authentication**: All users must be authenticated via Keycloak.
- **Authorization**: Access to resources must be controlled based on user roles.

### Maintainability
- **Code Quality**: The codebase should have a test coverage of at least 80%.
- **Documentation**: All components should have comprehensive documentation.

### Usability
- **User Interface**: The UI should be intuitive and easy to navigate.
- **Accessibility**: The system should be accessible to users with disabilities.

## Quality Scenarios

### Performance Scenario
- **Scenario**: A user logs in and navigates to the dashboard.
- **Expected Outcome**: The dashboard loads within 2 seconds.

### Reliability Scenario
- **Scenario**: The system experiences a sudden spike in traffic.
- **Expected Outcome**: The system remains available and responsive.

### Security Scenario
- **Scenario**: A user attempts to access a restricted resource.
- **Expected Outcome**: The user is denied access based on their role.

### Maintainability Scenario
- **Scenario**: A developer adds a new feature to the system.
- **Expected Outcome**: The feature is added without breaking existing functionality, and tests are updated to maintain 80% coverage.

### Usability Scenario
- **Scenario**: A new user accesses the system for the first time.
- **Expected Outcome**: The user can easily navigate the system and complete tasks without assistance.

# Glossary

| Term                     | Description                                                                                     |
|--------------------------|-------------------------------------------------------------------------------------------------|
| **AuthenticatedRequest** | A type of request that includes authentication information, such as user roles and permissions.  |
| **CI/CD**                | Continuous Integration and Continuous Deployment. A practice that involves automatically building, testing, and deploying code changes. |
| **DbType**               | A type representing the database client used to interact with the PostgreSQL database.           |
| **Drizzle ORM**          | A type-safe ORM (Object-Relational Mapping) for PostgreSQL used in this project.                 |
| **FIWARE**               | An open-source platform that provides a set of APIs for developing smart applications.           |
| **Helm**                 | A package manager for Kubernetes that helps in defining, installing, and upgrading complex Kubernetes applications. |
| **Jenkins**              | An open-source automation server used to automate the CI/CD pipeline.                            |
| **Keycloak**             | An open-source identity and access management solution used for authentication and authorization. |
| **Kubernetes**           | An open-source system for automating the deployment, scaling, and management of containerized applications. |
| **Leaflet**              | An open-source JavaScript library for mobile-friendly interactive maps.                          |
| **NestJS**               | A progressive Node.js framework for building efficient, reliable, and scalable server-side applications. |
| **Next.js**              | A React framework for server-side rendering and static site generation.                          |
| **PostgreSQL**           | A powerful, open-source object-relational database system.                                       |
| **Rancher Desktop**      | An open-source Kubernetes management tool for running Kubernetes clusters on a local machine.    |
| **REST API**             | An application programming interface that conforms to the constraints of REST architectural style and allows for interaction with RESTful web services. |
| **SSO**                  | Single Sign-On. A user authentication process that allows a user to access multiple applications with one set of login credentials. |
| **UX/UI**                | User Experience and User Interface design, focusing on the overall feel of the product and the way users interact with it. |
| **YAML**                 | A human-readable data serialization standard that can be used in conjunction with all programming languages and is often used to write configuration files. |
