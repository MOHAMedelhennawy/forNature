import jwt from 'jsonwebtoken';

const authPermission = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({ message: 'Access Denied.' });
    }

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure the user has admin privileges
        if (!decodedPayload.isAdmin) {
            return res.status(403).json({ message: 'Access Denied.' });
        }

        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid Token' });
    }
}

export default authPermission;
