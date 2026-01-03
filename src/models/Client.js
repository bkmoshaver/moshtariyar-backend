const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  email: String,
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  stats: {
    totalServices: {
      type: Number,
      default: 0
    },
    lastVisit: Date
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', ClientSchema);
