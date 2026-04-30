import { NextRequest } from 'next/server';
import { checkDBHealth } from '@/lib/mongodb-fallback';
import { successResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  const dbHealth = await checkDBHealth();
  
  if (dbHealth.connected) {
    return successResponse({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, 'System is healthy');
  } else {
    return successResponse({
      status: 'partial',
      database: 'disconnected',
      error: dbHealth.error,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      solutions: [
        'Install MongoDB locally: https://www.mongodb.com/try/download/community',
        'Use Docker: docker run --name voting-mongodb -d -p 27017:27017 mongo:latest',
        'Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas'
      ]
    }, 'Database connection needed');
  }
}