const router = require('express').Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categories.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
