const jwt = require('jsonwebtoken');
const secretOrPrivateKey = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    console.log('Received token:', token); 

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        console.log('Decoding token...'); 
        const decoded = jwt.verify(token, secretOrPrivateKey);
        console.log('Decoded token:', decoded); 
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Error decoding token:', err); 
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
