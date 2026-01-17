// backend/scripts/createUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const email = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'user'; // default = user
const name = process.argv[5] || 'No Name';

if (!email || !password) {
  console.error('❌ Usage: node createUser.js <email> <password> [role] [name]');
  process.exit(1);
}

mongoose.connect('mongodb://mongo:27017/cloud')
  .then(async () => {
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('ℹ️ User already exists');
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashed, role, name });
      await user.save();
      console.log(`✅ User ${email} created`);
    }
    process.exit();
  })
  .catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });
