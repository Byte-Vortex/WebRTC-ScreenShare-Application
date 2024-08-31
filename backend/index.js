const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const http = require('http');
require('dotenv').config();
const authenticateAdminToken = require('./middleware/authenticateAdminToken'); // Import the middleware
const validator=require('validator')

const app = express();
app.use(express.json()); // Ensure JSON body parsing
app.use(cors());
// app.use(cors({
//     origin: "https://n-w-r.vercel.app",  // Explicitly allow this origin
//     methods: ["POST", "GET", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // Handle preflight requests for all routes
// app.options('*', cors({
//     origin: "https://n-w-r.vercel.app",
//     methods: ["POST", "GET", "OPTIONS", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

const userUri = "mongodb+srv://akshatanwar24:Akshat24Saini10@cluster0.faninty.mongodb.net/authDB?retryWrites=true&w=majority";
const adminUri = "mongodb+srv://akshatanwar24:Akshat24Saini10@cluster0.faninty.mongodb.net/authDB?retryWrites=true&w=majority";
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;

// User Database Connection
const userConnection = mongoose.createConnection(userUri, {
    serverSelectionTimeoutMS: 60000, // 60 seconds
    socketTimeoutMS: 45000 // 45 seconds
});
userConnection.on('connected', () => console.log('MongoDB User Database Connected...'));
userConnection.on('error', (err) => console.error('MongoDB (user) connection error:', err));

// Admin Database Connection
const adminConnection = mongoose.createConnection(adminUri, {
    serverSelectionTimeoutMS: 60000, // 60 seconds
    socketTimeoutMS: 45000 // 45 seconds
});
adminConnection.on('connected', () => console.log('MongoDB Admin Database Connected...'));
adminConnection.on('error', (err) => console.error('MongoDB (admin) connection error:', err));

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

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
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
    password: { type: String, required: true },
});

const User = userConnection.model('User', userSchema);
const Admin = adminConnection.model('Admin', adminSchema);

app.get("/", (req, res) => {
    res.json("Hello");
});

app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received Login Request for:', username);

    try {
        const user = await User.findOne({ username });

        if (!user) {
            console.log('User not Found');
            return res.status(401).send('Invalid Credentials');
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
                res.status(500).send('Error generating token');
            }
        } else {
            console.log(username, ": User Password Doesn't match");
            res.status(401).send('Invalid Credentials');
        }
    } catch (error) {
        console.error('Error During Login:', error);
        res.status(500).send('Server error');
    }
});

// Import admin routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes(Admin, jwtSecret));

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

app.post('/addUser', authenticateAdminToken, async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let uniqueConnectionId;
        let connectionIdExists = true;

        while (connectionIdExists) {
            uniqueConnectionId = generateConnectionId(8);
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
        console.error('Error adding user:', err);
        return res.status(500).json({ message: 'Error adding user' });
    }
});

app.delete('/deleteUser/:id', authenticateAdminToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'User Removed Successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ message: 'Error deleting user' });
    }
});

app.get('/getUsers', authenticateAdminToken, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

function generateConnectionId(length = 8) {
    const minLength = 10;
    const finalLength = Math.max(length, minLength);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let connectionId = '';
    for (let i = 0; i < finalLength; i++) {
        connectionId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return connectionId;
}

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});