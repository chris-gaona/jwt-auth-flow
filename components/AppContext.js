import * as React from 'react'
import { useRouter } from 'next/router'

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
    let intervalTimer
    if (!token) {
      // Clear the interval to refresh the access token
      if (intervalTimer) clearInterval(intervalTimer)
      router.replace('/')
      return
    }
    
    // Setup interval to refresh the access token every 10 seconds before it'll expire
    intervalTimer = setInterval(() => {
      console.log('REFRESHING ACCESS TOKEN!!')
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