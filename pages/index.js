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

function HomePage() {
  const router = useRouter()
  const appContext = useAppContext()

  const [loginForm, setLoginForm] = React.useState(false)
  const [email, setEmail] = React.useState('email@email.com')
  const [password, setPassword] = React.useState('password')
  const [isLoading, setIsLoading] = React.useState(false)

  const signup = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    if (!email || !password) {
      alert('Email & password are required.')
      return
    }

    setIsLoading(true)

    try {
      const res = await instance.post("/api/signup", {
        email,
        password,
      })
      console.log('signup response', res)
      alert(res?.data?.message)
    } catch (error) {
      console.log('ERROR', error)
    }

    setIsLoading(false)
  }

  const login = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    if (!email || !password) {
      alert('Email & password are required.')
      return
    }

    setIsLoading(true)

    try {
      const res = await instance.post("/api/login", {
        email,
        password,
      })
      console.log('login response', res)
      appContext?.setToken(res.data.token)
      router.replace('/profile')
    } catch (error) {
      console.log('ERROR', error)
    }

    setIsLoading(false)
  }

  return (
    <div className="login-page">
      <h1 className="header-text">JWT Auth Flow</h1>
      <div className="form">
        {loginForm ? (
          <form className="login-form" onSubmit={login}>
            <input type="text" placeholder="email address" value={email} onChange={event => {
              setEmail(event.target.value)
            }} />
            <input type="password" placeholder="password" value={password} onChange={event => {
              setPassword(event.target.value)
            }} />
            <button>{isLoading ? 'loading...' : 'login'}</button>
            <p className="message">Not registered? <a href="#" onClick={() => {
              setLoginForm(false)
            }}>Create an account</a></p>
          </form>
        ) : (
          <form className="register-form" onSubmit={signup}>
            <input type="text" placeholder="email address" value={email} onChange={event => {
              setEmail(event.target.value)
            }} />
            <input type="password" placeholder="password" value={password} onChange={event => {
              setPassword(event.target.value)
            }} />
            <button>{isLoading ? 'loading...' : 'create account'}</button>
            <p className="message">Already registered? <a href="#" onClick={() => {
              setLoginForm(true)
            }}>Sign In</a></p>
          </form>
        )}
      </div>
    </div>
  )
}

export default HomePage