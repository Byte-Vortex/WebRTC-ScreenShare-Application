const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (Admin, jwtSecret) => {
    const router = express.Router();

    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        console.log('Received Admin Login request for:', username);

        try {
            const admin = await Admin.findOne({ username });

            if (!admin) {
                console.log('Invalid Username or Password');
                return res.status(401).send({ error: 'Invalid username or password' }); // Generic error
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                console.log("Invalid Username or Password");
                return res.status(401).send({ error: 'Invalid username or password' }); // Generic error
            }

            // Generate token
            const token = jwt.sign({ id: admin._id }, jwtSecret, { expiresIn: '30m' });
            console.log('Generated Admin Token:', token);
            
            // Send token and adminName
            res.json({ success: true, token, adminName: admin.username });

        } catch (error) {
            console.error('Error During Admin Login:', error);
            res.status(500).send({ error: 'Server error' });
        }
    });

    return router;
};