import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { getDataByID } from '../services/dataService.js';

export const requireAuth = (req, res, next) => {
    const token = req.cookies.authToken;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
            if (error) {
                logger.error(error.message);
                res.redirect('/login');
            } else {
                logger.info(decodedToken);
                next();
            }
        })
    } else {
        res.redirect('/login');
    }
}

// Check the current user to access from front-end
export const checkUser = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (error, decodedToken) => {
            if (error) {
                logger.error(error.message);
                res.locals.user = null;
                next()
            } else {
                console.log(decodedToken);
                const user = await getDataByID('user', decodedToken.userid);
                res.locals.user = user;
                logger.info(`Used id is ${user.id}`)
                next();
            }
        })
    } else {
        logger.warn('User is not login');
        res.locals.user = null;
        next();
    }
}
