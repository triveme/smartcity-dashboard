import { AuthContextProps } from 'react-oidc-context'

/**
 * Decodes a base64-encoded JWT token and returns the decoded payload.
 *
 * @param encodedToken The base64-encoded JWT token.
 * @returns The decoded payload, or null if the token is invalid or cannot be decoded.
 */
export function getDecodedToken(encodedToken?: string) {
  try {
    if (!encodedToken) {
      return null
    }
    const base64Url = encodedToken?.split('.')[1]
    if (!base64Url) {
      return null
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch (error) {
    console.error(error)
  }
  return null
}

/**
 * Gets the roles from a base64-encoded JWT token.
 *
 * @param encodedToken The base64-encoded JWT token.
 * @returns An array of roles, or undefined if the token is invalid or does not contain any roles.
 */
export function getRolesFromToken(encodedToken?: string): string[] | undefined {
  const decodedToken = getDecodedToken(encodedToken)
  return decodedToken?.realm_access?.roles
}

/**
 * Checks if the user has the admin role.
 *
 * @param auth The auth context.
 * @returns True if the user has the admin role, false otherwise.
 */
export function userIsAdmin(auth: AuthContextProps) {
  return getRolesFromToken(auth?.user?.access_token)?.includes('admin') ?? false
}

/**
 * Gets the permissions of a user based on their roles and the authorized roles for reading and writing.
 *
 * @param auth The auth context.
 * @param authorizedRoles An object containing arrays of authorized roles for reading and writing.
 * @returns An object with boolean values for read and write permissions.
 */
export function getPermissionsOfUser(auth: AuthContextProps, authorizedRoles?: { read: string[]; write: string[] }) {
  // Admins have read and write permissions
  if (userIsAdmin(auth)) {
    return { read: true, write: true }
  }

  const roles = getRolesFromToken(auth?.user?.access_token)
  if (!roles || !authorizedRoles) {
    return { read: false, write: false }
  }

  const read = roles.some((role) => authorizedRoles.read.includes(role))
  const write = roles.some((role) => authorizedRoles.write.includes(role))
  return { read, write }
}

/**
 * Checks if the user has read permissions for the current dashboard.
 *
 * @param auth The auth context.
 * @param architectureContext The architecture context.
 * @returns True if the user has read permissions for the current dashboard, false otherwise.
 */
export function canReadCurrentDashboard(auth: AuthContextProps, architectureContext: any) {
  const { initialArchitectureContext } = architectureContext
  const currentDashboard = initialArchitectureContext.filter(
    (dashboard: any) => dashboard.url === architectureContext.dashboardUrl,
  )[0]
  return (
    // Users with write permissions also have read permissions
    getPermissionsOfUser(auth, currentDashboard?.roles).write ||
    getPermissionsOfUser(auth, currentDashboard?.roles).read
  )
}

/**
 * Checks if the user has write permission for the current dashboard.
 *
 * @param auth The auth context.
 * @param architectureContext The architecture context.
 * @returns True if the user has write permission for the current dashboard, false otherwise.
 */
export function canWriteCurrentDashboard(auth: AuthContextProps, architectureContext: any) {
  const { initialArchitectureContext } = architectureContext
  const currentDashboard = initialArchitectureContext.filter(
    (dashboard: any) => dashboard.url === architectureContext.dashboardUrl,
  )[0]
  return getPermissionsOfUser(auth, currentDashboard?.roles).write
}
