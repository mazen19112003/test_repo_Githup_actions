// controllers/statsController.js
const Customer = require('../models/Customer');
const Account = require('../models/accountModel');

const getStats = async (req, res) => {
  try {
    // عد عدد العملاء
    const customersCount = await Customer.countDocuments();

    // عد عدد الحسابات
    const accountsCount = await Account.countDocuments();

    // رجع البيانات كـ JSON
    res.json({
      customers: customersCount,
      accounts: accountsCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getStats,
};
