const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { email: email.toLowerCase() }, { upsert: true });
  res.status(201).json({ message: 'Subscribed to ApexForge updates' });
};
