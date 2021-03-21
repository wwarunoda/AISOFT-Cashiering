import { Receipt } from './../../../shared/models';
import { Component, OnInit } from "@angular/core";
import { ReceiptService, ToastService } from "../../../shared/services";
import { ReceiptStatusEnum } from "../../../shared/enum";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import * as _ from "lodash";
import * as moment from 'moment';
@Component({
  selector: "app-task-board",
  templateUrl: "./task-board.component.html",
  styleUrls: ["./task-board.component.scss"],
})
export class TaskBoardComponent implements OnInit {
  receipts: Receipt[] = [];
  selectedReceipt: Receipt = {createdDate: new Date().toString(),
      lastUpdatedDate: new Date().toString(), shippingDetails: {state: {$key: "", name: ""}}};
  receiptErrorList: Receipt[];
  receiptSuccessList: Receipt[];
  receiptShippedList: Receipt[];
  originalReceiptErrorList: Receipt[];
  originalReceiptSuccessList: Receipt[];
  originalReceiptShippedList: Receipt[];
  kanbanContainers = [];

  constructor(private receiptService: ReceiptService,
              private toastService: ToastService) {}

  ngOnInit() {
    this.getDataFromDB();
  }

  private getDataFromDB() {
    this.receiptService.getReceipts()
      .snapshotChanges()
      .subscribe(
        (products) => {
          this.receipts = [];
          products.forEach((element) => {
            console.log(element.payload.val());
            const y = { ...element.payload.val(), $key: element.key };
            this.receipts.push(y as Receipt);
          });
          this.filterReceipts(this.receipts);
          this.taskAssign();
        },
        (error) => {
          this.toastService.error("Error while fetching Products", error);
        }
      );
  }

  private filterReceipts(receipts: Receipt[]) {
    this.receiptErrorList = receipts
        .filter((task) => task.status === ReceiptStatusEnum.PaymentError)
        .slice()
        .sort((a, b) => {
          return ((new Date(b.lastUpdatedDate)) as any)
            - (new Date(a.lastUpdatedDate) as any);
        });
    this.originalReceiptErrorList = this.receiptErrorList.slice();
    this.receiptShippedList = receipts
        .filter((task) => task.status === ReceiptStatusEnum.ShippingDone && this.calculateDaysDiff(new Date(task.lastUpdatedDate)) <= 10)
        .slice()
        .sort((a, b) => {
          return ((new Date(b.lastUpdatedDate)) as any)
            - (new Date(a.lastUpdatedDate) as any);
        });
    this.originalReceiptShippedList = this.receiptShippedList.slice();
    this.receiptSuccessList = receipts
        .filter((task) => task.status === ReceiptStatusEnum.PaymentSuccess)
        .slice()
        .sort((a, b) => {
          return ((new Date(b.lastUpdatedDate)) as any)
            - (new Date(a.lastUpdatedDate) as any);
        });
    this.originalReceiptSuccessList = this.receiptSuccessList.slice();
  }

  private taskAssign() {
    this.kanbanContainers = [
      {
        title: "Payment Error",
        id: "errorList",
        connectedTo: ["errorList", "successList", "shippedList"],
        item: this.receiptErrorList,
      },
      {
        title: "Payment Success",
        id: "successList",
        connectedTo: ["errorList", "successList", "shippedList"],
        item: this.receiptSuccessList,
      },
      {
        title: "Shipped",
        id: "shippedList",
        connectedTo: ["successList", "shippedList", "errorList"],
        item: this.receiptShippedList,
      },
    ];
  }

  public saveTask() {
    const newErrorList = this.receiptErrorList.filter(receipt => this.originalReceiptErrorList.indexOf(receipt) < 0);
    const newSuccessList = this.receiptSuccessList.filter(receipt => this.originalReceiptSuccessList.indexOf(receipt) < 0);
    const newShippedList = this.receiptShippedList.filter(receipt => this.originalReceiptShippedList.indexOf(receipt) < 0);

    this.updateReceiptStatus(ReceiptStatusEnum.PaymentError, newErrorList);
    this.updateReceiptStatus(ReceiptStatusEnum.PaymentSuccess, newSuccessList);
    this.updateReceiptStatus(ReceiptStatusEnum.ShippingDone, newShippedList);

    this.originalReceiptErrorList = this.receiptErrorList.slice();
    this.originalReceiptSuccessList = this.receiptSuccessList.slice();
    this.originalReceiptShippedList = this.receiptShippedList.slice();
  }

  private updateReceiptStatus(status: number, receipts: Receipt[]) {
    receipts.forEach(receipt => {
      receipt.status = status;
      this.receiptService.updateReceipt(receipt.$key, receipt);
    });
  }

  public resetTask() {
    this.receiptShippedList = this.originalReceiptShippedList.slice();
    this.receiptSuccessList = this.originalReceiptSuccessList.slice();
    this.receiptErrorList = this.originalReceiptErrorList.slice();
    this.taskAssign();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  onSelect(event) {
    this.selectedReceipt = event;
  }

  private calculateDaysDiff(dateSent: Date, dataStart?: Date){
    let currentDate;
    if (!dataStart) {
      currentDate = new Date();
    } else {
      currentDate = dataStart;
    }
    dateSent = new Date(dateSent);

    return Math.floor(
      (Date.UTC(currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()) - Date.UTC(dateSent.getFullYear(),
        dateSent.getMonth(), dateSent.getDate()) ) / (1000 * 60 * 60 * 24));
}
}
