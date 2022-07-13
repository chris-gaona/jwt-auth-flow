const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const UserModel = require('./models/User')

passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.create({ email, password });

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
)

passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, { message: 'Wrong Password' });
        }

        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
)

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.SECRET_KEY,
      jwtFromRequest: ExtractJWT.fromExtractors([
      ExtractJWT.fromUrlQueryParameter('token'),
      ExtractJWT.fromAuthHeaderAsBearerToken(),
    ])
    },
    async (token, done) => {
      try {
        // Verify the token audience & issuer
        if (token.aud !== process.env.AUDIENCE) {
          const error = new Error(`The aud claim in the token is invalid.`)
          error.status = 401
          return done(error)
        }

        if (token.iss !== process.env.ISSUER) {
          const error = new Error(`The iss claim in the token is invalid.`)
          error.status = 401
          return done(error)
        }

        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
)