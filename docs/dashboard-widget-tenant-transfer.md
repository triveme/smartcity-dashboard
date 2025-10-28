# Manual Tenant Override for Dashboard and Widget Duplication

## Overview

This document shows how to temporarily modify the duplication endpoints to hardcode a target tenant for transferring dashboards and widgets between tenants. **This is a temporary solution for internal use only and should not be committed to the repository.**

## Code Changes Required

### Dashboard Controller Modification

In `microservices/apps/dashboard-service/src/dashboard/dashboard.controller.ts`, modify the duplicate method:

```typescript
@Public()
@Post('/duplicate/:id')
async duplicate(
  @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  @Query('tenant') tenant: string,
  @Req() request: AuthenticatedRequest,
): Promise<DashboardWithContent> {
  const roles = request.roles ?? [];
  const tenantTarget = 'specified-tenant-name'; // Change this to your target tenant
  return this.service.duplicate(id, roles, tenantTarget);
}
```

### Widget Controller Modification

In `microservices/apps/dashboard-service/src/widget/widget.controller.ts`, modify the duplicate method:

```typescript
@Public()
@Post('duplicate/:id')
async duplicate(
  @Param('id') id: string,
  @Query('tenant') tenant: string,
  @Req() request: AuthenticatedRequest,
): Promise<WidgetWithChildren> {
  const roles = request.roles ?? [];
  const tenantTarget = 'specified-tenant-name'; // Change this to your target tenant
  if (
    this.authHelperUtility.isAdmin(roles) ||
    this.authHelperUtility.isEditor(roles)
  ) {
    return this.service.duplicate(roles, id, tenantTarget, undefined);
  } else {
    throw new HttpException(
      'Unauthorized to duplicate widget',
      HttpStatus.FORBIDDEN,
```

## How to Use

1. **Update the tenant target**: Change the `tenantTarget` variable in both controller methods to your desired target tenant abbreviation
2. **Test the duplication**: Call the duplicate endpoints as normal - they will now create copies in the specified target tenant
3. **Revert changes**: Remember to undo these changes before committing to version control

## Example Usage

With the target tenant set to `'new-tenant-abbreviation'`:

```bash
# Duplicate a dashboard - will be created in 'new-tenant-abbreviation'
curl -X POST "http://localhost:3000/dashboards/duplicate/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Duplicate a widget - will be created in 'new-tenant-abbreviation'
curl -X POST "http://localhost:3000/widgets/duplicate/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Important Notes

- ⚠️ **Do not commit these changes** - This is for temporary internal use only
- Ensure the target tenant exists in the system before testing
- Both Admin and Editor roles are required for widget duplication
- The original `tenant` query parameter is ignored when these modifications are in place

