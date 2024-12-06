import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { createData, getDataByID } from '../services/dataService.js';
import { checkEmail, generateAuthToken } from '../services/authService.js';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// it's like app.use in the server to use middleware
passport.use(
  new GoogleStrategy({
    // Options for the google strategy
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL:'/auth/google/callback',    // The path that auto redirect after choose you'r account to use
  }, async (accessToken, refreshToken, profile, done) => {
    // check if user already eixist in our DB
    const currentUser = await checkEmail(profile.emails[0].value);
    if (currentUser) {
        // If User exist
        const token = await generateAuthToken(currentUser);
        done(null, { user: currentUser, token });    // After this go to the next stage: serialize
    } else {
        // If user not exist
        try {
            const newUser = await createData('user', {
                username: profile.displayName,
                first_name: profile.name.givenName,
                last_name: profile.name.familyName,
                email: profile.emails[0].value,
                password: null,
                phone_number: '0000',
            });

            const token = await generateAuthToken(newUser);
            done(null, { user: newUser, token });
        } catch (error) {
            throw new Error('Failed to create new user.');
        }
    }
  })
);

passport.serializeUser((user, done) => {
    done(null, user.id);    // to store id on cookies
})

passport.deserializeUser(async (user, done) => {
    try {
        const user = await getDataByID('user', user.id);

        if (user) {
            done(null, user);   // to retrieve user information with every request 
        }
    } catch (error) {
        done(null, error);
        throw new Error(error.message);
    }
})