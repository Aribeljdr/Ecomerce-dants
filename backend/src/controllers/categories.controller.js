const Category = require('../models/Category');

// GET /api/categories — árbol completo (raíz + hijos)
exports.getCategories = async (req, res) => {
  const all = await Category.find().sort('order name');

  // Construir árbol: categorías raíz con sus hijos
  const roots = all.filter((c) => !c.parent);
  const tree = roots.map((root) => ({
    ...root.toObject(),
    children: all.filter((c) => c.parent?.toString() === root._id.toString()),
  }));

  res.json({ success: true, categories: tree });
};

// POST /api/categories  (admin)
exports.createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
};

// DELETE /api/categories/:id  (admin)
exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
};
