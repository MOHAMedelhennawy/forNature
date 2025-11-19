import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import logger from '../utils/logger.js';
import { getDataByID } from '../services/dataService.js';
import catchAsync from '../utils/handlers/catchAsync.js';

// Promisify jwt.verify for better async/await support
const verifyToken = promisify(jwt.verify);

/**
 * Check if the request is an API request
 * @param {Object} req - Express request object
 * @returns {boolean}
 */
const isApiRequest = (req) => {
    return req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/');
};

/**
 * Send authentication error response based on request type
 * @param {Object} res - Express response object
 * @param {Object} req - Express request object
 * @param {string} message - Error message
 * @param {string} error - Detailed error description
 * @param {number} statusCode - HTTP status code (default: 401)
 */
const sendAuthError = (res, req, message, error, statusCode = 401) => {
    if (isApiRequest(req)) {
        return res.status(statusCode).json({ message, error });
    }
    return res.redirect('/login');
};

/**
 * Extract token from request (supports both Bearer token and cookies)
 * Priority: Authorization header > Cookie
 * @param {Object} req - Express request object
 * @returns {string|null} Token string or null if not found
 */
const extractToken = (req) => {
    // Check Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Fall back to cookie
    return req.cookies.authToken || null;
};

/**
 * Verify JWT token and return decoded token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded token
 * @throws {Error} If token is invalid or expired
 */
const verifyJwtToken = async (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return await verifyToken(token, process.env.JWT_SECRET);
};

/**
 * Middleware to require authentication
 * Supports both Bearer tokens (for API) and cookies (for web)
 * Attaches decoded token to req.user
 */
export const requireAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return sendAuthError(
                res,
                req,
                'Authentication required',
                'No authentication token provided. Use Authorization: Bearer <token> header or authToken cookie'
            );
        }

        const decodedToken = await verifyJwtToken(token);
        logger.info('Token verified successfully', { userId: decodedToken.userid });
        
        // Attach user info to request for later use
        req.user = decodedToken;
        next();
    } catch (error) {
        logger.error('Authentication failed', { error: error.message });
        return sendAuthError(
            res,
            req,
            'Authentication failed',
            'Invalid or expired token'
        );
    }
};

/**
 * Middleware to optionally check user authentication
 * Supports both Bearer tokens and cookies
 * Attaches user object to res.locals.user (null if not authenticated)
 * Used for front-end rendering where authentication is optional
 * 
 * NOTE: Fetches user from database to ensure:
 * - User still exists (not deleted)
 * - User data is fresh (e.g., isAdmin status)
 * - Full user object available for controllers
 * 
 * Performance consideration: This adds a DB query per request.
 * If performance is critical, consider:
 * 1. Caching user data with short TTL (e.g., Redis, 5-15 min)
 * 2. Only fetching when specific fields are needed
 * 3. Using JWT payload directly if you only need user ID
 */
export const checkUser = catchAsync(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        logger.debug('No authentication token provided');
        res.locals.user = null;
        return next();
    }

    const decodedToken = await verifyJwtToken(token);
    
    // Fetch full user data from database
    // This ensures user still exists and has current permissions (e.g., isAdmin)
    const user = await getDataByID('user', decodedToken.userid);
    
    if (!user) {
        logger.warn('User not found in database', { userId: decodedToken.userid });
        res.locals.user = null;
        return next();
    }

    res.locals.user = user;
    logger.info('User authenticated', { userId: decodedToken.userid });
    next();
});

export const checkAdmin = async (req, res, next) => {
    const user = res.locals.user;

    if (!user?.isAdmin) {
        logger.warn(`Access denied for user ID: ${user?.id || 'unknown'}`);
        return res.status(403).json({ message: 'Access denied' });
    }

    logger.info(`Admin access granted for user ID: ${user.id}`);
    next()
}