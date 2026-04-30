import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function successResponse<T>(data?: T, message?: string, status: number = 200): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data
  } as ApiResponse<T>, { status });
}

export function errorResponse(error: string, status: number = 400): NextResponse {
  return NextResponse.json({
    success: false,
    error
  } as ApiResponse, { status });
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({
    success: false,
    error: message
  } as ApiResponse, { status: 401 });
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json({
    success: false,
    error: message
  } as ApiResponse, { status: 403 });
}