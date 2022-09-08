import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config({ override: true });

const authClient = axios.create({
  baseURL: `${process.env.AUTH_URL}`,
});

let expirationTime = 0;
let refreshToken = "";
let accessToken = "";

function checkIfTokenNeedsToUpdate() {
  let currentTime = new Date().getTime();
  let needsToUpdate = false;
  if (expirationTime === 0) {
    needsToUpdate = true;
  } else if (expirationTime < currentTime) {
    needsToUpdate = true;
  }
  return needsToUpdate;
}

function updateToken() {
  authClient
    .post(
      "/password",
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      console.log("Token wird aktualisiert");
      if (
        response.data &&
        response.data.access_token &&
        response.data.expires_in &&
        response.data.refresh_token
      ) {
        console.log("token erfolgreich aktualisiert");
        updateTokenAndExpirationTime(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in
        );
      }
    })
    .catch((err) => {
      console.log("authentication request failed");
      console.log(err);
    });
}

function getInitialToken() {
  authClient
    .post(
      "/password",
      new URLSearchParams({
        grant_type: "password",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        username: process.env.APPUSER,
        password: process.env.APPUSERPW,
      }).toString(),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      console.log("Token erfolgreich aktualisiert");
      if (
        response.data &&
        response.data.access_token &&
        response.data.expires_in &&
        response.data.refresh_token
      ) {
        updateTokenAndExpirationTime(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in
        );
      }
    })
    .catch((err) => {
      console.log("authentication request failed");
      console.log(err);
    });
}

function updateTokenAndExpirationTime(
  newAccessToken,
  newRefreshToken,
  newExpiration
) {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  let currentTime = new Date().getTime();
  expirationTime = currentTime + newExpiration * 1000 - 1500;
}

export { checkIfTokenNeedsToUpdate, updateToken, getInitialToken, accessToken };
