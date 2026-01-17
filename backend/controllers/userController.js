// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

const addUser = async (req, res) => {
  const { email, password, role,name } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashed, role,name });
    await user.save();

    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getusers = async (req, res) => {
    try {
      const users = await User.find(); // بيجيب كل اليوزرز من MongoDB
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

   const updateUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const { email, password,name, role } = req.body;
  
      const updateData = {};
      if (name) updateData.name = name 
      if (email) updateData.email = email;
      if (role && req.user?.role === 'admin') {
      updateData.role = role;
    }
      if (password) {
        const salt = await bcrypt.genSalt(10);  // إنشاء "salt" (مفتاح مخصص لتشفير كلمة المرور)
        updateData.password = await bcrypt.hash(password, salt);  // تشفير كلمة المرور
      }  
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: 'Error updating user', error: err.message });
    }
  };


module.exports = { addUser , getusers,deleteUser, updateUser};
