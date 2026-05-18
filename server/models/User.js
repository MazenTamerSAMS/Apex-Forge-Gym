const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const bmiSchema = new mongoose.Schema({
  bmi: Number,
  category: String,
  height: Number,
  weight: Number,
  age: Number,
  gender: String,
  createdAt: { type: Date, default: Date.now }
});

const trainerPlanExerciseSchema = new mongoose.Schema({
  machine: String,
  exercise: String,
  sets: String,
  reps: String,
  focus: String
}, { _id: false });

const trainerPlanFoodSchema = new mongoose.Schema({
  meal: String,
  items: [{ type: String }],
  note: String
}, { _id: false });

const trainerSubscriptionSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  trainerName: String,
  specialty: String,
  date: String,
  notes: String,
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  plan: {
    title: String,
    summary: String,
    machines: [trainerPlanExerciseSchema],
    foods: [trainerPlanFoodSchema]
  },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Enter a valid email']
  },
  password: { type: String, required: true, minlength: 8, select: false },
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not'], default: 'prefer-not' },
  selectedMembershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subscriptionStatus: { type: String, enum: ['none', 'active', 'cancelled'], default: 'none' },
  bmiHistory: [bmiSchema],
  favoriteTrainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }],
  trainerSubscriptions: [trainerSubscriptionSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplement' }],
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
