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
                console.log('Username not found');
                return res.status(401).send('Invalid Credentials');
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                console.log(username,': Admin Password Matched');
                try {
                    const token = jwt.sign({ id: admin._id }, jwtSecret, { expiresIn: '1h' });
                    console.log('Generated Admin Token:', token);
                    res.json({ success: true, token });
                } catch (error) {
                    console.error('Error Generating Admin token:', error);
                    res.status(500).send('Error generating token');
                }
            } else {
                console.log("Admin Password Doesn't Match");
                res.status(401).send('Invalid Credentials');
            }
        } catch (error) {
            console.error('Error During Admin Login:', error);
            res.status(500).send('Server error');
        }
    });

    return router;
};
