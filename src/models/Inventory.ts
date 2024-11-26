import { getModelForClass, prop, pre } from '@typegoose/typegoose';
import { CounterModel } from './Counter';

@pre<Inventory>('save', async function () {
  if (this.isNew) {
    const counter = await CounterModel.findByIdAndUpdate(
      { _id: 'inventoryId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.id = counter.seq;
  }
})
export class Inventory {
  @prop()
  public id!: number;

  @prop({ required: true, unique: true })
  public name!: string;

  @prop({ required: true })
  public totalKuantitas!: number;

  @prop({ required: true })
  public kategori!: string;

  @prop({})
  public imageUrl?: string;
}

export const InventoryModel = getModelForClass(Inventory);
