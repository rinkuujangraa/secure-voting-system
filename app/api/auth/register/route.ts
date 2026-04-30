import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    const { name, email, password, role, adminInviteCode } = validationResult.data;
    const requestedRole = role === 'admin' ? 'admin' : 'user';
    const adminRegistrationSecret = process.env.ADMIN_REGISTRATION_SECRET;

    if (requestedRole === 'admin' && (!adminRegistrationSecret || adminInviteCode !== adminRegistrationSecret)) {
      return errorResponse('Invalid admin registration secret', 403);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: requestedRole
    });

    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasVoted: user.hasVoted,
      createdAt: user.createdAt
    };

    return successResponse(
      userResponse, 
      'User registered successfully', 
      201
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return errorResponse('User with this email already exists', 409);
    }
    
    // Handle specific MongoDB connection errors
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('MongooseServerSelectionError') ||
      error.message.includes('querySrv') ||
      error.message.includes('ENOTFOUND')
    ) {
      return errorResponse(
        'Database connection failed. Please verify your MongoDB Atlas URI, network access (IP allowlist), and DNS settings.', 
        503
      );
    }
    
    return errorResponse(
      'Internal server error occurred during registration', 
      500
    );
  }
}