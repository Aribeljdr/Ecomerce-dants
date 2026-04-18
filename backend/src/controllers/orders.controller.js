const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders — crea una orden (guest o autenticado)
exports.createOrder = async (req, res) => {
  const { items, shipping, payment, guestEmail } = req.body;

  if (!items?.length) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }
  if (!shipping?.name || !shipping?.address || !shipping?.city || !shipping?.zip || !shipping?.country) {
    return res.status(400).json({ success: false, message: 'Shipping info is incomplete' });
  }

  // Verificar stock y reconstruir items con precios reales (nunca confiar en el cliente)
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product not available: ${item.product}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0] || '',
    });
    subtotal += product.price * item.quantity;
  }

  const shippingCost = subtotal >= 1000 ? 0 : 15; // envío gratis sobre $1000
  const total = subtotal + shippingCost;

  const order = await Order.create({
    user: req.user?._id || null,
    guestEmail: req.user ? null : guestEmail,
    items: orderItems,
    shipping,
    payment: payment || {},
    subtotal,
    shippingCost,
    total,
  });

  // Descontar stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  res.status(201).json({ success: true, order });
};

// GET /api/orders/me — historial del usuario autenticado
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .select('-__v');

  res.json({ success: true, orders });
};

// GET /api/orders/:id — detalle de orden (propietario o admin)
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = order.user?.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, order });
};

// GET /api/orders  (admin) — all orders paginated with optional status filter
exports.getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
    Order.countDocuments(filter)
  ]);
  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1, orders });
};

// PATCH /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};
