const mongoose = require('mongoose');

const supplementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Protein', 'Creatine', 'Pre-workout'], required: true },
  price: { type: Number, required: true },
  rating: { type: Number, min: 0, max: 5, default: 4.7 },
  stockQuantity: { type: Number, default: 25 },
  description: String,
  productImage: String
}, { timestamps: true });

module.exports = mongoose.model('Supplement', supplementSchema);
