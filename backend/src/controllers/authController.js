import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getZoneFromDistrict } from '../utils/districtZoneMapper.js';

const prisma = new PrismaClient();

// Register a new user
export const register = async (req, res) => {
  try {
    const { full_name, phone_number, email, password, role, latitude, longitude, district, business_name, address } = req.body;

    // Validate required fields
    if (!full_name || !phone_number || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone number, password, and role are required'
      });
    }

    // Validate role (only BUYER and FARMER can self-register)
    const validRoles = ['BUYER', 'FARMER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be BUYER or FARMER'
      });
    }

    // Role-specific validation
    if (role === 'FARMER' && (!latitude || !longitude || !district)) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates and district are required for farmers'
      });
    }

    // if (role === 'BUYER') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Buyer registration is currently disabled. The system operates with fixed zone buyers. Please contact admin for access.'
    //   });
    // }

    // Check if user already exists by phone
    const existingUser = await prisma.user.findUnique({
      where: { phone_number }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user data object
    const userData = {
      full_name,
      phone_number,
      email,
      password_hash,
      role,
      status: 'PENDING', // New farmers need approval
      is_active: true
    };

    // Add role-specific fields
    if (role === 'FARMER') {
      userData.latitude = parseFloat(latitude);
      userData.longitude = parseFloat(longitude);
      userData.district = district;

      // Auto-assign zone based on district
      const assignedZone = getZoneFromDistrict(district);
      if (!assignedZone) {
        return res.status(400).json({
          success: false,
          message: `Invalid district: ${district}. Please provide a valid Tamil Nadu district.`
        });
      }
      userData.zone = assignedZone;
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        role: true,
        status: true,
        is_active: true,
        created_at: true
      }
    });

    // NOTE: We do NOT log them in automatically - they need admin approval first
    // Just return success message
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please wait for admin approval.',
      data: { user }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user (UNCHANGED - keep admin auth flow intact)
export const login = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Validate required fields
    if (!phone_number || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone_number }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is approved (except for ADMIN)
    if (user.role !== 'ADMIN' && user.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Your account is awaiting admin approval. Please try again later.'
      });
    }

    if (user.role !== 'ADMIN' && user.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact support.'
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 minutes
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days
    );

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return access token only (no user data)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
