const router = require('express').Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orders.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Crear orden no requiere auth (guest checkout)
router.post('/', createOrder);

// Estas sí requieren auth
router.get('/me', protect, getMyOrders);
router.get('/:id', getOrderById); // lógica de acceso dentro del controller

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
