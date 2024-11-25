// controllers/AuthController.ts

import { NextFunction, Request, Response } from 'express';
import { DocumentType } from '@typegoose/typegoose';
import createHttpError from 'http-errors';
import { User, UserModel } from '../models/User';

interface LoginWithEmailRequest extends Request {
  body: {
    email: string;
  };
}

interface LoginWithEmailResponse {
  message: string;
}

interface LogoutResponse {
  message: string;
}

export class AuthController {
  // GET /auth/failure
  public static failure(
    _req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    next(createHttpError(401, 'Google login failed'));
  }

  // POST /auth/loginemail
  public static async loginWithEmail(
    req: LoginWithEmailRequest,
    res: Response<LoginWithEmailResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email }: { email: string } = req.body;
      const user: DocumentType<User> | null = await UserModel.findOne({
        email,
      });

      if (!user) throw createHttpError(404, 'User not found');

      const token: string = await user.generateToken();
      AuthController.setTokenCookie(res, token);

      res.json({ message: 'Logged in successfully' });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  public static async logout(
    req: Request,
    res: Response<LogoutResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user as DocumentType<User>;
      AuthController.clearTokenCookie(res);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static setTokenCookie(res: Response, token: string): void {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URN!
          : 'localhost',
    });
  }

  private static clearTokenCookie(res: Response): void {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URN!
          : 'localhost',
    });
  }
}
