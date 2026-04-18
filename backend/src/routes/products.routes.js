const router = require('express').Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
} = require('../controllers/products.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', getProducts);
router.get('/brands', getBrands);   // debe ir ANTES de /:slug
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
