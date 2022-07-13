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

  const [profileRes, setProfileRes] = React.useState(null)

  React.useEffect(() => {
    if (!appContext?.token) return

    ;(async () => {
      try {
        const res = await instance.get("/api/user/profile", {
          headers: {
            'Authorization': 'Bearer ' + appContext?.token
          }
        })
        console.log('profile response', res)
        setProfileRes(res.data)
      } catch (error) {
        console.log('ERROR', error)
      }
    })()
  }, [appContext?.token])

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
      {profileRes ? (
        <div className='profile-info'>
          <hr />
          <p>{profileRes.message}</p>
          <p>Email: <b>{profileRes.user.email}</b></p>
        </div>
      ) : null}
    </div>
  )
}

export default ProfilePage