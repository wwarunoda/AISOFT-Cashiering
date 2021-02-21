import { Component, OnInit, ViewChild, Renderer2, Inject } from "@angular/core";
import {
  ReceiptService,
  ToastService,
  ProductService,
} from "../../../../../shared/services";
import { Receipt } from "../../../../../shared/models";
import { ReceiptStatusEnum } from "../../../../../shared/enum";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { first } from "rxjs/operators";
import html2canvas from "html2canvas";
import * as jspdf from "jspdf";

@Component({
  selector: "app-payment-details",
  templateUrl: "./payment-details.component.html",
  styleUrls: ["./payment-details.component.scss"],
})
export class PaymentDetailsComponent implements OnInit {
  isSuccess = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private receiptService: ReceiptService,
    private toastService: ToastService,
    private productService: ProductService,
    private router: Router
  ) {
    /* Hiding Shipping Tab Element */
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      const receiptId = params["ReceiptId"];
      const accessCode = params["AccessCode"];

      const localReceiptId = this.receiptService.getReceiptId();
      const localReceiptData = this.receiptService.getLocalReceiptDetails();
      if (localReceiptId === receiptId) {
        this.isSuccess = true;
        this.toastService.success("Receipt Payment", "Payment Success");
        this.updateReceipt(localReceiptData.receiptKey, accessCode, true);
      } else {
        this.isSuccess = false;
        this.toastService.error("Receipt Payment", "Payment Failed");
        this.updateReceipt(localReceiptData.receiptKey, accessCode, false);
      }
    });
  }

  private updateReceipt(key: string, accessCode: string, isSuccess: boolean) {
    const dbReceipt = this.receiptService.getReceiptById(key);
    dbReceipt
      .snapshotChanges()
      .pipe(first())
      .subscribe((rpt) => {
        const dbRpt = rpt.payload.toJSON() as Receipt;
        if (isSuccess) {
          dbRpt.status = ReceiptStatusEnum.PaymentSuccess;
          this.receiptService.removeLocalAllReceipt();
          this.productService.removeLocalAllProducts();
          setTimeout(() => this.router.navigate(["/"]), 1000);
        } else {
          dbRpt.status = ReceiptStatusEnum.PaymentError;
        }
        dbRpt.accessCode = accessCode;
        this.receiptService.deleteReceipt(key);
        this.receiptService.createReceipt(dbRpt);
      });
  }

  downloadReceipt() {
    if (this.isSuccess) {
      const data = document.getElementById("receipt");
      // console.log(data);
      if (data) {
        html2canvas(data).then((canvas) => {
          // Few necessary setting options
          const imgWidth = 208;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const heightLeft = imgHeight;

          const contentDataURL = canvas.toDataURL("image/png");
          const pdf = new jspdf("p", "mm", "a4"); // A4 size page of PDF
          const position = 0;
          pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
          pdf.save("uclobbers.pdf"); // Generated PDF
        });
      }
    }
  }
}
