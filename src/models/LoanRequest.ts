import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { User } from './User';

export enum RequestStatus {
  Proses = 'Proses',
  Canceled = 'Canceled',
  Delivered = 'Delivered',
}

export enum ConditionStatus {
  Baik = 'baik',
  Rusak = 'rusak',
}

export class LoanRequest {
  @prop({ required: true })
  public inventoryId!: number;

  @prop({ required: true, ref: () => User })
  public userId!: Ref<User>;

  @prop({ required: true, unique: true })
  public name!: string;

  @prop({ required: true })
  public kuantitas!: number;

  @prop({ required: true, enum: RequestStatus, default: RequestStatus.Proses })
  public status!: RequestStatus;

  @prop({ required: true, default: false })
  public isReturned!: boolean;

  @prop({ required: true, enum: ConditionStatus })
  public returnedCondition!: ConditionStatus;
}

export const LoanRequestModel = getModelForClass(LoanRequest);
