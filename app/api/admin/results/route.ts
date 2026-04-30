import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Vote from '@/models/Vote';
import User from '@/models/User';
import { validateObjectId } from '@/lib/objectid';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

// Get detailed election results (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

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

    // Get candidates with vote counts
    const candidates = await Candidate.find({ electionId })
      .sort({ voteCount: -1, name: 1 })
      .lean();

    // Get detailed vote statistics
    const totalVotes = await Vote.countDocuments({ electionId });
    const totalRegisteredUsers = await User.countDocuments({ role: 'user' });
    
    // Get vote timestamps for analysis
    const voteTimestamps = await Vote.find({ electionId })
      .select('createdAt')
      .sort({ createdAt: 1 })
      .lean();

    // Calculate hourly vote distribution
    const hourlyVotes: Record<string, number> = {};
    voteTimestamps.forEach(vote => {
      const hour = new Date(vote.createdAt).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyVotes[hour] = (hourlyVotes[hour] || 0) + 1;
    });

    // Calculate percentages and additional stats
    const candidatesWithStats = candidates.map(candidate => ({
      ...candidate,
      percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(2) : '0.00',
      percentageOfRegistered: totalRegisteredUsers > 0 ? ((candidate.voteCount / totalRegisteredUsers) * 100).toFixed(2) : '0.00'
    }));

    // Find winner (candidate with most votes)
    const winner = candidatesWithStats.length > 0 ? candidatesWithStats[0] : null;

    const detailedResults = {
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate,
        createdAt: election.createdAt
      },
      statistics: {
        totalVotes,
        totalRegisteredUsers,
        turnoutPercentage: totalRegisteredUsers > 0 ? ((totalVotes / totalRegisteredUsers) * 100).toFixed(2) : '0.00',
        totalCandidates: candidates.length
      },
      candidates: candidatesWithStats,
      winner,
      voteDistribution: {
        hourlyVotes,
        firstVote: voteTimestamps[0]?.createdAt || null,
        lastVote: voteTimestamps[voteTimestamps.length - 1]?.createdAt || null
      },
      lastUpdated: new Date()
    };

    return successResponse(detailedResults, 'Detailed election results retrieved successfully');

  } catch (error: any) {
    console.error('Get admin results error:', error);
    return errorResponse('Failed to retrieve detailed election results', 500);
  }
}