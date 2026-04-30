import mongoose from 'mongoose';

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function validateObjectId(id: string, fieldName: string = 'ID'): void {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
}