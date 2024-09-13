const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adminUri = process.env.MONGODB_URI;
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const Admin = mongoose.model('Admin', adminSchema);

// Connect to MongoDB (removed deprecated options)
mongoose.connect(adminUri)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

async function createAdmin(name, username, plaintextPassword) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);

    const newAdmin = new Admin({
      name: name,
      username: username,
      password: hashedPassword
    });

    await newAdmin.save();
    console.log(`Admin ${username} created successfully`);
  } catch (err) {
    console.error(`Error creating admin ${username}: ${err.message}`);
  } finally {
    // Ensure mongoose disconnects after operation
    mongoose.disconnect();
  }
}

// Create the admin
createAdmin('Admin', 'admin', '');
