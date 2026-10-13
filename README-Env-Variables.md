# Deployment Environment Variables

This self-contained reference covers environment variables for the dashboard, its services and migrations. You do not need access to deployment YAML files or the source repository to use it. CI settings and third-party infrastructure tuning are out of scope.

## Contents

- [How to Use This Reference](#how-to-use-this-reference)
- [Frontend](#frontend)
- [Dashboard Service](#dashboard-service)
- [Data Translation Service](#data-translation-service)
- [Infopin Service](#infopin-service)
- [Internal Data Service](#internal-data-service)
- [Mail Service](#mail-service)
- [NGSI Service](#ngsi-service)
- [Orchideo Connect Service](#orchideo-connect-service)
- [PlanBar Service](#planbar-service)
- [Project Data Service](#project-data-service)
- [Report Service](#report-service)
- [SQL View Service](#sql-view-service)
- [Static Data Service](#static-data-service)
- [USI Platform Service](#usi-platform-service)
- [Database Migrations](#database-migrations)
- [Keycloak - Local Infrastructure](#keycloak---local-infrastructure)
- [Shared Backend Settings](#shared-backend-settings)
- [Backend Integration Tests](#backend-integration-tests)
- [NGSI Seed Utility](#ngsi-seed-utility)
- [Deployment Checks](#deployment-checks)
- [Legacy or Inactive Names](#legacy-or-inactive-names)
- [Information to Request from Your Deployment Administrator](#information-to-request-from-your-deployment-administrator)

## How to Use This Reference

- **Required**: must be supplied for the component to work. Your deployment administrator may already supply it; confirm the effective value before changing it.
- **Conditional**: required only when the named service or feature is used.
- **Optional override**: can be omitted to use the documented behavior.
- **None** means there is no application fallback. Values labelled **packaged configuration** are supplied by the project's deployment configuration, not by the application itself. Your delivered deployment may differ; confirm these values with its administrator. Development values and examples are not production defaults.

For a first deployment, configure the database, frontend and backend URLs, OIDC/JWKS settings, role names and credential encryption key. Then configure the URLs and settings for each enabled integration. Do not copy development passwords into production.

### Where to Set Values

- Supply each variable to the **component that consumes it**, using the environment configuration supported by your container platform or deployment package. A value set on the frontend is not automatically available to a backend or the migration job.
- If you cannot edit the deployment configuration, send the variable name, target component and intended value to your deployment administrator. Use your agreed secret-delivery channel for credentials, not email or a public ticket.
- Store passwords and encryption keys in the platform's secret manager and have them injected into the appropriate containers. Public configuration such as service URLs can use regular environment settings.
- Environment-file syntax is `NAME=value`. Keep values as strings, including booleans and JSON arrays. A runtime environment file cannot change settings already built into a frontend image.

For example, these non-secret values illustrate the format; they are not a complete deployment configuration:

```text
NODE_ENV=production
POSTGRES_PORT=5432
EDIT_ROLES=["editor","scs-admin"]
```

Each service section lists its shared settings and service-specific variables. Shared defaults and formats are documented once to avoid repetition. Variables are sorted alphabetically within each table. Ask your administrator to confirm any settings your deployment package already supplies.

### Public Values, URLs and Build Timing

- Every `NEXT_PUBLIC_*` value can be exposed to the browser. Never put database passwords, encryption keys, SMTP passwords or OIDC client secrets there. Public map/geocoder tokens must be suitable for browser use.
- Frontend service URLs must be reachable from the customer's browser. Kubernetes-only DNS names belong in backend-to-backend URLs, not browser URLs. `NEXT_PUBLIC_BACKEND_URL` must also be reachable from the frontend server because it is used for server-side requests.
- Use full URLs including any ingress path, normally without a trailing slash. In backend containers, `localhost` means that container, not another service.
- Some frontend settings are read at runtime; others are built into the image. Base path and asset prefix must match the supplied image. For an image built for `/dashboard`, use `/dashboard` and `/dashboard/` respectively. Confirm the image's supported path with your provider rather than changing runtime values alone.
- After changing container environment variables, restart the affected components. Ask your image provider for a matching rebuild when changing build-time settings, including client-side geocoder configuration.

## Frontend

Set all variables in this section on the frontend container/image. Public API URLs must be reachable from the browser; `NEXT_PUBLIC_BACKEND_URL` must also be reachable from the frontend server. For build-time values, coordinate a matching image with your provider.

| Variable                                   | Requirement                                | Default                             | Description                                                                                                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ADMIN_ROLE`                   | Required                                   | None                                | Frontend admin role; keep aligned with backend `ADMIN_ROLE`.                                                                                                                                                                       |
| `NEXT_PUBLIC_API_KEY`                      | Conditional: keyed geocoder                | None                                | Frontend: public geocoder key for providers other than OSM/Esri. Separate from the Mapbox token. Coordinate build-time changes with your image provider.                                                                           |
| `NEXT_PUBLIC_ASSET_PREFIX`                 | Optional override                          | Empty / no custom prefix            | Frontend: asset prefix for subpath deployment, e.g. `/dashboard/` with leading and trailing slashes. Must match the supplied image's build configuration.                                                                          |
| `NEXT_PUBLIC_BACKEND_URL`                  | Required                                   | None                                | Set on frontend: dashboard-service URL used by the browser and frontend server, e.g. `https://dashboard.example.com/api/dashboard`. Obtain the actual route from your administrator.                                               |
| `NEXT_PUBLIC_BASEPATH`                     | Optional override                          | Empty / root deployment             | Frontend: URL subpath starting with `/` and without a trailing slash, e.g. `/dashboard`. Must match the supplied image's build configuration.                                                                                      |
| `NEXT_PUBLIC_COOKIEBOT_ID`                 | Optional override                          | Unset: no environment-provided ID   | Frontend: Cookiebot domain-group ID; tenant settings may also supply an ID.                                                                                                                                                        |
| `NEXT_PUBLIC_FRONTEND_URL`                 | Required                                   | None                                | Single public frontend origin, e.g. `https://dashboard.example.com`. Do not use a comma-separated origin list here.                                                                                                                |
| `NEXT_PUBLIC_GEOCODER_PROVIDER`            | Optional override                          | `osm`                               | Frontend: search provider: `osm`, `esri`, `google`, `bing`, `locationiq`, `here`, `geoapify` or `pelias`. Unknown providers or missing required API keys fall back to OSM. Coordinate build-time changes with your image provider. |
| `NEXT_PUBLIC_IGNORE_TENANT_CHECK`          | Optional override                          | Tenant checking enabled             | Frontend: exactly `true` skips the token-to-tenant check. Leave unset or `false` for customer deployments; it does not disable backend authorization.                                                                              |
| `NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL`    | Conditional: internal data                 | None                                | Frontend: public internal-data-service URL.                                                                                                                                                                                        |
| `NEXT_PUBLIC_MAIL_SERVICE_URL`             | Conditional: email/support                 | None                                | Public mail-service URL for email/support requests. This frontend value is independent of the internal URL configured on dashboard-service or report-service.                                                                      |
| `NEXT_PUBLIC_MAIL_TO`                      | Conditional: support requests              | None                                | Frontend: support request recipient email address.                                                                                                                                                                                 |
| `NEXT_PUBLIC_MAPBOX_TOKEN`                 | Conditional: Mapbox maps/reverse geocoding | None                                | Frontend: public Mapbox access token. It remains browser-visible even if delivered through a secret manager.                                                                                                                       |
| `NEXT_PUBLIC_NGSI_SERVICE_URL`             | Conditional: NGSI integration              | None                                | Frontend: public NGSI-service URL, not the external context broker.                                                                                                                                                                |
| `NEXT_PUBLIC_OIDC_AUTHORITY`               | Required                                   | None                                | Set on frontend: realm/issuer URL, e.g. `https://auth.example.com/realms/customer`.                                                                                                                                                |
| `NEXT_PUBLIC_OIDC_CLIENT_ID`               | Required                                   | None                                | Set on frontend: OIDC client ID, e.g. `scs-frontend`. This is a browser client, not a client secret.                                                                                                                               |
| `NEXT_PUBLIC_OIDC_REDIRECT_URI`            | Required                                   | None                                | Set on frontend: full login callback URL, including the base path if used. Must match an allowed redirect URI in Keycloak.                                                                                                         |
| `NEXT_PUBLIC_ORCHIDEO_CONNECT_SERVICE_URL` | Conditional: Orchideo integration          | None                                | Frontend: public Orchideo Connect **microservice** URL, not the external data platform.                                                                                                                                            |
| `NEXT_PUBLIC_PLANBAR_SERVICE_URL`          | Conditional: PlanBar integration           | None                                | Frontend: public plan-bar-service URL. Use the variable name exactly as written.                                                                                                                                                   |
| `NEXT_PUBLIC_PROJECT_DATA_SERVICE_URL`     | Conditional: project management            | `http://localhost:8090`             | Frontend: public project-data-service URL. The fallback is for local development, not production.                                                                                                                                  |
| `NEXT_PUBLIC_REPORT_SERVICE_URL`           | Conditional: report API                    | None                                | Frontend: public report-service URL.                                                                                                                                                                                               |
| `NEXT_PUBLIC_SQL_SERVICE_URL`              | Conditional: SQL-view integration          | None                                | Frontend: public sql-view-service URL.                                                                                                                                                                                             |
| `NEXT_PUBLIC_SUPER_ADMIN_ROLE`             | Required                                   | None                                | Frontend super-admin role; keep aligned with backend `SUPER_ADMIN_ROLE`.                                                                                                                                                           |
| `NEXT_PUBLIC_TENANT`                       | Optional override                          | Unset: no anonymous tenant redirect | Frontend: default tenant abbreviation for anonymous visitors to the root page. Allowed format: 1-32 lowercase letters, digits or hyphens.                                                                                          |
| `NEXT_PUBLIC_USI_PLATFORM_SERVICE_URL`     | Conditional: USI integration               | None                                | Frontend: public USI-platform-service URL.                                                                                                                                                                                         |
| `NEXT_PUBLIC_VERSION`                      | Optional override                          | None                                | Frontend: version label in the UI footer; set to the deployed release.                                                                                                                                                             |
| `NODE_ENV`                                 | Required for production                    | None                                | Set `production` for a deployed frontend; use `development` only for local development.                                                                                                                                            |
| `NODE_TLS_REJECT_UNAUTHORIZED`             | Optional override                          | TLS verification enabled when unset | Node HTTPS setting, including on the frontend server. Keep unset or `1` in production. `0` disables certificate verification and is development-only.                                                                              |

## Dashboard Service

`dashboard-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.

| Variable                            | Requirement                                           | Default                                                                    | Description                                                                                                                                                                                                                                           |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_ROLE`                        | Required for services using admin authorization       | None                                                                       | Exact Keycloak admin role name, normally `scs-admin`; keep aligned with frontend `NEXT_PUBLIC_ADMIN_ROLE`.                                                                                                                                            |
| `DEFECT_REPORT_EMAIL`               | Conditional: fatal-log email                          | None                                                                       | Recipient for fatal-log reports. Configure independently from mail-service's defect-report recipient.                                                                                                                                                 |
| `EDIT_ROLES`                        | Optional override                                     | `[]`                                                                       | JSON array of additional editor roles, e.g. `["editor","scs-admin"]`. Invalid JSON fails parsing.                                                                                                                                                     |
| `INTERNAL_DATA_SERVICE_BASE_URL`    | Conditional: internal data                            | None; packaged configuration: `http://smart-city-internal-data-service`    | Internal-data-service endpoint.                                                                                                                                                                                                                       |
| `LOG_PATH`                          | Conditional: dashboard log reading/email attachments  | Writes/rotation: `./logs`; log reading requires an explicit value          | Dashboard-service log directory. Set explicitly, e.g. `./logs`, because the log reader does not safely fall back when unset. Have your administrator provide a writable directory and storage if logs must survive restarts.                          |
| `LOG_ROTATION_CRON`                 | Optional override                                     | `3 2 * * * *`                                                              | Dashboard-service rotation schedule. Six fields including seconds; the default fires at second `3`, minute `2` of every hour, not daily at 02:03. Current rotation deletes matching log files; do not assume a retention policy.                      |
| `NEXT_PUBLIC_MAIL_SERVICE_URL`      | Conditional: fatal-log email                          | None                                                                       | Internal mail-service URL reachable from dashboard-service. Despite the name, this value is used by the backend, not the customer's browser.                                                                                                          |
| `NGSI_SERVICE_BASE_URL`             | Conditional: NGSI/NGSI-LD/NGSI-v2                     | None; packaged configuration: `http://smart-city-ngsi-service`             | Internal NGSI-service endpoint.                                                                                                                                                                                                                       |
| `ORCHIDEO_CONNECT_SERVICE_BASE_URL` | Conditional: Orchideo/API                             | None; packaged configuration: `http://smart-city-orchideo-connect-service` | Internal Orchideo Connect service endpoint.                                                                                                                                                                                                           |
| `PASSWORD_ENCRYPT_KEY`              | Conditional: encrypted integration credentials        | None                                                                       | Secret: exactly 64 hexadecimal characters (32 bytes). Must match the key used by dashboard-service and other services handling the same stored credentials. Back up the key; changing it without re-encryption makes existing credentials unreadable. |
| `PLAN_BAR_SERVICE_BASE_URL`         | Conditional: PlanBar                                  | None; packaged configuration: `http://smart-city-plan-bar-service`         | Internal PlanBar-service endpoint.                                                                                                                                                                                                                    |
| `SQL_VIEW_SERVICE_BASE_URL`         | Conditional: SQL views                                | None; packaged configuration: `http://smart-city-sql-view-service`         | Internal SQL-view-service endpoint.                                                                                                                                                                                                                   |
| `SUPER_ADMIN_ROLE`                  | Required for services using super-admin authorization | None                                                                       | Exact Keycloak cross-tenant super-admin role name, normally `scs-super-admin`; keep aligned with frontend `NEXT_PUBLIC_SUPER_ADMIN_ROLE`.                                                                                                             |
| `USI_PLATFORM_SERVICE_BASE_URL`     | Conditional: USI                                      | None; packaged configuration: `http://smart-city-usi-platform-service`     | Internal USI-platform-service endpoint.                                                                                                                                                                                                               |

The `*_BASE_URL` values are internal service routes, not external platform endpoints. Obtain actual URLs from your administrator; packaged URLs assume specific service names. External platform endpoints and credentials are configured as data sources/system users in the application.

The project-admin role `scs-project-admin` is fixed; there is no environment override.

## Data Translation Service

`data-translation-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.

No additional service-specific environment variables are read by the current service.

## Infopin Service

`infopin-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.

| Variable     | Requirement                        | Default                                                                 | Description                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_ROLE` | Required for report deletion       | None                                                                    | Exact Keycloak admin role name used for deleting infopin reports, normally `scs-admin`.                                                                                                                                                                                                                                                                 |
| `IMAGE_DIR`  | Conditional: infopin image uploads | None; packaged configuration: `../../../../apps/infopin-service/images` | Infopin-service appends this string directly to its compiled application directory; it is not an ordinary absolute path setting. The packaged value lacks a leading separator. Ask your image provider to confirm the correct separator-prefixed suffix and resolved upload directory, and have your administrator provide writable persistent storage. |

## Internal Data Service

`internal-data-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.
- **Role configuration**: `ADMIN_ROLE`, `SUPER_ADMIN_ROLE`, optional `EDIT_ROLES`.

| Variable                          | Requirement       | Default | Description                                                                                                                        |
| --------------------------------- | ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.    |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default. |

## Mail Service

`mail-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.

| Variable                | Requirement                  | Default                                                          | Description                                                                                                                                                                                   |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DASHBOARD_SERVICE_URL` | Conditional: automated email | None                                                             | Mail-service's internal dashboard-service URL, used to fetch `/logs` attachments. Missing/unreachable log access prevents automated email from completing.                                    |
| `DEFECT_REPORT_EMAIL`   | Conditional: defect reports  | None; packaged mail-service configuration: `smart.city@edag.com` | Recipient for defect reports sent through mail-service. Replace the packaged recipient with the customer's address. Dashboard fatal-log emails use dashboard-service's own recipient setting. |
| `MAIL_HOST`             | Conditional: email delivery  | None; packaged placeholder: `smtp.gmail.com`                     | Mail-service SMTP hostname. Replace the placeholder with your provider.                                                                                                                       |
| `MAIL_PASS`             | Conditional: email delivery  | None; packaged placeholder password                              | Mail-service secret: SMTP password/app password. Have a real credential injected through the platform's secret manager.                                                                       |
| `MAIL_PORT`             | Conditional: email delivery  | None; packaged configuration: `465`                              | Mail-service SMTP port. The transport always uses implicit TLS, normally port `465`; changing the port to `587` does not enable STARTTLS mode.                                                |
| `MAIL_USER`             | Conditional: email delivery  | None; packaged placeholder: `example-email@gmail.com`            | Mail-service SMTP login and sender for automated email.                                                                                                                                       |

No application database connection or JWKS variable is consumed by the current mail-service.

## NGSI Service

`ngsi-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.

| Variable                          | Requirement                                    | Default | Description                                                                                                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override                              | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.                                                                                                                       |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override                              | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default.                                                                                                                    |
| `PASSWORD_ENCRYPT_KEY`            | Conditional: encrypted integration credentials | None    | Secret: exactly 64 hexadecimal characters (32 bytes). Must match the key used by dashboard-service and other services handling the same stored credentials. Back up the key; changing it without re-encryption makes existing credentials unreadable. |

## Orchideo Connect Service

`orchideo-connect-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.

| Variable                          | Requirement                                    | Default | Description                                                                                                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override                              | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.                                                                                                                       |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override                              | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default.                                                                                                                    |
| `PASSWORD_ENCRYPT_KEY`            | Conditional: encrypted integration credentials | None    | Secret: exactly 64 hexadecimal characters (32 bytes). Must match the key used by dashboard-service and other services handling the same stored credentials. Back up the key; changing it without re-encryption makes existing credentials unreadable. |

## PlanBar Service

`plan-bar-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.

| Variable                          | Requirement                                    | Default | Description                                                                                                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override                              | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.                                                                                                                       |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override                              | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default.                                                                                                                    |
| `PASSWORD_ENCRYPT_KEY`            | Conditional: encrypted integration credentials | None    | Secret: exactly 64 hexadecimal characters (32 bytes). Must match the key used by dashboard-service and other services handling the same stored credentials. Back up the key; changing it without re-encryption makes existing credentials unreadable. |

## Project Data Service

`project-data-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.
- **Role configuration**: `ADMIN_ROLE`, `SUPER_ADMIN_ROLE`, optional `EDIT_ROLES`.

| Variable                          | Requirement       | Default | Description                                                                                                                        |
| --------------------------------- | ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.    |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default. |

## Report Service

`report-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.

| Variable                       | Requirement                       | Default | Description                                                                                                                                            |
| ------------------------------ | --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_MAIL_SERVICE_URL` | Conditional: report notifications | None    | Internal mail-service URL reachable from report-service. Recipient lists are configured in reports, not through `DEFECT_REPORT_EMAIL` on this service. |

## SQL View Service

`sql-view-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.
- **Role configuration**: `ADMIN_ROLE`, `SUPER_ADMIN_ROLE`, optional `EDIT_ROLES`.

| Variable                          | Requirement       | Default | Description                                                                                                                        |
| --------------------------------- | ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.    |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default. |

The service initializes the shared role helper, including parsing `EDIT_ROLES`; its current request handlers do not invoke the helper's admin/super-admin checks.

## Static Data Service

`static-data-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.

No additional service-specific environment variables are read by the current service.

## USI Platform Service

`usi-platform-service`

Apply these [shared backend settings](#shared-backend-settings) to this service:

- **Runtime**: `NODE_ENV`, `NEXT_PUBLIC_FRONTEND_URL`.
- **Database**: `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`.
- **Token verification**: `NEST_JWKS_URI`; `TRUSTED_CA` only for a custom HTTPS CA.

| Variable                          | Requirement                                    | Default | Description                                                                                                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_PLATFORM_QUEUE_CONCURRENCY` | Optional override                              | `2`     | Maximum concurrently executing jobs per service instance; positive integer. Higher values increase data-platform/database load.                                                                                                                       |
| `DATA_PLATFORM_QUEUE_TIMEOUT_MS`  | Optional override                              | `60000` | Execution timeout per running job in milliseconds; finite value of at least `1`. Leave unset rather than empty to use the default.                                                                                                                    |
| `PASSWORD_ENCRYPT_KEY`            | Conditional: encrypted integration credentials | None    | Secret: exactly 64 hexadecimal characters (32 bytes). Must match the key used by dashboard-service and other services handling the same stored credentials. Back up the key; changing it without re-encryption makes existing credentials unreadable. |

## Database Migrations

Apply these [shared backend settings](#shared-backend-settings) to the migration job: `NODE_ENV` and `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`. The migration job has its own environment; service settings are not automatically inherited.

| Variable                       | Requirement                                    | Default                                        | Description                                                                                                                                                                                                                                   |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PGPASSWORD`                   | Conditional: migration container's `psql` step | Packaged development configuration: `postgres` | Secret: password used by the PostgreSQL CLI, not by the Node database provider. Keep it equal to `POSTGRES_PASSWORD` for the supplied migration container.                                                                                    |
| `POSTGRES_REJECT_UNAUTHORIZED` | Optional override; migrations only             | `true`                                         | Current behavior: unset/`true` disables database SSL; exactly `false` enables SSL with certificate verification disabled. **This is not a production TLS-validation switch.** Runtime service database connections do not read this variable. |

Creating a database or changing its credentials does not automatically update the application connection settings. Keep the database, all consuming services and the migration job aligned.

> **Important:** Current runtime database connections do not expose an environment setting for verified PostgreSQL TLS. `POSTGRES_REJECT_UNAUTHORIZED` only affects migrations and does not enable verified TLS. If your database requires verified TLS, coordinate additional connection configuration with your provider.

## Keycloak - Local Infrastructure

These variables configure the supplied local Keycloak setup, not the dashboard services. Local examples are convenience values, not safe production defaults. For a production identity provider, obtain bootstrap/access and database configuration from its administrator.

| Variable                  | Requirement                           | Default                                           | Description                                                                                                                       |
| ------------------------- | ------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `KC_DB`                   | Conditional: local Keycloak database  | Example `postgres`                                | Keycloak database vendor in the Compose setup.                                                                                    |
| `KC_DB_PASSWORD`          | Conditional: local Keycloak database  | Example `postgres`                                | Secret: password for that account, consistent with the local database setup.                                                      |
| `KC_DB_URL`               | Conditional: local Keycloak database  | Example `jdbc:postgresql://postgres-dev:5432/scs` | JDBC database URL, resolved from inside the Keycloak container.                                                                   |
| `KC_DB_USERNAME`          | Conditional: local Keycloak database  | Example `postgres`                                | Keycloak database account.                                                                                                        |
| `KEYCLOAK_ADMIN`          | Conditional: local Keycloak bootstrap | Example `admin`                                   | Initial local admin username. For production, obtain bootstrap/access details from the identity-provider administrator.           |
| `KEYCLOAK_ADMIN_PASSWORD` | Conditional: local Keycloak bootstrap | Example `admin`                                   | Secret: initial local admin password; replace for any non-local use.                                                              |
| `KEYCLOAK_PORT`           | Conditional: local Compose            | None; example `8080`                              | Host port mapped to Keycloak's container port `8080` in the supplied local setup; not an application or production port override. |

## Shared Backend Settings

This section defines defaults and formats for the variables listed under each service. **Only apply the sets named in that service's section**; not every service uses a database, verifies tokens or checks admin roles.

| Variable                       | Requirement                                     | Default                                                                     | Description                                                                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_ROLE`                   | Required for services using admin authorization | None                                                                        | Exact Keycloak admin role name, normally `scs-admin`. Required where admin checks use it; keep aligned with the frontend role.                                                                                      |
| `EDIT_ROLES`                   | Optional override                               | `[]`                                                                        | JSON array of additional editor role names, e.g. `["editor","scs-admin"]`. Invalid JSON fails parsing when the role helper initializes.                                                                             |
| `NEST_JWKS_URI`                | Required for authenticated backends             | None                                                                        | Access-token verification endpoint for the same realm, e.g. `https://auth.example.com/realms/customer/protocol/openid-connect/certs`. Must be reachable from each backend that verifies access tokens.              |
| `NEXT_PUBLIC_FRONTEND_URL`     | Required                                        | None                                                                        | Allowed frontend CORS origin, e.g. `https://dashboard.example.com`. Multiple origins may be comma-separated on backends. Use origins without paths.                                                                 |
| `NODE_ENV`                     | Required for production                         | None; packaged development configuration: `development` on several backends | Set `production` on deployed applications. `test` selects `POSTGRES_DB_TEST`; never use it for production. Confirm that the delivered deployment does not retain the development setting.                           |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Optional override                               | TLS verification enabled when unset                                         | Node HTTPS setting, including on the frontend server. Keep unset or `1` in production. `0` disables certificate verification and is development-only.                                                               |
| `POSTGRES_DB`                  | Required                                        | None; packaged configuration: `scs`                                         | Application database name. Confirm that this database has been created and migrated.                                                                                                                                |
| `POSTGRES_HOST`                | Required                                        | None; packaged configuration: `<release-name>-postgresql`                   | Database hostname reachable from each consuming container. Ask your administrator for the actual hostname; do not copy the placeholder literally.                                                                   |
| `POSTGRES_PASSWORD`            | Required                                        | None; packaged development configuration: `postgres`                        | Secret: password for `POSTGRES_USER`. Have it injected into every database-backed service and the migration job.                                                                                                    |
| `POSTGRES_PORT`                | Required                                        | None; packaged configuration: `5432`                                        | Database TCP port. The application validates that this value is present even when using PostgreSQL's standard port.                                                                                                 |
| `POSTGRES_USER`                | Required                                        | None; packaged development configuration: `postgres`                        | Application database user. Replace development credentials with the intended deployment account.                                                                                                                    |
| `SUPER_ADMIN_ROLE`             | Required where super-admin checks use it        | None                                                                        | Exact Keycloak cross-tenant super-admin role name, normally `scs-super-admin`; keep aligned with the frontend role.                                                                                                 |
| `TRUSTED_CA`                   | Conditional: custom CA for HTTPS JWKS           | Unset: Node's default trust store                                           | **PEM certificate contents, not a filename.** Preserve certificate delimiters and line breaks. Have your administrator inject the certificate bundle into each backend needing that CA to access the JWKS endpoint. |

`NODE_TLS_REJECT_UNAUTHORIZED` applies to Node HTTPS across all application services, even where it is not listed as a service-specific setting. Leave it unset or `1` in production; it is not a PostgreSQL TLS setting.

Generate a credential encryption key locally, for example:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Back up the key with the database and supply the same `PASSWORD_ENCRYPT_KEY` to every service handling those encrypted credentials.

## Backend Integration Tests

Test-only settings; these are not extra production application requirements. Tests also need the relevant service settings and a separate migrated test database. Set `NODE_ENV=test` only in the test environment.

| Variable                        | Requirement                            | Default                 | Description                                                                                               |
| ------------------------------- | -------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `KEYCLOAK_CLIENT_ID`            | Conditional: backend integration tests | None                    | Test service-account client ID.                                                                           |
| `KEYCLOAK_CLIENT_ID_MENDEN`     | Conditional: tenant-specific tests     | None                    | Additional client ID referenced by grouping-element tests.                                                |
| `KEYCLOAK_CLIENT_SECRET`        | Conditional: backend integration tests | None                    | Secret: matching test client secret.                                                                      |
| `KEYCLOAK_CLIENT_SECRET_MENDEN` | Conditional: tenant-specific tests     | None                    | Secret: matching additional test client secret.                                                           |
| `KEYCLOAK_CLIENT_URI`           | Conditional: backend integration tests | None                    | Keycloak token endpoint, ending in `/protocol/openid-connect/token`, used by the test JWT helper.         |
| `POSTGRES_DB_TEST`              | Conditional: tests                     | None; example `testing` | Database used instead of `POSTGRES_DB` when `NODE_ENV=test`. Create and migrate a separate test database. |

## NGSI Seed Utility

Local seed-tool overrides only, if the utility is included in your development package. Do not use these as NGSI-service application settings.

| Variable        | Requirement                       | Default                 | Description                                                                                   |
| --------------- | --------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `NGSILD_TENANT` | Optional override; seed tool only | `testorion`             | NGSI-LD tenant header for the same seed tool.                                                 |
| `ORION_URL`     | Optional override; seed tool only | `http://localhost:1026` | Orion-LD broker URL for the local NGSI seed utility, if included in your development package. |

## Deployment Checks

The deployment package may not supply every setting required by your enabled features. Confirm these points with your deployment administrator:

- **Credentials**: replace development PostgreSQL and Keycloak passwords and SMTP placeholders. Confirm the running components receive the intended secrets; changing a separate configuration file is insufficient if the deployment does not consume it.
- **Shared settings**: supply auth, role and encryption settings to every consumer, particularly infopin's admin role and Orchideo's encryption key. A custom JWKS CA must reach each backend needing it.
- **Enabled features**: confirm frontend mail/report URLs, selected optional frontend settings, dashboard mail settings and mail-service's dashboard URL are supplied where needed.
- **Acceptance checks**: verify login, a data-source request, migrations, email and uploads for enabled features. If a feature fails, ask your administrator to inspect the effective component environment without disclosing secrets.

## Legacy or Inactive Names

| Variable                       | Current status                                                                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FRONTEND_PORT`                | Packaged configuration supplies `3000`, but the application/start script does not read this variable. It does not configure the frontend listen port. Backend listen ports are fixed by the application, not ENV overrides; ask your administrator for exposed endpoints. |
| `MAX_LOGS`                     | Not consumed by current code; no configurable log-retention count. Do not rely on the old documented value of `3`.                                                                                                                                                        |
| `ORCHIDEO_CONNECT_SERVICE_URL` | Appears in older backend documentation but is not consumed. Use `NEXT_PUBLIC_ORCHIDEO_CONNECT_SERVICE_URL` for browser-to-service routing or `ORCHIDEO_CONNECT_SERVICE_BASE_URL` for internal routing; configure external platform connections in the application.        |
| `PHARMACY_URL`                 | Only mentioned in commented-out code; not an active setting.                                                                                                                                                                                                              |

Some deployment packages supply `ADMIN_ROLE=scs-admin` to NGSI-service, but its current application code does not consume that setting. It is not an additional NGSI-service requirement.

## Information to Request from Your Deployment Administrator

Request the public frontend and service URLs; internal service URLs; database connection details; OIDC realm, client, callback URL and role names; any required CA bundle; and the supported frontend base path. For enabled email/uploads, also confirm SMTP details, recipients and persistent storage locations.
Have the administrator confirm which variables are already supplied and which require a new frontend image. Use the agreed secret-delivery channel for passwords and encryption keys. No access to internal YAML files is needed for this handover.
