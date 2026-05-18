const mongoose = require('mongoose');
const validator = require('validator');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Enter a valid email']
  }
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
