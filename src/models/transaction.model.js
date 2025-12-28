const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'manual_adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relatedService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff or Admin who performed the action
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
transactionSchema.index({ client: 1, createdAt: -1 });
transactionSchema.index({ tenant: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
