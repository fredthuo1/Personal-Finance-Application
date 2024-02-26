const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const updateSecretKey = (newKey) => {
    try {
        fs.writeFileSync('.env', `JWT_SECRET=${newKey}`);

        dotenv.config();

        console.log('Secret key updated:', process.env.JWT_SECRET);
    } catch (err) {
        console.error('Error updating secret key:', err);
    }
};

module.exports = updateSecretKey;
