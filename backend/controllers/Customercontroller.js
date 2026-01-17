const Customer = require('../models/Customer');

// Add new customer
exports.addCustomer = async (req, res) => {
  try {
    const { name } = req.body;
    const customer = new Customer({ name });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add customer' });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

exports.deleteCustomer = async (req, res) => {
    try {
      await Customer.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Customer deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete customer', error });
    }
  };
  
  // Update customer
  exports.updateCustomer = async (req, res) => {
    try {
      const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update customer', error });
    }
  };


  