import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Receipt } from "../models";
import { Injectable } from "@angular/core";
import { ReceiptEnum } from "../enum";

@Injectable({
  providedIn: "root",
})
export class ReceiptService {
  receipts: AngularFireList<Receipt>;
  receipt: AngularFireObject<Receipt>;
  constructor(private db: AngularFireDatabase) {
    this.getReceipts();
  }

  createReceipts(data: Receipt) {
    this.receipts.push(data);
  }

  getReceipts() {
    this.receipts = this.db.list(ReceiptEnum.TableName);
    return this.receipts;
  }

  getReceiptById(key: string) {
    this.receipt = this.db.object(ReceiptEnum.TableName + "/" + key);
    return this.receipt;
  }

  updateReceipt(data: Receipt) {
    this.receipts.update(data.$key, data);
  }

  deleteReceipt(key: string) {
    this.receipts.remove(key);
  }
}
