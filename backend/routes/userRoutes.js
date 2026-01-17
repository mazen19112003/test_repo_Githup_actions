// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const users = require('../controllers/userController');
const { isAdmin } = require('../middleware/authMiddleware');

router.post('/user', isAdmin, users.addUser);
router.get('/user', isAdmin, users.getusers);
router.delete('/user/:id',isAdmin, users.deleteUser);
router.put('/user/:id',isAdmin, users.updateUser);

module.exports = router;
