const mongoose = require('mongoose');
const domainSchema = new mongoose.Schema({
  domainName: String,
  customerName: String,
  notes: String,
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
});
module.exports = mongoose.model('Domain', domainSchema);