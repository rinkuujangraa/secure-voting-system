import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';
import { z } from 'zod';

// Validation schema for creating user/elector
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  role: z.enum(['user', 'admin']).default('user')
});

// Create new user/elector (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();

    // Validate input
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    const { name, email, password, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role
    });

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasVoted: user.hasVoted,
      createdAt: user.createdAt
    };

    return successResponse(
      userResponse,
      `${role === 'admin' ? 'Admin' : 'Elector'} created successfully`,
      201
    );

  } catch (error: any) {
    console.error('Create user error:', error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return errorResponse('User with this email already exists', 409);
    }

    return errorResponse('Failed to create user', 500);
  }
}

// Get all users/electors (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role'); // 'user' or 'admin'

    let query = {};
    if (roleFilter && (roleFilter === 'user' || roleFilter === 'admin')) {
      query = { role: roleFilter };
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(users, 'Users retrieved successfully');

  } catch (error: any) {
    console.error('Get users error:', error);
    return errorResponse('Failed to retrieve users', 500);
  }
}
