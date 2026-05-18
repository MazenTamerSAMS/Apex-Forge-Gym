const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userInfo: {
    fullName: String,
    email: String
  },
  purchasedProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplement' },
    name: String,
    price: Number,
    quantity: Number
  }],
  selectedPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  trainerBookings: [{
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
    date: String,
    notes: String
  }],
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  total: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
