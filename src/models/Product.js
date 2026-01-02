/**
 * Product Model
 * مدل محصول/خدمت - برای نمایش در فروشگاه
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // ارتباط با تنانت (فروشگاه)
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'فروشگاه الزامی است'],
    index: true
  },

  // نوع آیتم: کالا یا خدمت
  type: {
    type: String,
    enum: ['product', 'service'],
    default: 'product',
    required: true
  },

  // عنوان
  title: {
    type: String,
    required: [true, 'عنوان محصول/خدمت الزامی است'],
    trim: true,
    maxlength: [200, 'عنوان حداکثر 200 کاراکتر است']
  },

  // توضیحات
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'توضیحات حداکثر 2000 کاراکتر است']
  },

  // قیمت
  price: {
    type: Number,
    required: [true, 'قیمت الزامی است'],
    min: [0, 'قیمت نمی‌تواند منفی باشد']
  },

  // قیمت خط خورده (تخفیف)
  originalPrice: {
    type: Number,
    min: [0, 'قیمت اصلی نمی‌تواند منفی باشد']
  },

  // موجودی (فقط برای کالا)
  stock: {
    type: Number,
    default: 0,
    min: 0
  },

  // وضعیت نمایش
  isActive: {
    type: Boolean,
    default: true
  },

  // دسته‌بندی (اختیاری)
  category: {
    type: String,
    trim: true
  },

  // تصویر (URL)
  image: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ tenant: 1, isActive: 1 });
productSchema.index({ tenant: 1, type: 1 });

module.exports = mongoose.model('Product', productSchema);
