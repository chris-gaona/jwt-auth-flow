import * as React from 'react'
import { useRouter } from 'next/router'
import { useAppContext } from '../components/AppContext'

function ProfilePage() {
  const router = useRouter()
  const appContext = useAppContext()

  const logout = () => {
    appContext?.setToken(null)
    // Send a request to the backend to remove the httpOnly cookie
    router.replace('/')
  }

  if (!appContext?.token) return null

  return (
    <div className="profile-page">
      <h1 className="header-secure">Your Secure Profile Page</h1>
      <p><a href="#" onClick={logout}>Logout</a></p>
    </div>
  )
}

export default ProfilePage