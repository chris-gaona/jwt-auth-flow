import * as React from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

const instance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

let AppContext
const { Provider, Consumer } = (AppContext =
  React.createContext(null))

function useAppContext() {
  const context = React.useContext(AppContext)
  if (context === undefined) {
    throw new Error(`useAppContext must be used within a AppProvider`)
  }
  return context
}

function AppProvider({ children }) {
  const router = useRouter()

  // NOTE: the access token from the server will only ever be stored in memory
  const [token, setToken] = React.useState(null)

  React.useEffect(() => {
    console.log('REFRESHING ACCESS TOKEN ON PAGE LOAD!!')
    ;(async () => {
      try {
        const res = await instance.get("/api/refresh-token")
        if (res.data.token) {
          setToken(res.data.token)
          router.replace('/profile')
        }
      } catch (error) {
        router.replace('/')
        console.log('ERROR', error)
      }
    })()
  }, [])

  React.useEffect(() => {
    let intervalTimer
    if (!token) {
      // Clear the interval to refresh the access token
      if (intervalTimer) clearInterval(intervalTimer)
      return
    }
    
    // Setup interval to refresh the access token every 10 seconds before it'll expire
    intervalTimer = setInterval(async () => {
      console.log('REFRESHING ACCESS TOKEN!!')
      try {
        const res = await instance.get("/api/refresh-token")
        console.log('refresh response', res)
        alert(res?.data?.message)
      } catch (error) {
        alert('Refresh token expired')
        router.replace('/')
        clearInterval(intervalTimer)
        console.log('ERROR', error)
      }
    }, 60000 - 10000)

    return () => {
      if (intervalTimer) clearInterval(intervalTimer)
    }
  }, [token])

  return (
    <Provider
      value={{ token, setToken }}
    >
      {children}
    </Provider>
  )
}

export { AppProvider, useAppContext }