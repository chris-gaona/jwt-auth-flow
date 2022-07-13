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
                expiresIn: '3m'
              })

              // Send the refreshToken in an httpOnly cookie
              res.cookie('refreshToken', refreshToken, { httpOnly: true })

              return res.json({ token })
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
  
      return res.json({ token })
    } catch (error) {
      return next(error)
    }

  }
)

module.exports = router