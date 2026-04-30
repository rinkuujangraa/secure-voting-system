import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vote from '@/models/Vote';
import Election from '@/models/Election';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';

interface RouteParams {
  params: {
    id: string;
  };
}

// Delete candidate (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = params;

    // Find candidate first
    const candidate = await Candidate.findById(id).populate('electionId');
    if (!candidate) {
      return errorResponse('Candidate not found', 404);
    }

    // Check if election has votes for this candidate
    const voteCount = await Vote.countDocuments({ candidateId: id });
    if (voteCount > 0) {
      return errorResponse('Cannot delete candidate that has received votes', 400);
    }

    // Check if election is still upcoming (can only delete from upcoming elections)
    const election = candidate.electionId as any;
    if (election.status !== 'upcoming') {
      return errorResponse('Cannot delete candidates from active or completed elections', 400);
    }

    // Delete candidate
    await Candidate.findByIdAndDelete(id);

    return successResponse(null, 'Candidate deleted successfully');

  } catch (error: any) {
    console.error('Delete candidate error:', error);
    return errorResponse('Failed to delete candidate', 500);
  }
}

// Update candidate (Admin only)
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

    // Find candidate
    const candidate = await Candidate.findById(id).populate('electionId');
    if (!candidate) {
      return errorResponse('Candidate not found', 404);
    }

    // Check if election is still upcoming
    const election = candidate.electionId as any;
    if (election.status !== 'upcoming') {
      return errorResponse('Cannot update candidates in active or completed elections', 400);
    }

    // Update allowed fields
    if (body.name) {
      candidate.name = body.name.trim();
    }
    if (body.party) {
      candidate.party = body.party.trim();
    }

    await candidate.save();

    const updatedCandidate = await Candidate.findById(id)
      .populate('electionId', 'title status')
      .lean();

    return successResponse(updatedCandidate, 'Candidate updated successfully');

  } catch (error: any) {
    console.error('Update candidate error:', error);
    
    if (error.code === 11000) {
      return errorResponse('Candidate with this name already exists in this election', 409);
    }
    
    return errorResponse('Failed to update candidate', 500);
  }
}