const Product  = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products
exports.getProducts = async (req, res) => {
  const {
    category,      // ObjectId (opcional)
    categorySlug,  // slug de categoría (opcional, alternativa a category)
    brands,        // string con marcas separadas por coma: "NVIDIA,AMD"
    brand,         // compatibilidad — una sola marca
    minPrice,
    maxPrice,
    search,
    featured,
    sort  = '-createdAt',
    page  = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  // ── Categoría ──────────────────────────────────────────────────────────────
  if (categorySlug) {
    const found = await Category.findOne({ slug: categorySlug }).select('_id');
    if (found) filter.category = found._id;
    else return res.json({ success: true, total: 0, page: 1, pages: 1, products: [] });
  } else if (category) {
    filter.category = category;
  }

  // ── Marcas (una o varias) ──────────────────────────────────────────────────
  const brandList = (brands || brand || '')
    .split(',')
    .map(b => b.trim())
    .filter(Boolean);

  if (brandList.length === 1) {
    filter.brand = new RegExp(brandList[0], 'i');
  } else if (brandList.length > 1) {
    filter.brand = { $in: brandList.map(b => new RegExp(b, 'i')) };
  }

  // ── Precio ─────────────────────────────────────────────────────────────────
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // ── Búsqueda de texto ──────────────────────────────────────────────────────
  if (search) filter.$text = { $search: search };

  // ── Destacados ─────────────────────────────────────────────────────────────
  if (featured === 'true') filter.featured = true;

  // ── Query ──────────────────────────────────────────────────────────────────
  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    products,
  });
};

// GET /api/products/:slug
exports.getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
};

// POST /api/products  (admin)
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

// PUT /api/products/:id  (admin)
exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
};

// DELETE /api/products/:id  (admin) — soft delete
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, message: 'Product deactivated' });
};

// GET /api/products/brands?categorySlug=slug  — marcas distintas (opcionalmente por categoría)
exports.getBrands = async (req, res) => {
  const { categorySlug } = req.query;
  const filter = { isActive: true };

  if (categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug }).select('_id');
    if (cat) filter.category = cat._id;
    else return res.json({ success: true, brands: [] });
  }

  const brands = await Product.distinct('brand', filter);
  res.json({ success: true, brands: brands.sort() });
};
