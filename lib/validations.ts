import { z } from 'zod';

// Auth validations
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  role: z.enum(['user', 'admin']).default('user'),
  adminInviteCode: z.string().max(128).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Election validations
export const createElectionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  startDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return parsedDate > new Date();
  }, 'Start date must be in the future'),
  endDate: z.string()
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const updateElectionSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['upcoming', 'active', 'completed']).optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Candidate validations
export const createCandidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  party: z.string().min(2, 'Party must be at least 2 characters').max(50, 'Party name too long'),
  electionId: z.string().min(1, 'Election ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid election ID format')
});

// Vote validation
export const voteSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID format'),
  electionId: z.string().min(1, 'Election ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid election ID format')
});

// Query validations
export const electionIdSchema = z.object({
  electionId: z.string().min(1, 'Election ID is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateElectionInput = z.infer<typeof createElectionSchema>;
export type UpdateElectionInput = z.infer<typeof updateElectionSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type VoteInput = z.infer<typeof voteSchema>;