import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import { validateObjectId } from '@/lib/objectid';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    
    if (!electionId) {
      return errorResponse('Election ID is required', 400);
    }
    try {
      validateObjectId(electionId, 'Election ID');
    } catch (validationError: any) {
      return errorResponse(validationError.message, 400);
    }

    // Verify election exists and is accessible
    const election = await Election.findById(electionId);
    if (!election) {
      return errorResponse('Election not found', 404);
    }

    // Get candidates for the election
    const candidates = await Candidate.find({ electionId })
      .sort({ voteCount: -1, name: 1 })
      .populate('electionId', 'title status')
      .lean();

    return successResponse(candidates, 'Candidates retrieved successfully');

  } catch (error: any) {
    console.error('Get candidates error:', error);
    return errorResponse('Failed to retrieve candidates', 500);
  }
}