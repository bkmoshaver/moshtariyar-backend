const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  originalPrice: Number,
  type: {
    type: String,
    enum: ['product', 'service'],
    default: 'product'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  },
  category: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
