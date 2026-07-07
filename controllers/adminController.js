import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: '7d'
  });
};

const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;
   
    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Invalid admin secret' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Admin email already in use' });
    }

    const admin = await Admin.create({ name, email, password, role: 'admin' });

    const token = generateAdminToken(admin._id);
    res.cookie('admin_token', token, adminCookieOptions);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const token = generateAdminToken(admin._id);
    res.cookie('admin_token', token, adminCookieOptions);

    res.status(200).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Admin (by id). If password is being updated, save() is used to trigger pre-save hashing.
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is present, load the admin and set fields, then save to trigger hashing
    if (updateData.password) {
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }
      admin.name = updateData.name ?? admin.name;
      admin.email = updateData.email ?? admin.email;
      admin.password = updateData.password;
      await admin.save();

      const token = generateAdminToken(admin._id);
      res.cookie('admin_token', token, adminCookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, token }
      });
    }

    // Otherwise do a normal findByIdAndUpdate
    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const adminLogout = (req, res) => {
  res.clearCookie('admin_token', { ...adminCookieOptions, maxAge: 0 });
  res.status(200).json({ success: true, message: 'Admin logged out successfully' });
};
