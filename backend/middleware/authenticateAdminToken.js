const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error('No token provided');
        return res.sendStatus(401); // No token, unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                console.error('Token expired:', err);
                return res.status(401).json({ message: 'Token expired. Please login again.' });
            }
            console.error('Token verification error:', err);
            return res.sendStatus(403); // Invalid token, forbidden
        }
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateAdminToken;
