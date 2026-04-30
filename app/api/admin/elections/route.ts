import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Election from '@/models/Election';
import { createElectionSchema, updateElectionSchema } from '@/lib/validations';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';

// Create new election (Admin only)
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
    const validationResult = createElectionSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    const { title, description, startDate, endDate } = validationResult.data;

    // Create election
    const election = new Election({
      title: title.trim(),
      description: description.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'upcoming'
    });

    await election.save();

    return successResponse(
      election,
      'Election created successfully',
      201
    );

  } catch (error: any) {
    console.error('Create election error:', error);
    return errorResponse('Failed to create election', 500);
  }
}

// Get all elections (Admin view)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    // Get all elections with full details
    const elections = await Election.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Add computed fields
    const now = new Date();
    const electionsWithStatus = elections.map(election => ({
      ...election,
      isActive: election.status === 'active' && 
                now >= new Date(election.startDate) && 
                now <= new Date(election.endDate),
      canStart: election.status === 'upcoming' && now >= new Date(election.startDate),
      canEnd: election.status === 'active' && now <= new Date(election.endDate)
    }));

    return successResponse(electionsWithStatus, 'Elections retrieved successfully');

  } catch (error: any) {
    console.error('Get elections error:', error);
    return errorResponse('Failed to retrieve elections', 500);
  }
}