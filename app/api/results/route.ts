import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Vote from '@/models/Vote';
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

    // Verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return errorResponse('Election not found', 404);
    }

    // Only show results for completed elections or active ones (real-time)
    const now = new Date();
    const canShowResults = election.status === 'completed' || 
                          (election.status === 'active' && now >= election.startDate);
    
    if (!canShowResults) {
      return errorResponse('Results are not available for this election yet', 403);
    }

    // Get candidates with vote counts
    const candidates = await Candidate.find({ electionId })
      .sort({ voteCount: -1, name: 1 })
      .lean();

    // Get total vote count
    const totalVotes = await Vote.countDocuments({ electionId });

    // Calculate percentages
    const candidatesWithPercentage = candidates.map(candidate => ({
      ...candidate,
      percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(2) : '0.00'
    }));

    const results = {
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate
      },
      totalVotes,
      candidates: candidatesWithPercentage,
      lastUpdated: new Date()
    };

    return successResponse(results, 'Election results retrieved successfully');

  } catch (error: any) {
    console.error('Get results error:', error);
    return errorResponse('Failed to retrieve election results', 500);
  }
}