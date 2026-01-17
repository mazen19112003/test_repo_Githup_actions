const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 🆕 أضفنا الاسم هنا
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, {
  timestamps: true // بيديك createdAt و updatedAt تلقائيًا
});

module.exports = mongoose.model('User', userSchema);
