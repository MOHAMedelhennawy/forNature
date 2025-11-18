import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { getDataByID } from '../services/dataService.js';

export const requireAuth = (req, res, next) => {
    const token = req.cookies.authToken || null;
    
    // Check if this is an API request (starts with /api/)
    const isApiRequest = req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/');

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
            if (error) {
                logger.error(error.message);
                if (isApiRequest) {
                    return res.status(401).json({ 
                        message: 'Authentication failed',
                        error: 'Invalid or expired token'
                    });
                }
                return res.redirect('/login');
            } else {
                logger.info(decodedToken);
                // Attach user info to request for later use
                req.user = decodedToken;
                next();
            }
        })
    } else {
        if (isApiRequest) {
            return res.status(401).json({ 
                message: 'Authentication required',
                error: 'No authentication token provided'
            });
        }
        return res.redirect('/login');
    }
}

// Check the current user to access from front-end
export const checkUser = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (token) {    // if user is login
        jwt.verify(token, process.env.JWT_SECRET, async (error, decodedToken) => {
            if (error) {
                logger.error(error.message);
                res.locals.user = null;
                next()
            } else {
                const user = await getDataByID('user', decodedToken.userid);
                res.locals.user = user;
                logger.info(`token is verified, user id is ${decodedToken.userid}`);
                next();
            }
        })
    } else {    // if user not login
        logger.warn('User is not login');
        res.locals.user = null;
        next();
    }
}


export const checkAdmin = async (req, res, next) => {
    const user = res.locals.user;

    if (!user?.isAdmin) {
        logger.warn(`Access denied for user ID: ${user?.id || 'unknown'}`);
        return res.status(403).json({ message: 'Access denied' });
    }

    logger.info(`Admin access granted for user ID: ${user.id}`);
    next()
}