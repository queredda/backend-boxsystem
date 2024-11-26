import { getModelForClass, prop } from '@typegoose/typegoose';

export class Counter {
  @prop({ required: true })
  public _id!: string;

  @prop({ required: true })
  public seq!: number;
}

export const CounterModel = getModelForClass(Counter);
