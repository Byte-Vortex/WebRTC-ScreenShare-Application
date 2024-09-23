const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const http = require('http');
require('dotenv').config();
const authenticateAdminToken = require('./middleware/authenticateAdminToken'); // Import the middleware
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors({
    origin: "https://n-w-r.vercel.app" || "https://nwr-webrtc.bytevortex.in/",  // Explicitly allow this origin
    methods: ["POST", "GET", "OPTIONS", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests for all routes
app.options('*', cors({
    origin: "https://n-w-r.vercel.app" || "https://nwr-webrtc.bytevortex.in/",
    methods: ["POST", "GET", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const userUri = process.env.MONGODB_URI;
const adminUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;

// User Database Connection
const userConnection = mongoose.createConnection(userUri, {
    serverSelectionTimeoutMS: 60000, // 30 seconds
    socketTimeoutMS: 45000 // 45 seconds
});
userConnection.on('connected', () => console.log('MongoDB User Database Connected...'));
userConnection.on('error', (err) => console.error('MongoDB (user) connection error:', err));

// Admin Database Connection
const adminConnection = mongoose.createConnection(adminUri, {
    serverSelectionTimeoutMS: 60000, // 30 seconds
    socketTimeoutMS: 55000 // 45 seconds
});
adminConnection.on('connected', () => console.log('MongoDB Admin Database Connected...'));
adminConnection.on('error', (err) => console.error('MongoDB (admin) connection error:', err));

// Password Reset Token Schema
const passwordResetTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    expiration: { type: Date, required: true }
});
const PasswordResetToken = userConnection.model('PasswordResetToken', passwordResetTokenSchema);

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return validator.isEmail(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    connectionId: { type: String, unique: true },
});

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = userConnection.model('User', userSchema);
const Admin = adminConnection.model('Admin', adminSchema);

app.get("/", (req, res) => {
    res.json("Hello");
});

// -------------------- User Login --------------------
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received Login Request for:', username);

    try {
        const user = await User.findOne({ username });

        if (!user) {
            console.log('User not Found');
            return res.status(401).send({ error: 'Invalid Username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log(username, ': Password Matched');
            try {
                const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
                console.log('Generated User Token:', token);
                res.json({ success: true, token });
            } catch (error) {
                console.error('Error Generating User Token:', error);
                res.status(500).send({ error: 'Error while Login !' });
            }
        } else {
            console.log(username, ": User Password Doesn't match");
            res.status(401).send({ error: 'Invalid Password' });
        }
    } catch (error) {
        console.error('Error During Login:', error);
        res.status(500).send({ error: 'Server Error' });
    }
});


// -------------------- Forgot Password --------------------
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log('Received Forgot Password Request for:', email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        console.log('User found');
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = Date.now() + 10 * 60 * 1000; // 10 minutes

        await PasswordResetToken.create({ userId: user._id, token, expiration });

        const resetLink = `https://n-w-r.vercel.app/reset-password/${user._id}/${token}`;
        
        try {
            await sendPasswordResetEmail(user.email, resetLink);
            console.log('Password reset email sent successfully');
            return res.status(200).json({ status: 'success', message: 'Password reset link sent to your email' });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            return res.status(500).json({ status: 'error', message: 'Error sending password reset email' });
        }
    } catch (error) {
        console.error('Error in password reset request:', error);
        return res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// -------------------- Helper Function for Sending Emails --------------------
async function sendPasswordResetEmail(toEmail, resetLink) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Password Reset Requested',
        html: `<p>You have requested a password reset. Click <a href="${resetLink}">Here</a> to reset your password.
        Important: If you did not request this password reset, please ignore this email.
        </p>`
    };

    // Use Promise-based approach for better error handling
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                    return reject(new Error('Error sending password reset email'));
                } else {
                    console.log('Email sent successfully:', info.response);
                    return resolve(info.response);
                }
            });
        });
}

// -------------------- Validate Reset Token --------------------
app.post('/api/validate-token', async (req, res) => {
    const { token } = req.body;

    try {
        const passwordReset = await PasswordResetToken.findOne({ token });
        if (!passwordReset || passwordReset.expiration < Date.now()) {
            console.log('Token invalid or expired');
            return res.status(400).json({ status: 'error', message: 'Token invalid or expired' });
        }

        res.status(200).json({ status: 'success', message: 'Token is valid' });
    } catch (error) {
        console.error('Error validating token:', error);
        console.log("'Error validating token");
        res.status(500).json({ status: 'error', message: 'Server error during token validation' });
    }
});


// -------------------- Reset Password --------------------
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Find the password reset token in the database
        const passwordReset = await PasswordResetToken.findOne({ token });
        
        // Check if the token is invalid or expired
        if (!passwordReset || passwordReset.expiration < Date.now()) {
            return res.status(400).send('Token expired or invalid');
        }

        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the User collection
        await User.updateOne({ _id: passwordReset.userId }, { password: hashedPassword });

        // Remove the reset token from the database after successful reset
        await PasswordResetToken.deleteOne({ token });

        // Send a success response after password reset
        res.status(200).send('Password has been reset successfully');
    } catch (error) {
        // Log and handle any server errors
        console.error('Error during password reset:', error);
        res.status(500).send('Server error');
    }
});


// -------------------- Admin Routes Integration --------------------
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes(Admin, jwtSecret));

// -------------------- Connection ID Fetch --------------------
app.get('/api/getConnectionId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send('Authorization header missing');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const connectionId = user.connectionId;
        const name = user.name; 
        res.json({ connectionId, name });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).send('Token Expired. Please Login Again.');
        } else {
            res.status(500).send('Error fetching connectionId');
        }
    }
});

// -------------------- Verify Connection ID --------------------
app.post('/api/verify-connection', async (req, res) => {
    const { connectionId } = req.body;

    try {
        const user = await User.findOne({ connectionId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Connection ID not found' });
        }

        return res.status(200).json({ success: true, message: 'Connection ID is valid' });
    } catch (error) {
        console.error('Error verifying connection ID:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -------------------- Get Users with Admin Authentication --------------------
app.get('/getUsers', authenticateAdminToken, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
app.post('/addUser', authenticateAdminToken, async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let uniqueConnectionId;
        let connectionIdExists = true;

        while (connectionIdExists) {
            uniqueConnectionId = generateConnectionId(10);
            const existingUser = await User.findOne({ connectionId: uniqueConnectionId });
            if (!existingUser) {
                connectionIdExists = false;
            }
        }

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            connectionId: uniqueConnectionId
        });

        await newUser.save();
        console.log(username, ': User Added Successfully');
        return res.status(201).json({ message: 'User Added Successfully' });
    } catch (err) {
        // Handle validation and MongoDB errors
        if (err.name === 'ValidationError') {
            console.error('Validation Error:', err.message);
            return res.status(400).json({ message: err.message });
        }
        if (err.code === 11000) {
            console.error('Duplicate Key Error:', err);
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
        }
        console.error('Error adding user:', err);
        return res.status(500).json({ message: 'Error adding user' });
    }
});

app.delete('/deleteUser/:id', authenticateAdminToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'User Removed Successfully' });
    } catch (err) {
        console.error('Error removing user:', err);
        return res.status(500).json({ message: 'Error removing user' });
    }
});

// Function to generate a connection ID
function generateConnectionId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Server running and working !')
});
