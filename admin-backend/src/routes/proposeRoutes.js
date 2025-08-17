const express = require('express');
const proposeController = require('../controllers/proposeController');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.get('/', proposeController.index);
router.get('/all', proposeController.getAllProposes);
router.post('/', proposeController.store);
router.put('/:id', authenticate, proposeController.update);
router.delete('/:id', proposeController.destroy);

module.exports = router;