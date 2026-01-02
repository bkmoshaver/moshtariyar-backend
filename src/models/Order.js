/**
 * Order Model
 * مدل سفارشات فروشگاه
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  
  // اطلاعات مشتری (مهمان)
  customerName: {
    type: String,
    required: [true, 'نام مشتری الزامی است'],
    trim: true
  },
  customerPhone: {
    type: String,
    required: [true, 'شماره تماس مشتری الزامی است'],
    trim: true
  },
  
  // اقلام سفارش
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: String, // ذخیره نام محصول در لحظه خرید
    price: Number, // ذخیره قیمت در لحظه خرید
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  
  // مالی
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // وضعیت
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  note: {
    type: String,
    trim: true,
    maxlength: 500
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
