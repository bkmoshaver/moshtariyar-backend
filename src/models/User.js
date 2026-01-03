const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  username: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values to be duplicated (for existing users)
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'staff', 'tenant_admin', 'super_admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  // Link user to a tenant (store)
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: false
  },
  // Profile fields
  avatar: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  isAddressPublic: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    default: ''
  },
  isPhonePublic: {
    type: Boolean,
    default: false
  },
  zipCode: {
    type: String,
    default: ''
  },
  isZipCodePublic: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    default: ''
  },
  links: [{
    title: String,
    url: String,
    icon: String,
    active: {
      type: Boolean,
      default: true
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
