import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Election from '@/models/Election';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current time to filter active elections for users
    const now = new Date();
    
    // Get elections that are active or upcoming
    const elections = await Election.find({
      $or: [
        { status: 'active' },
        { status: 'upcoming', startDate: { $gte: now } }
      ]
    })
    .sort({ startDate: 1 })
    .lean();

    // Add computed isActive field
    const electionsWithStatus = elections.map(election => ({
      ...election,
      isActive: election.status === 'active' && 
                now >= new Date(election.startDate) && 
                now <= new Date(election.endDate)
    }));

    return successResponse(electionsWithStatus, 'Elections retrieved successfully');

  } catch (error: any) {
    console.error('Get elections error:', error);
    return errorResponse('Failed to retrieve elections', 500);
  }
}