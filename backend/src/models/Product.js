const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    slug:           { type: String, unique: true },
    category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand:          { type: String, required: true, trim: true },
    price:          { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    stock:          { type: Number, required: true, default: 0, min: 0 },
    images:         [{ type: String }],
    description:    { type: String, default: '' },
    specs:          { type: mongoose.Schema.Types.Mixed, default: {} },
    tags:           [{ type: String }],
    featured:       { type: Boolean, default: false },
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:    { type: Number, default: 0 },
    isActive:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Async style — compatible con Mongoose 7+
productSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Índices (slug ya tiene unique:true arriba, no se repite)
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
