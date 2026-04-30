import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/Vote';
import User from '@/models/User';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import { voteSchema } from '@/lib/validations';
import { encryptVote } from '@/lib/encryption';
import { validateObjectId } from '@/lib/objectid';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();
  
  try {
    const body = await request.json();
    
    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return unauthorizedResponse('User authentication required');
    }

    // Validate input
    const validationResult = voteSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    const { candidateId, electionId } = validationResult.data;

    // Additional ObjectId validation
    try {
      validateObjectId(candidateId, 'Candidate ID');
      validateObjectId(electionId, 'Election ID');
      validateObjectId(userId, 'User ID');
    } catch (validationError: any) {
      return errorResponse(validationError.message, 400);
    }

    // Start transaction for atomic operation
    await session.startTransaction();

    // 1. Verify election exists and is active
    const election = await Election.findById(electionId).session(session);
    if (!election) {
      await session.abortTransaction();
      return errorResponse('Election not found', 404);
    }

    const now = new Date();
    const isElectionActive = election.status === 'active' && 
                           now >= election.startDate && 
                           now <= election.endDate;
    
    if (!isElectionActive) {
      await session.abortTransaction();
      return errorResponse('Election is not currently active', 400);
    }

    // 2. Verify candidate exists and belongs to this election
    const candidate = await Candidate.findOne({
      _id: candidateId,
      electionId: electionId
    }).session(session);
    
    if (!candidate) {
      await session.abortTransaction();
      return errorResponse('Candidate not found in this election', 404);
    }

    // 3. Check if user already voted in this election
    const existingVote = await Vote.findOne({
      voterId: userId,
      electionId: electionId
    }).session(session);

    if (existingVote) {
      await session.abortTransaction();
      return errorResponse('You have already voted in this election', 409);
    }

    // 4. Verify user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return unauthorizedResponse('User not found');
    }

    // 5. Encrypt the vote
    const encryptedVote = encryptVote(candidateId);

    // 6. Create the vote record
    const vote = new Vote({
      voterId: userId,
      electionId: electionId,
      candidateId: candidateId,
      encryptedVote: encryptedVote
    });

    await vote.save({ session });

    // 7. Increment candidate vote count
    await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { voteCount: 1 } },
      { session }
    );

    // 8. Update user hasVoted flag (optional - could be election-specific)
    await User.findByIdAndUpdate(
      userId,
      { hasVoted: true },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    return successResponse(
      {
        voteId: vote._id,
        electionId: electionId,
        timestamp: vote.createdAt
      },
      'Vote cast successfully',
      201
    );

  } catch (error: any) {
    await session.abortTransaction();
    console.error('Vote casting error:', error);
    
    // Handle duplicate key error (additional safety)
    if (error.code === 11000) {
      return errorResponse('You have already voted in this election', 409);
    }
    
    return errorResponse('Failed to cast vote. Please try again.', 500);
  } finally {
    await session.endSession();
  }
}