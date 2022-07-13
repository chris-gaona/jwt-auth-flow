import * as React from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useAppContext } from '../components/AppContext'

const instance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

function ProfilePage() {
  const router = useRouter()
  const appContext = useAppContext()

  const logout = async () => {
    appContext?.setToken(null)

    // Send a request to the backend to remove the httpOnly cookie
    try {
      const res = await instance.get("/api/logout")
      console.log('logout response', res)
      alert(res?.data?.message)
    } catch (error) {
      console.log('ERROR', error)
    }

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