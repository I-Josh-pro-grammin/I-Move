import bcrypt from 'bcryptjs';
import { User } from '../models/userModel.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, full_name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and phone are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name: full_name || name,
      email,
      phone,
      password: hashed,
      role: role || 'passenger',
      is_available: role === 'rider' ? true : false,
    });

    // Exclude password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(201).json({
      success: true,
      token: generateToken(user),
      user: userObj,
      message: "User registered successfully"
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Exclude password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json({
      success: true,
      token: generateToken(user),
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Missing latitude or longitude"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { latitude, longitude },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully"
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: "Logged out successfully"
  });
};