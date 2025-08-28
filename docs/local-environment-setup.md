# Local Environment Setup

This document explains how to use local environment files to avoid conflicts with committed `.env` files.

## Overview

To prevent accidentally committing development URLs and local configuration, this project uses `.env.local` files for local development. These files take precedence over `.env` files and are ignored by git.

## File Structure

```
├── .env                    # Committed template with commented URLs
├── .env.local             # Local development config (not committed)
├── frontend/
│   ├── .env               # Committed template with commented URLs
│   └── .env.local         # Local frontend config (not committed)
└── microservices/
    └── (uses root .env.local)
```

## Setup for Local Development

1. **Copy the template files** (these are already created):
   ```bash
   # Root .env.local and frontend/.env.local are already created
   ```

2. **Customize your local environment** by editing the `.env.local` files:
   - Root: `c:\Projects\smartcity-dashboard-2.0\.env.local`
   - Frontend: `c:\Projects\smartcity-dashboard-2.0\frontend\.env.local`

3. **Run your applications** as usual:
   ```bash
   # Frontend
   cd frontend
   npm run build
   npm run start

   # Microservices
   cd microservices
   npm run start <service-name>
   ```

## Environment File Priority

The loading order is:
1. `.env.local` (highest priority - for local development)
2. `.env` (committed template)

## What's Different

### Before
- URLs were uncommented in `.env` files
- Risk of committing local development URLs
- Conflicts when multiple developers worked on same files

### After
- URLs are commented in committed `.env` files
- Local URLs are in `.env.local` files (not committed)
- No conflicts between developers
- Jenkins builds use only committed `.env` files

## Jenkins/Docker Builds

The `.env.local` files are excluded from Docker builds via `.dockerignore`, so:
- Jenkins builds will only use the committed `.env` files
- Docker images won't include local development configuration
- Production deployments remain unaffected

## Git Status

These files are ignored by git:
- `.env.local`
- `.env*.local` (any environment file ending in .local)

## Troubleshooting

1. **Build not picking up local URLs**: Ensure your `.env.local` file exists and contains the correct URLs
2. **Still getting conflicts**: Make sure you're not editing the committed `.env` files
3. **Jenkins build issues**: Check that `.env.local` files are in `.dockerignore`

## Best Practices

1. Always use `.env.local` for local development configuration
2. Keep `.env` files as templates with commented URLs
3. Don't commit `.env.local` files
4. Document any new environment variables in both template and local files
