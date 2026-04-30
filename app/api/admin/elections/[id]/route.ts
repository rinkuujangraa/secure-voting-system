import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Vote from '@/models/Vote';
import { updateElectionSchema } from '@/lib/validations';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';

interface RouteParams {
  params: {
    id: string;
  };
}

// Update election
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateElectionSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    // Find and update election
    const election = await Election.findById(id);
    if (!election) {
      return errorResponse('Election not found', 404);
    }

    // Update fields
    const updateData = validationResult.data;
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        (election as any)[key] = updateData[key as keyof typeof updateData];
      }
    });

    await election.save();

    return successResponse(election, 'Election updated successfully');

  } catch (error: any) {
    console.error('Update election error:', error);
    return errorResponse('Failed to update election', 500);
  }
}

// Delete election
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = params;

    // Check if election has votes
    const voteCount = await Vote.countDocuments({ electionId: id });
    if (voteCount > 0) {
      return errorResponse('Cannot delete election that has received votes', 400);
    }

    // Delete candidates first
    await Candidate.deleteMany({ electionId: id });
    
    // Delete election
    const election = await Election.findByIdAndDelete(id);
    if (!election) {
      return errorResponse('Election not found', 404);
    }

    return successResponse(null, 'Election deleted successfully');

  } catch (error: any) {
    console.error('Delete election error:', error);
    return errorResponse('Failed to delete election', 500);
  }
}