import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config({ override: true });

const authClient = axios.create({
  baseURL: `https://${process.env.AUTH_URL}`,
});

let expirationTime = 0;

function checkIfTokenNeedsToUpdate() {
  let currentTime = new Date.getTime();
  console.log("current time");
  console.log(currentTime);
  console.log("expiration time");
  console.log(expirationTime);
  let needsToUpdate = false;
  if (expirationTime === 0) {
    console.log("expTime 0 ");
    needsToUpdate = true;
  } else if (expirationTime > currentTime) {
    console.log("exp time > curr");
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
        refresh_token: process.env.REFRESH_TOKEN,
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
        console.log(response.data.access_token);
        console.log(response.data.refresh_token);
        process.env.TOKEN = response.data.access_token;
        process.env.REFRESH_TOKEN = response.data.refresh_token;
        let currentTime = new Date().getTime();
        // expirationTime = currentTime + response.date.expires_in - 500;
        expirationTime = currentTime + 5000;
        console.log(expirationTime);
      }
      /**
       * Ablaufzeit für nächste Abfrage setzen
       */
    })
    .catch((err) => {
      console.log("authentication request failed");
      console.log(err);
    });
}

export { checkIfTokenNeedsToUpdate, updateToken };
