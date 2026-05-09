import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Vote from '@/models/Vote';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';

// Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const userId = params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if user has voted
    const voteCount = await Vote.countDocuments({ voterId: userId });
    if (voteCount > 0) {
      return errorResponse('Cannot delete user who has cast votes. This would compromise election integrity.', 400);
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return successResponse(
      { deletedId: userId },
      'User deleted successfully'
    );

  } catch (error: any) {
    console.error('Delete user error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
