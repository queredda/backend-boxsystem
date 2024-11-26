// controllers/AuthController.ts

import { NextFunction, Request, Response } from 'express';
import { DocumentType } from '@typegoose/typegoose';
import createHttpError from 'http-errors';
import { User, UserModel } from '../models/User';

interface LoginWithEmailRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface LoginWithEmailResponse {
  message: string;
}

interface LogoutResponse {
  message: string;
}

export class AuthController {
  // POST /auth/loginemail
  public static async loginWithEmail(
    req: LoginWithEmailRequest,
    res: Response<LoginWithEmailResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw createHttpError(400, 'Email and password are required');

      let user: DocumentType<User> | null = await UserModel.findOne({
        email,
        password,
      });

      if (!user) {
        const newUser = new UserModel({ email, password });
        await newUser.save();
        user = newUser;
      }

      const token: string = await user.generateToken();
      AuthController.setTokenCookie(res, token);

      res.json({ message: 'Logged in successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async editProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user as DocumentType<User>;
      const { name, profilePic } = req.body;
      if (name) user.name = name;
      if (profilePic) user.profilePic = profilePic;
      await user.save();
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async getUserData(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user as DocumentType<User>;
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public static async changeRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user as DocumentType<User>;
      if (req.body.role !== 'admin' && req.body.role !== 'user')
        throw createHttpError(400, 'Invalid role');
      user.role = req.body.role;
      await user.save();
      res.json({ message: 'Role changed successfully' });
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
      sameSite: 'none',
      path: '/',
    });
  }

  private static clearTokenCookie(res: Response): void {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
    });
  }
}
