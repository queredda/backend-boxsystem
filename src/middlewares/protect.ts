import { Request, Response, NextFunction } from 'express';
import { User, UserModel } from '../models/User';
import createHttpError from 'http-errors';
import { DocumentType } from '@typegoose/typegoose';
import { DecodedJwt } from '../models/User';

// TODO: handle userActive

async function authenticate(req: Request): Promise<DocumentType<User>> {
  const token: string = req.cookies['jwt'];
  if (!token) throw createHttpError(401, 'User not authenticated');
  //
  const decodedToken: DecodedJwt | null = User.decodeToken(token);
  if (!decodedToken) throw createHttpError(401, 'Invalid token');
  //
  const userId: string = decodedToken.id;
  const user: DocumentType<User> | null = await UserModel.findById(userId);
  if (!user) throw createHttpError(401, 'User not found');
  //
  return user;
}

export async function protectAll(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authenticate(req);
    // const user: DocumentType<User> | null = await UserModel.findOne({
    // email: 'farrelganteng426@gmail.com',
    // });
    if (!user) throw createHttpError(401, 'User not found');
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function protectAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authenticate(req);
    // const user: DocumentType<User> | null = await UserModel.findOne({
    // email: 'farrelganteng426@gmail.com',
    // });
    // if (!user) throw createHttpError(401, 'User not found');
    if (user.role !== 'admin')
      throw createHttpError(403, 'Access denied, admin only');
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function protectUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authenticate(req);
    // const user: DocumentType<User> | null = await UserModel.findOne({
    // email: 'muhamadfarreladrian@mail.ugm.ac.id',
    // });
    // if (!user) throw createHttpError(401, 'User not found');
    if (user.role !== 'user')
      throw createHttpError(403, 'Access denied, user only');
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
