const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adminUri = proess.env.MONGODB_URI;
const adminSchema = new mongoose.Schema({
  name:{
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

mongoose.connect(adminUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

async function createAdmin(name,username, plaintextPassword) {
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
    mongoose.disconnect();
  } catch (err) {
    console.error(`Error creating admin ${username}:, err.message`);
    mongoose.disconnect();
  }
}

// Replace 'admin' and 'adminpassword' with your desired admin username and password
createAdmin('Admin','admin', '1234');