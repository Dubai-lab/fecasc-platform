import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export type TokenPayload = 
  | { adminId: string; email: string }
  | { staffId: string; email: string };

export function signToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as any;
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as TokenPayload & { iat: number; exp: number };
}
