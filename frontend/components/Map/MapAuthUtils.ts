import { jwtDecode } from 'jwt-decode';

/**
 * Decoded JWT token with roles
 */
type DecodedToken = {
  roles?: string[];
  realm_access?: {
    roles?: string[];
  };
};

/**
 * Extracts roles from a JWT access token
 * @param accessToken - The JWT access token
 * @returns Array of role strings
 */
export const extractRolesFromToken = (
  accessToken: string | undefined,
): string[] => {
  if (!accessToken) return [];

  try {
    const decoded: DecodedToken = jwtDecode(accessToken);
    const roles = decoded.roles || decoded.realm_access?.roles;
    return Array.isArray(roles) ? roles : [];
  } catch (err) {
    console.error('Failed to decode JWT token', err);
    return [];
  }
};

/**
 * Checks if the user has the project admin role
 * @param roles - Array of user roles
 * @returns Whether the user is a project admin
 */
export const hasProjectAdminRole = (roles: string[]): boolean => {
  const requiredRole = 'scs-project-admin';
  return roles.includes(requiredRole);
};

/**
 * Determines if the user is a project admin from their access token
 * @param accessToken - The JWT access token
 * @returns Whether the user is a project admin
 */
export const isProjectAdminFromToken = (
  accessToken: string | undefined,
): boolean => {
  const roles = extractRolesFromToken(accessToken);
  return hasProjectAdminRole(roles);
};
