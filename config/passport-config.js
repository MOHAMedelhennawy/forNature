import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import dotenv from 'dotenv';

dotenv.config();


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/google/callback",
    passReqToCallback   : true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
        // Find user or create if exist not exist on database
        const user = await User.findOrCreate({ googleId: profile.id });
    
        // Generate token
        const token = await generateAuthToken(user);
    
        return done(null, { user, token});
      } catch (error) {
        return done(error, null);
      }
    }
));


// const findOrCreateUser = async (profile) => {
//   // Check if user already exist
//   const user = await User.findOne({ googleId: profile.id });

//   // if not exist create one. otherwise, return the user
//   if (!user) {
//     const 
//   }

//   return user;
// }