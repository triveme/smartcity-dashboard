import axios from 'axios';

export async function generateJWTToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  let jwtToken: string;
  // Get JWT token
  const authUrl = process.env.KEYCLOAK_CLIENT_URI;

  const data = new URLSearchParams();
  data.append('client_id', clientId);
  data.append('client_secret', clientSecret);
  data.append('grant_type', 'client_credentials');

  try {
    await process.nextTick(() => {});
    const res = await axios.post(authUrl, data);
    jwtToken = res.data.access_token;
  } catch (error) {
    console.error('Error occurred:', error);
  }

  return jwtToken;
}
