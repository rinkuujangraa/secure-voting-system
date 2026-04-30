import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IElection extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const electionSchema = new Schema<IElection>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Indexes for performance and queries
electionSchema.index({ status: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if election is currently active
electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.status === 'active';
});

const Election: Model<IElection> = mongoose.models.Election || mongoose.model<IElection>('Election', electionSchema);

export default Election;