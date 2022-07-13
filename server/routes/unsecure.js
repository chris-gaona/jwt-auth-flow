const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/ping', (req, res, next) => {
  res.json({
    message: 'pong',
  })
})

router.post(
  '/signup',
  passport.authenticate('signup', { session: false }),
  async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user
    })
  }
)

router.post(
  '/login',
  async (req, res, next) => {
    passport.authenticate(
      'login',
      async (err, user, info) => {
        try {
          if (err || !user) {
            const error = new Error('An error occurred.')
            return next(error)
          }

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error)

              const body = { _id: user._id, email: user.email }
              const token = jwt.sign({ user: body }, process.env.SECRET_KEY, {
                expiresIn: '1m'
              })
              const refreshToken = jwt.sign({ user: body }, process.env.REFRESH_KEY, {
                expiresIn: '2m'
              })

              /*
                  HttpOnly: This sets the flag HttpOnly within the browser, the cookie, therefore, cannot be accessed from client-side javascript scripts, providing protection against XSS attacks.

                  Max-Age — The maximum age of the cookie in seconds. This will be set in the browser under Expires . The value set will be currentTime + maxAge .

                  Path — If you do not include a path, the cookie will only be set on the page that received the cookie. If the user refreshes, navigates to a new page, or closes the browser, the cookie will be removed. By setting the path to / it will persist across your whole site.

                  Secure — When the Secure flag is set, the cookie can only be sent from HTTPS enabled sites and to HTTPS URLs. You should set this flag within your production setup to provide further protection.
              */
              // Send the refreshToken in an httpOnly cookie
              res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/' })

              return res.json({
                message: 'Login successful',
                token
              })
            }
          )
        } catch (error) {
          return next(error)
        }
      }
    )(req, res, next)
  }
)

router.get('/refresh-token',
  async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      const error = new Error(`refeshToken cookie not found.`)
      return next(error)
    }
    try {
      // Handle refreshing the access token if the refresh token is still valid
      const parsedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_KEY)
      
      if (!parsedRefreshToken) {
        const error = new Error(`The token could not be parsed.`)
        return next(error)
      }
  
      const token = jwt.sign({ user: parsedRefreshToken.user }, process.env.SECRET_KEY, {
        expiresIn: '1m'
      })
  
      return res.json({
        message: 'Refresh successful',
        token
      })
    } catch (error) {
      res.clearCookie('refreshToken')
      res.status(error.status || 500)
      res.json({ error })
    }
  }
)

router.get('/logout',
  async (req, res, next) => {
    res.clearCookie('refreshToken')
    res.json({
      message: 'Logout successful',
    })
  }
)

module.exports = router