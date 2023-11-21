require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
import { Request, Response } from "express";

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: process.env.JWKS_URI,
});

/**
 * Extracts a JWT token from the Authorization header of an HTTP request.
 *
 * @param req The HTTP request object.
 * @returns The JWT token, or null if the Authorization header is missing or invalid.
 */
function getTokenFromAuthorizationHeader(req: any) {
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return token;
    }
  }
  return null;
}

/**
 * Retrieves the public key for a given key ID from the JWKS endpoint.
 *
 * @param kid The key ID to retrieve the public key for.
 * @returns A Promise that resolves to the public key, or rejects with an error if the key cannot be retrieved.
 */
async function getSigningKey(kid: any) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err: Error, key: any) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      }
    });
  });
}

/**
 * Retrieves the roles from the JWT token in the Authorization header of an HTTP request.
 * If the token is missing or invalid, an empty array is returned.
 *
 * @param req The HTTP request object.
 * @returns A Promise that resolves to an array of roles.
 */
export async function getAuthenticatedRolesFromRequest(req: Request) {
  try {
    const token = getTokenFromAuthorizationHeader(req);
    if (!token) {
      return [];
    }

    const decodedToken = jwt.decode(token, { complete: true });
    const kid = decodedToken.header.kid;

    const signingKey = await getSigningKey(kid);

    // throw an error if the token is not valid
    jwt.verify(token, signingKey);

    const { payload } = decodedToken;

    // check if the token is expired
    const now = Date.now().valueOf() / 1000;
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expired");
    }

    const roles = payload.realm_access?.roles;
    return roles || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
