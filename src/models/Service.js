const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  category: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);
