const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const validator = require('validator');

const adminUri = process.env.MONGODB_URI;
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

mongoose
  .connect(adminUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log('MongoDB connection error:', err));

async function createAdmin(name, username, email, plaintextPassword) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);

    const newAdmin = new Admin({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log(`Admin ${username} created successfully`);
  } catch (err) {
    console.error(`Error creating admin ${username}:`, err.message);
  } finally {
    mongoose.disconnect();
  }
}

// Replace 'admin' and 'adminpassword' with your desired admin username and password
createAdmin('Akshat Saini', 'akshat', 'akshatanwar24@gmail.com', '2410');
