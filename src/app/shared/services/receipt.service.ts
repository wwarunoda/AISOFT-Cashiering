import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Injectable } from "@angular/core";
import { ReceiptEnum, ReceiptStatusEnum } from "../enum";
import { LocalReceipt, Receipt } from "../models";

@Injectable({
  providedIn: "root",
})
export class ReceiptService {
  receipts: AngularFireList<Receipt>;
  receipt: AngularFireObject<Receipt>;
  constructor(private db: AngularFireDatabase) {
    this.getReceipts();
  }

  createReceipts(data: Receipt): string {
    let receiptKey: string;
    let generatedReceiptNumber: string;
    let dbRpt: Receipt;
    const localReceiptNumber = localStorage.getItem("UCLReceiptDetail");
    if (localReceiptNumber) {
      const localRcpt: LocalReceipt = JSON.parse(localReceiptNumber);
      const dbReceipt = this.getReceiptById(localRcpt.receiptKey);
      dbReceipt.snapshotChanges().subscribe(
        (rpt) => { dbRpt = rpt as Receipt });
      if (dbRpt.status === ReceiptStatusEnum.PendingPayment) {
        this.deleteReceipt(localRcpt.receiptKey);
      } else {
        generatedReceiptNumber = this.receiptNumberGenerate();
      }
    } else {
      generatedReceiptNumber = this.receiptNumberGenerate();
    }
    localStorage.removeItem("UCLReceiptDetail");
    data.receiptNumber = generatedReceiptNumber;
    this.receipts.push(data).then(rpt => {
        receiptKey = rpt.key;
        let rptObject: LocalReceipt = { receiptNumber: generatedReceiptNumber, receiptKey };
        localStorage.setItem("UCLReceiptDetail", JSON.stringify(rptObject));
    });
    return data.receiptNumber;
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

  receiptNumberGenerate(): string {
    const dateTime: Date = new Date();
    const year = this.pad(dateTime.getFullYear(), 4).substr(2, 2);
    const month = this.pad(dateTime.getMonth(), 2);
    const date = this.pad(dateTime.getDate(), 2);
    const ran = this.pad(Math.floor((Math.random() * 10000) + 1), 5);

    return year + month + date + ran;
  }

  pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) { s = "0" + s; }
    return s;
}
}
