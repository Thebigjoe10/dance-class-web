import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const secret: Secret = config.jwt.secret;
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as string,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret: Secret = config.jwt.secret;
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateVerificationToken = (): string => {
  const secret: Secret = config.jwt.secret;
  const options: SignOptions = {
    expiresIn: '24h',
  };
  return jwt.sign({ type: 'verification' }, secret, options);
};
