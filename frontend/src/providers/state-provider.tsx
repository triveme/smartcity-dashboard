import { useState, createContext, useContext } from 'react'

import jwt_decode, { JwtPayload } from 'jwt-decode'

const authToken = sessionStorage.getItem('authToken')
type AuthValue = any

export const StateContext = createContext<AuthValue>({
  authToken: authToken ? authToken : null,
  adminId: authToken ? jwt_decode<JwtPayload>(authToken) : null,
})

export const useStateContext = () => useContext(StateContext)

export function StateProvider(props: React.PropsWithChildren<{}>) {
  const { children } = props
  const [stateContext, setStateContext] = useState({
    authToken: authToken ? authToken : null,
    adminId: authToken ? jwt_decode<JwtPayload>(authToken) : null,
  })

  return <StateContext.Provider value={{ stateContext, setStateContext }}>{children}</StateContext.Provider>
}
