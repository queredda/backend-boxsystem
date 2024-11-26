import { NextFunction, Request, Response } from 'express';
import { DocumentType } from '@typegoose/typegoose';
import createHttpError from 'http-errors';
import { LoanRequest, LoanRequestModel } from '../models/LoanRequest';
import { Inventory, InventoryModel } from '../models/Inventory';
import { User } from '../models/User';
import {
  inventorySeparator,
  inventoryColumn,
} from '../utils/inventorySeparator';

export class UserController {
  static async createLoanRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { inventoryId, kuantitas } = req.body;
      if (!inventoryId || !kuantitas)
        throw createHttpError(400, 'All fields are required');

      const user = req.user as DocumentType<User>;
      const inventory: DocumentType<Inventory> | null =
        await InventoryModel.findOne({ id: inventoryId });

      if (!inventory) throw createHttpError(404, 'Inventory not found');

      const separatedInventory: inventoryColumn[] =
        await inventorySeparator(inventoryId);

      const availableBaikInventory: inventoryColumn | undefined =
        separatedInventory.find(
          (inventory) =>
            inventory.status === 'Available' && inventory.kondisi === 'baik',
        );

      if (!availableBaikInventory) {
        throw createHttpError(
          404,
          'No available inventory in good condition found',
        );
      }

      if (kuantitas > availableBaikInventory.kuantitas) {
        throw createHttpError(
          400,
          'Requested quantity exceeds available quantity',
        );
      }

      const loanRequest: DocumentType<LoanRequest> = new LoanRequestModel({
        inventoryId,
        userId: user._id,
        name: inventory.name,
        kuantitas,
      });

      await loanRequest.save();
      res.status(201).json(loanRequest);
    } catch (error) {
      next(error);
    }
  }

  static async getAllInventory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const inventories: DocumentType<Inventory>[] =
        await InventoryModel.find();
      const inventoryResponse: inventoryColumn[] = [];
      for (const inventory of inventories) {
        const separatedInventory: inventoryColumn[] = await inventorySeparator(
          inventory.id,
        );
        const availableBaikInventory: inventoryColumn | undefined =
          separatedInventory.find(
            (inventory) =>
              inventory.status === 'Available' && inventory.kondisi === 'baik',
          );

        if (availableBaikInventory)
          inventoryResponse.push(availableBaikInventory);
      }
      res.status(200).json(inventoryResponse);
    } catch (error) {
      next(error);
    }
  }

  static async getAllLoanRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user as DocumentType<User>;
      const loanRequests: DocumentType<LoanRequest>[] =
        await LoanRequestModel.find({ userId: user._id });
      // exclude isReturned: true
      const filteredLoanRequests = loanRequests.filter(
        (loanRequest) => !loanRequest.isReturned,
      );
      res.status(200).json(filteredLoanRequests);
    } catch (error) {
      next(error);
    }
  }
}
