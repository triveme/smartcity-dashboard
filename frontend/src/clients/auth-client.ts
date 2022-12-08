import { client } from "clients/client";

export type AuthRequestData = {
  username: string;
  password: string;
};

export function signin(data: AuthRequestData) {
  return client.post("/auth/signin", data);
}

