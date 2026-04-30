import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IVote extends Document {
  voterId: Types.ObjectId;
  electionId: Types.ObjectId;
  candidateId: Types.ObjectId;
  encryptedVote: string;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>({
  voterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Voter ID is required']
  },
  electionId: {
    type: Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Election ID is required']
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate ID is required']
  },
  encryptedVote: {
    type: String,
    required: [true, 'Encrypted vote is required']
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// CRITICAL: Compound unique index to prevent duplicate voting
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

// Additional indexes for performance
voteSchema.index({ electionId: 1 });
voteSchema.index({ candidateId: 1 });
voteSchema.index({ createdAt: 1 });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', voteSchema);

export default Vote;