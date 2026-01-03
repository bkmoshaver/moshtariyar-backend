const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام مجموعه الزامی است'],
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // New Fields
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  branding: {
    logo: String,
    banner: String,
    primaryColor: {
      type: String,
      default: '#000000'
    },
    secondaryColor: {
      type: String,
      default: '#ffffff'
    }
  },
  giftSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tenant', tenantSchema);
