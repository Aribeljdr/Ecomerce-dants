const router = require('express').Router();
const { getStats } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
router.get('/stats', protect, adminOnly, getStats);
module.exports = router;
