const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  const [totalProducts, activeProducts, lowStock, totalOrders, pendingOrders, totalUsers, revenueAgg, ordersByStatus] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 5 } }),
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  const revenue = revenueAgg[0]?.total || 0;
  const statusMap = Object.fromEntries(ordersByStatus.map(s => [s._id, s.count]));
  res.json({ success: true, stats: {
    products: { total: totalProducts, active: activeProducts, lowStock },
    orders: { total: totalOrders, pending: pendingOrders, revenue, byStatus: statusMap },
    users: { total: totalUsers }
  }});
};
