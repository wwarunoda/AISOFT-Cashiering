import { Component, OnInit, ViewChild, Renderer2, Inject } from "@angular/core";
import { ReceiptService, ToastService, ProductService } from "../../../../../shared/services";
import { Receipt } from "../../../../../shared/models";
import { ReceiptStatusEnum } from "../../../../../shared/enum";
import {Router, ActivatedRoute, Params} from '@angular/router';
import { first } from "rxjs/operators";

@Component({
  selector: "app-payment-details",
  templateUrl: "./payment-details.component.html",
  styleUrls: ["./payment-details.component.scss"],
})
export class PaymentDetailsComponent implements OnInit {

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
    this.activatedRoute.queryParams.subscribe(params => {
      const receiptId = params['ReceiptId'];
      const accessCode = params['AccessCode'];

      const localReceiptId = this.receiptService.getReceiptId();
      const localReceiptData = this.receiptService.getLocalReceiptDetails();
      if (localReceiptId === receiptId) {
        this.toastService.success("Receipt Payment", "Payment Success");
        this.updateReceipt(localReceiptData.receiptKey, accessCode, true);
      } else {
        this.toastService.error("Receipt Payment", "Payment Failed");
        this.updateReceipt(localReceiptData.receiptKey, accessCode, false);
      }

    });
  }

  private updateReceipt(key: string, accessCode: string, isSuccess: boolean) {
    const dbReceipt = this.receiptService.getReceiptById(key);
    dbReceipt.snapshotChanges().pipe(first()).subscribe(
      (rpt) => {
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

}
