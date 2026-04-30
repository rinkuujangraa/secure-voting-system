import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  party: string;
  electionId: Types.ObjectId;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  party: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
    maxlength: [50, 'Party name cannot exceed 50 characters']
  },
  electionId: {
    type: Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Election ID is required']
  },
  voteCount: {
    type: Number,
    default: 0,
    min: [0, 'Vote count cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for performance
candidateSchema.index({ electionId: 1 });
candidateSchema.index({ electionId: 1, voteCount: -1 }); // For sorting candidates by votes

// Compound index to prevent duplicate candidates in same election
candidateSchema.index({ name: 1, electionId: 1 }, { unique: true });

const Candidate: Model<ICandidate> = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', candidateSchema);

export default Candidate;