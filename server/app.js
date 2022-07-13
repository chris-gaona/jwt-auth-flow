/*
  https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport
  
  https://github.com/auth0/node-jsonwebtoken

  https://jakeowen-ex.medium.com/secure-api-authentication-with-nextjs-http-only-cookie-b4ea0569bbfc

  https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81

  https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#basics-login
*/

const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')

const UserModel = require('./models/User')

dotenv.config()

mongoose.connect("mongodb://127.0.0.1:27017/passport-jwt", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.connection.on('error', error => console.log(error) )
mongoose.Promise = global.Promise

require('./auth')
const unsecure = require('./routes/unsecure')
const secure = require('./routes/secure')

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())

app.use('/', unsecure)

// Plug in the JWT strategy as a middleware so only verified users can access this route.
app.use('/user', passport.authenticate('jwt', { session: false }), secure)

// Handle errors.
app.use(function(err, req, res, next) {
  console.log('ERROR', err)
  res.status(err.status || 500)
  res.json({ error: err })
})

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server started at port ${process.env.SERVER_PORT}.`)
})
