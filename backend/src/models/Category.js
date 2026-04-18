const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    slug:   { type: String, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    icon:   { type: String, default: '' },
    order:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Async style — compatible con Mongoose 7+
categorySchema.pre('save', async function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Category', categorySchema);
