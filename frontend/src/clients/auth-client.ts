import { client } from "clients/client";

export type AuthRequestData = {
  username: string;
  password: string;
};

export async function getAuthToken(args: AuthRequestData) {
  return client
    .post("/auth/signin", {
      username: args.username,
      password: args.password,
    })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err);
    });
}
