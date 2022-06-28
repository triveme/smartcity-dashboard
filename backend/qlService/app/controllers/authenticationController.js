const axios = require("axios");
require("dotenv").config();

//every 15 seconds
let scheduleFrequency = "*/15 * * * * *";

const authClient = axios.create({
  baseURL: `https://${process.env.AUTH_URL}`,
});

// exports.runAuthSchedule = cron.schedule(scheduleFrequency, () => {
//   authClient
//     .post(
//       "/password",
//       {
//         grant_type: "refresh_token",
//         client_id: process.env.CLIENT_ID,
//         client_secret: process.env.CLIENT_SECRET,
//         refresh_token: process.env.REFRESH_TOKEN,
//       },
//       {
//         headers: {
//           "content-type": "application/x-www-form-urlencoded",
//         },
//       }
//     )
//     .then((response) => {
//       console.log(response);
//     })
//     .catch((err) => {
//       console.log(err);
//     });

//   console.log("Refresh Token");

//   /**
//    * 1. mit Refresh-Token neue Tokens + Ablaufzeit abfragen
//    * 2. Tokens in .env schreiben
//    * 3. Ablaufzeit (cron job anpassen)
//    */
// });

exports.getNewToken = authClient
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
    console.log(response);
  })
  .catch((err) => {
    console.log(err);
  });
