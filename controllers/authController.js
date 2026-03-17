import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, cookieOptions } from '../config.js';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });

      const token = generateToken(user._id);
      // send httpOnly cookie
      res.cookie('token', token, cookieOptions);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token
        }
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'please correct email address' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'please enter correct password ' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user (by id). If password is being updated, save() is used to trigger pre-save hashing.
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is present, load the user and set fields, then save to trigger hashing
    if (updateData.password) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      user.name = updateData.name ?? user.name;
      user.email = updateData.email ?? user.email;
      user.password = updateData.password;
      await user.save();

      const token = generateToken(user._id);
      res.cookie('token', token, cookieOptions);

      return res.status(200).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, token } });
    }

    // Otherwise do a normal findByIdAndUpdate
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Logout (clear the auth cookie)
export const logout = (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
