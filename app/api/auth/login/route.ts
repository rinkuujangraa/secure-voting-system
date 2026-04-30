import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import { generateToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Set HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasVoted: user.hasVoted
    };

    return successResponse(
      userResponse,
      'Login successful'
    );

  } catch (error: any) {
    console.error('Login error:', error);
    
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
      'Internal server error occurred during login', 
      500
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('auth-token');
    
    return successResponse(null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Error during logout', 500);
  }
}