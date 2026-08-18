import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): { token: string; expiresAt: Date } {
  const jti = randomUUID();
  const token = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
  const decoded = jwt.decode(token) as { exp: number };
  return { token, expiresAt: new Date(decoded.exp * 1000) };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
