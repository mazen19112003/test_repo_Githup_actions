const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: String,
    apiToken: String,
    email: String,
    note: String,
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    }
  }, { timestamps: true });

  
module.exports = mongoose.model('Account', accountSchema);