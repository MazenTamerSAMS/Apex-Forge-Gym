const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Strength', 'Cardio', 'Functional', 'Recovery'], required: true },
  muscleGroup: { type: String, required: true },
  quantity: { type: Number, min: 1, default: 1 },
  status: { type: String, enum: ['Available', 'Maintenance', 'Limited'], default: 'Available' },
  imageUrl: String,
  description: String,
  specs: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);
