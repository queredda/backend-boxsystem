import { prop, getModelForClass, Ref, pre } from '@typegoose/typegoose';
import { User } from './User';
import { CounterModel } from './Counter';

export enum RequestStatus {
  Proses = 'Proses',
  Canceled = 'Canceled',
  Delivered = 'Delivered',
}

export enum ReturnedCondition {
  Baik = 'baik',
  Rusak = 'rusak',
}

@pre<LoanRequest>('save', async function () {
  if (this.isNew) {
    const counter = await CounterModel.findByIdAndUpdate(
      { _id: 'loanId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.loanId = counter.seq;
  }
})
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

  @prop({
    required: true,
    enum: ReturnedCondition,
    default: ReturnedCondition.Baik,
  })
  public returnedCondition!: ReturnedCondition;

  @prop({})
  public loanId!: number;

  @prop()
  public namaUser?: string;
}

export const LoanRequestModel = getModelForClass(LoanRequest);
