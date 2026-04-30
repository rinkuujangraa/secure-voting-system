import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import { createCandidateSchema } from '@/lib/validations';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';

// Create new candidate (Admin only)
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
    const validationResult = createCandidateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      return errorResponse(`Validation failed: ${errors}`, 400);
    }

    const { name, party, electionId } = validationResult.data;

    // Verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return errorResponse('Election not found', 404);
    }

    // Check if election has started (can't add candidates to active/completed elections)
    if (election.status !== 'upcoming') {
      return errorResponse('Cannot add candidates to active or completed elections', 400);
    }

    // Create candidate
    const candidate = new Candidate({
      name: name.trim(),
      party: party.trim(),
      electionId: electionId
    });

    await candidate.save();

    // Populate election data for response
    const populatedCandidate = await Candidate.findById(candidate._id)
      .populate('electionId', 'title status')
      .lean();

    return successResponse(
      populatedCandidate,
      'Candidate created successfully',
      201
    );

  } catch (error: any) {
    console.error('Create candidate error:', error);
    
    // Handle duplicate candidate error
    if (error.code === 11000) {
      return errorResponse('Candidate with this name already exists in this election', 409);
    }
    
    return errorResponse('Failed to create candidate', 500);
  }
}

// Get candidates for admin (with additional info)
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
    
    let query = {};
    if (electionId) {
      query = { electionId };
    }

    const candidates = await Candidate.find(query)
      .populate('electionId', 'title status startDate endDate')
      .sort({ electionId: -1, voteCount: -1, name: 1 })
      .lean();

    return successResponse(candidates, 'Candidates retrieved successfully');

  } catch (error: any) {
    console.error('Get candidates error:', error);
    return errorResponse('Failed to retrieve candidates', 500);
  }
}