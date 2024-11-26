import { Request, Response, NextFunction } from 'express';
import { Inventory, InventoryModel } from '../models/Inventory';
import createHttpError from 'http-errors';
import { DocumentType } from '@typegoose/typegoose';
import {
  inventorySeparator,
  inventoryColumn,
} from '../utils/inventorySeparator';
import {
  LoanRequest,
  LoanRequestModel,
  RequestStatus,
} from '../models/LoanRequest';
import { UserModel } from '../models/User';

export class AdminController {
  static async createInventory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { name, totalKuantitas, kategori, paymentMethod } = req.body;
      if (!name || !totalKuantitas || !kategori)
        throw createHttpError(400, 'All fields are required');

      const inventory: DocumentType<Inventory> = new InventoryModel({
        name,
        totalKuantitas,
        kategori,
        paymentMethod,
      });

      await inventory.save();
      res.status(201).json(inventory);
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
        inventoryResponse.push(...separatedInventory);
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
      const loanRequests: DocumentType<LoanRequest>[] =
        await LoanRequestModel.find();
      const loanRequestsArray = loanRequests.map((loanRequest) =>
        loanRequest.toObject(),
      );
      for (const loanRequest of loanRequestsArray) {
        // add nama user column
        const user = await UserModel.findById(loanRequest.userId);
        loanRequest.namaUser = user?.name;
      }
      res.status(200).json(loanRequestsArray);
    } catch (error) {
      next(error);
    }
  }

  static async updateLoanRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { status, loanId } = req.body;
      if (!status) throw createHttpError(400, 'Status is required');

      const loanRequest: DocumentType<LoanRequest> | null =
        await LoanRequestModel.findOne({ loanId });
      if (!loanRequest) throw createHttpError(404, 'Loan request not found');
      if (loanRequest?.status !== 'Proses')
        throw createHttpError(400, 'Loan request has been processed');

      if (status === 'Terima') loanRequest.status = RequestStatus.Delivered;
      else if (status === 'Tolak') loanRequest.status = RequestStatus.Canceled;
      await loanRequest.save();
      res.status(200).json(loanRequest);
    } catch (error) {
      next(error);
    }
  }

  static async getAllBorrowedItems(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const loanRequests: DocumentType<LoanRequest>[] =
        await LoanRequestModel.find({ status: 'Delivered' });
      // add nama user column
      const loanRequestsArray = loanRequests.map((loanRequest) =>
        loanRequest.toObject(),
      );
      for (const loanRequest of loanRequestsArray) {
        const user = await UserModel.findById(loanRequest.userId);
        loanRequest.namaUser = user?.name;
      }
      res.status(200).json(loanRequestsArray);
    } catch (error) {
      next(error);
    }
  }

  static async getAllReturnedItems(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const loanRequests: DocumentType<LoanRequest>[] =
        await LoanRequestModel.find({ isReturned: true });
      // add nama user column
      const loanRequestsArray = loanRequests.map((loanRequest) =>
        loanRequest.toObject(),
      );
      for (const loanRequest of loanRequestsArray) {
        const user = await UserModel.findById(loanRequest.userId);
        loanRequest.namaUser = user?.name;
      }
      res.status(200).json(loanRequestsArray);
    } catch (error) {
      next(error);
    }
  }

  static async updateReturnedItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { loanId, returnedCondition } = req.body;
      if (!returnedCondition)
        throw createHttpError(400, 'Returned condition is required');

      const loanRequest: DocumentType<LoanRequest> | null =
        await LoanRequestModel.findOne({ loanId });
      if (!loanRequest) throw createHttpError(404, 'Loan request not found');
      if (loanRequest.isReturned)
        throw createHttpError(400, 'Item has been returned');

      loanRequest.isReturned = true;
      loanRequest.status = RequestStatus.Canceled;
      loanRequest.returnedCondition = returnedCondition;
      await loanRequest.save();
      res.status(200).json(loanRequest);
    } catch (error) {
      next(error);
    }
  }
}
