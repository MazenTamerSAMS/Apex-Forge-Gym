const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getPasswordStrength } = require('../utils/passwordStrength');

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || 'dev_secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const hashResetCode = (code) => crypto
  .createHash('sha256')
  .update(String(code))
  .digest('hex');

const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  age: user.age,
  gender: user.gender,
  role: user.role,
  selectedMembershipPlan: user.selectedMembershipPlan,
  subscriptionStatus: user.subscriptionStatus,
  bmiHistory: user.bmiHistory,
  favoriteTrainers: user.favoriteTrainers,
  trainerSubscriptions: user.trainerSubscriptions,
  wishlist: user.wishlist
});

exports.register = async (req, res) => {
  const { fullName, email, password, age, gender } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
  const strength = getPasswordStrength(password);
  if (strength.level === 'weak') {
    return res.status(400).json({ message: `Password is too weak. Please ${strength.feedback.slice(0, 2).join(' and ')}.` });
  }

  const duplicate = await User.findOne({ email: email.toLowerCase() });
  if (duplicate) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ fullName, email, password, age, gender });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password || ''))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) {
    return res.json({ message: 'If that email exists, a reset code has been created.' });
  }

  const resetCode = crypto.randomInt(100000, 1000000).toString();
  user.resetPasswordToken = hashResetCode(resetCode);
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  res.json({
    message: 'Reset code created. Use it within 15 minutes.',
    resetCode
  });
};

exports.resetPassword = async (req, res) => {
  const { email, resetCode, password } = req.body;
  if (!email || !resetCode || !password) {
    return res.status(400).json({ message: 'Email, reset code, and new password are required' });
  }

  const strength = getPasswordStrength(password);
  if (strength.level === 'weak') {
    return res.status(400).json({ message: `Password is too weak. Please ${strength.feedback.slice(0, 2).join(' and ')}.` });
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: hashResetCode(resetCode),
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) return res.status(400).json({ message: 'Reset code is invalid or expired' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully', token: signToken(user), user: publicUser(user) });
};

exports.profile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('selectedMembershipPlan favoriteTrainers wishlist trainerSubscriptions.trainer')
    .select('-password');
  res.json(user);
};

exports.saveBmi = async (req, res) => {
  const { bmi, category, height, weight, age, gender } = req.body;
  req.user.bmiHistory.unshift({ bmi, category, height, weight, age, gender });
  await req.user.save();
  res.json({ message: 'BMI saved', bmiHistory: req.user.bmiHistory });
};
