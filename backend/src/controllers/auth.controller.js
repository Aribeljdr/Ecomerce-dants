const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const formatUser = (user) => ({
  id:           user._id,
  name:         user.name,
  lastName:     user.lastName || '',
  dni:          user.dni || '',
  email:        user.email,
  role:         user.role,
  savedAddress: user.savedAddress || null,
});

const sendToken = (res, user, statusCode) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: formatUser(user),
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
  }

  const user = await User.create({ name, email, password });
  sendToken(res, user, 201);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }

  sendToken(res, user, 200);
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: formatUser(req.user) });
};

exports.updateProfile = async (req, res) => {
  const { name, lastName, dni, savedAddress } = req.body;

  const updates = {};
  if (name && name.trim()) updates.name = name.trim();
  if (lastName !== undefined) updates.lastName = lastName.trim();
  if (dni !== undefined) updates.dni = dni.trim();
  if (savedAddress !== undefined) updates.savedAddress = savedAddress;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  res.json({ success: true, user: formatUser(user) });
};
