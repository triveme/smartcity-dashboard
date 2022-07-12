import React, { useState, createContext, useContext } from "react";

type AuthValue = any;

export const AuthContext = createContext<AuthValue>({ authToken: null });

export const useAuthContext = () => useContext(AuthContext);

export function AuthContextProvider(props: React.PropsWithChildren<{}>) {
  const { children } = props;

  const [authContext, setAuthContext] = useState({ authToken: null });
  // const [authContext, setAuthContext] = useState({ authToken: "fakeToken" });

  return (
    <AuthContext.Provider value={{ authContext, setAuthContext }}>
      {children}
    </AuthContext.Provider>
  );
}
