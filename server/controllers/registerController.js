const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('../data/User');

// Define input schema
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required()
});

exports.register = async (req, res) => {
  // Validate and sanitize input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { username, password, email } = value;

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'User exists' });

    // Hash password securely
    const saltRounds = 12;
    const hashed = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ username, email, password: hashed });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Internal error' });
  }
};