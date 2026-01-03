const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام الزامی است'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'ایمیل الزامی است'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'لطفاً یک ایمیل معتبر وارد کنید']
  },
  password: {
    type: String,
    required: [true, 'رمز عبور الزامی است'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'staff', 'client'],
    default: 'client'
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  // Profile Fields
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String // URL or Base64
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  privacy: {
    showPhone: { type: Boolean, default: false },
    showAddress: { type: Boolean, default: false },
    showPostalCode: { type: Boolean, default: false }
  },
  links: [{
    title: String,
    url: String,
    icon: String,
    active: { type: Boolean, default: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
