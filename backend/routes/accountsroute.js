const express = require('express');
const router = express.Router();
const account = require('../controllers/accountscontroller');
const auth = require('../middleware/authtokenMiddleware')
const { isAdmin } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/state');

router.get('/stats', getStats);
router.get('/accounts/:id', account.getaccount);

router.post('/accounts',isAdmin,account.Add_account)
router.get('/accounts',auth,account.getAccounts)
router.put('/accounts/:id',auth, account.updateAccount); // Update account
router.delete('/accounts/:id',auth, account.deleteAccount); // Delete account
router.get('/accounts/by-customer/:customerId',account.getcustomeraccount)
router.get('/nameservers/:accountId/:domain', account.getNameserversForDomain);


module.exports = router;
