const express = require('express');
const router = express.Router();
const customerController = require('../controllers/Customercontroller');
const { isAdmin } = require('../middleware/authMiddleware');
const auth = require('../middleware/authtokenMiddleware');

router.post('/add',isAdmin, customerController.addCustomer);
router.get('/list', auth,customerController.getCustomers);
router.delete('/delete/:id',isAdmin, customerController.deleteCustomer);
router.put('/update/:id',isAdmin, customerController.updateCustomer);

module.exports = router;
