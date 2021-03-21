import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Injectable } from "@angular/core";
import { ReceiptEnum, ReceiptStatusEnum } from "../enum";
import { LocalReceipt, Receipt, Product } from "../models";
import { first, map } from "rxjs/operators";
import {BehaviorSubject, Observable} from 'rxjs';
import { ProductService } from "./product.service";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root",
})
export class ReceiptService {
  private receiptNumber: BehaviorSubject<string>;
  receipts: AngularFireList<Receipt>;
  receipt: AngularFireObject<Receipt>;
  constructor(private db: AngularFireDatabase, private productService: ProductService, private toastService: ToastService) {
  const receipt = localStorage.getItem("ReceiptNumber");
  if (!receipt) {
    this.receiptNumber = new BehaviorSubject<string>("00000000000");
  } else {

    this.receiptNumber = new BehaviorSubject<string>(receipt);
  }
  this.getReceipts();
  }

  createReceipts(data: Receipt){
    let receiptKey: string;
    let generatedReceiptNumber: string;
    let dbRpt: Receipt;
    const localRcpt = this.getLocalReceiptDetails();
    if (localRcpt) {
      const dbReceipt = this.getReceiptById(localRcpt.receiptKey);
      dbReceipt.snapshotChanges().pipe(first()).subscribe(
        (rpt) => {
                   dbRpt = rpt.payload.toJSON() as Receipt;
                   if (dbRpt && dbRpt.status === ReceiptStatusEnum.PendingPayment) {
                      this.deleteReceipt(localRcpt.receiptKey);
                      generatedReceiptNumber = localRcpt.receiptNumber;
                  } else {
                      generatedReceiptNumber = this.receiptNumberGenerate();
                  }
                   this.uploadReceipt(data, generatedReceiptNumber, receiptKey);
        });
      } else {
        generatedReceiptNumber = this.receiptNumberGenerate();
        this.uploadReceipt(data, generatedReceiptNumber, receiptKey);
      }
  }

  private uploadReceipt(data: Receipt, generatedReceiptNumber: string, receiptKey: string) {
    localStorage.removeItem("UCLReceiptDetail");
    data.receiptNumber = generatedReceiptNumber;
    data.lastUpdatedDate = new Date().toString();
    this.createReceipt(data).then(rpt => {
        receiptKey = rpt.key;
        const rptObject: LocalReceipt = { receiptNumber: generatedReceiptNumber, receiptKey };
        localStorage.setItem("UCLReceiptDetail", JSON.stringify(rptObject));
    });
    this.setReceiptNumber(data.receiptNumber);
  }

  getLocalReceiptDetails(): LocalReceipt {
    const localReceiptNumber = localStorage.getItem("UCLReceiptDetail");
    return JSON.parse(localReceiptNumber);
  }
  createReceipt(data: Receipt) {
    data.createdDate = new Date().toString();
    data.lastUpdatedDate = new Date().toString();
    return this.receipts.push(data);
  }

  getReceipts() {
    this.receipts = this.db.list(ReceiptEnum.TableName);
    return this.receipts;
  }

  getReceiptById(key: string) {
    this.receipt = this.db.object(ReceiptEnum.TableName + "/" + key);
    return this.receipt;
  }

  updateReceipt(key: string, data: Receipt) {
    data.lastUpdatedDate = new Date().toString();
    delete data.$key;
    this.receipts.update(key, data);
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

  getReceiptNumber(): Observable<string> {
    return this.receiptNumber.asObservable();
  }

  setReceiptNumber(receiptNumber): void {
    this.receiptNumber.next(receiptNumber);
    localStorage.setItem("ReceiptNumber", this.receiptNumber.value);
  }

  resetReceiptNumber() {
    this.receiptNumber = new BehaviorSubject<string>("00000000000");
    localStorage.setItem("ReceiptNumber", this.receiptNumber.value);
  }

  createReceiptId(id: string) {
    localStorage.removeItem("ReceiptIdentification");
    localStorage.setItem("ReceiptIdentification", id);
  }
  getReceiptId() {
    return localStorage.getItem("ReceiptIdentification");
  }
  removeLocalAllReceipt() {
    localStorage.removeItem("UCLReceiptDetail");
  }
  removeLocalReceiptIdentification() {
    localStorage.removeItem("ReceiptIdentification");
  }
}
