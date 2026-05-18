const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'Name, email, and message are required' });
  await Contact.create(req.body);
  res.status(201).json({ message: 'Message received. Our team will contact you soon.' });
};
