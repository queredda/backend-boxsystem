import { prop, getModelForClass, DocumentType } from '@typegoose/typegoose';
import jwt from 'jsonwebtoken';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface DecodedJwt {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
  iss?: string;
}

export class User {
  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true, unique: true })
  public googleId!: string;

  @prop({})
  public name?: string;

  @prop({})
  public profilePic?: string;

  @prop({ enum: UserRole, required: true, default: UserRole.USER })
  public role!: UserRole;

  public async generateToken(this: DocumentType<User>): Promise<string> {
    const payload: Omit<DecodedJwt, 'iat' | 'exp'> = {
      id: this.id,
      role: this.role,
    };

    const options: jwt.SignOptions = {
      expiresIn: '7d',
      issuer: process.env.JWT_ISSUER,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, options);
  }

  public static decodeToken(token: string): DecodedJwt | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: process.env.JWT_ISSUER,
      }) as DecodedJwt;
    } catch {
      return null;
    }
  }
}

export const UserModel = getModelForClass(User);
