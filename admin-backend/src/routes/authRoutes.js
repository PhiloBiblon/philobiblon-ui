const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();
const authenticate = require('../middleware/authenticate');


router.get('/', authenticate, authController.index);
router.get('/register', userController.store);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;