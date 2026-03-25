import jwt from 'jsonwebtoken';
import { RefreshToken } from '@prisma/client';
import prisma from '../config/prisma';

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET || 'secret123', {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = async (userId: string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
    expiresIn: '7d',
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret123');
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');
};
