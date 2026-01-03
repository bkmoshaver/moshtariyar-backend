const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  customerName: {
    type: String,
    required: [true, 'Please add customer name']
  },
  customerPhone: {
    type: String,
    required: [true, 'Please add customer phone']
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  note: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
