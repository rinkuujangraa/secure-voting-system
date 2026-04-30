import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ISSUER = 'voting-system';
const JWT_AUDIENCE = 'voting-users';
const secretKey = new TextEncoder().encode(JWT_SECRET);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: payload.role === 'admin' ? 'admin' : 'user',
    };
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export function extractTokenFromCookies(cookies: string): string | null {
  const tokenCookie = cookies.split(';').find(cookie => 
    cookie.trim().startsWith('auth-token=')
  );
  
  if (!tokenCookie) return null;
  
  const tokenValue = tokenCookie.split('=')[1];
  return tokenValue ? decodeURIComponent(tokenValue) : null;
}