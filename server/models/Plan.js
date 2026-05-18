const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  features: [{ type: String, required: true }],
  duration: { type: String, default: 'Monthly' },
  activeSubscribersCount: { type: Number, default: 0 },
  highlighted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
