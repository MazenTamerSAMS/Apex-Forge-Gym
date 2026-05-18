const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: String,
  notes: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const checkPlanExerciseSchema = new mongoose.Schema({
  machine: { type: String, required: true },
  exercise: { type: String, required: true },
  sets: String,
  reps: String,
  focus: String
}, { _id: false });

const checkPlanFoodSchema = new mongoose.Schema({
  meal: { type: String, required: true },
  items: [{ type: String }],
  note: String
}, { _id: false });

const checkPlanSchema = new mongoose.Schema({
  title: { type: String, default: 'Trainer Check Plan' },
  summary: String,
  machines: [checkPlanExerciseSchema],
  foods: [checkPlanFoodSchema]
}, { _id: false });

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, min: 0, max: 5, default: 4.8 },
  availableSchedule: [{ type: String }],
  imageUrl: String,
  description: String,
  checkPlan: checkPlanSchema,
  bookings: [bookingSchema]
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);
