import { Product, Billing, ReceiptProduct, User, Receipt } from "../../../../../shared/models";
import { ProductService } from "../../../../../shared/services/product.service";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import * as jspdf from "jspdf";
import html2canvas from "html2canvas";
import { PaymentGateWayConfig } from "../../../../../../environments/payment-gateway.config";
import { AuthService, ShippingService, ToastService, ReceiptService } from "../../../../../shared/services";
import { threadId } from "worker_threads";
import { SelectMultipleControlValueAccessor } from "@angular/forms";
import { ReceiptStatusEnum } from "../../../../../shared/enum";

declare var $: any;
@Component({
  selector: "app-result",
  templateUrl: "./result.component.html",
  styleUrls: ["./result.component.scss"],
})
export class ResultComponent implements OnInit, AfterViewInit {
  products: Product[];
  receiptNumber: string = "00000000000";
  shippingDetails: Billing[];
  receiptProduct: ReceiptProduct[];
  userDetail: User;
  date: number;
  totalPrice = 0;
  tax = 6.4;
  isAddressFound: boolean = false;
  constructor(private productService: ProductService,
              private authService: AuthService,
              private shippingService: ShippingService,
              private toastService: ToastService,
              private receiptService: ReceiptService) {
    /* Hiding Billing Tab Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "none";
    // document.getElementById("billingTab").style.display = "none";
    document.getElementById("resultTab").style.display = "block";

    this.date = Date.now();
  }

  ngOnInit() {
    this.getProductsAndCustomerDetails();
  }

  ngAfterViewInit() {
    this.loadPaymentGateWay();
  }

  downloadReceipt() {
    const data = document.getElementById("receipt");
    // console.log(data);

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

  private loadPaymentGateWay() {
    if (!document.getElementById("eway-payments")) {
      const script = window.document.createElement("script");
      script.id = "eway-payments";
      script.type = "text/javascript";
      script.src = PaymentGateWayConfig.url;
      script.setAttribute("class", PaymentGateWayConfig.class);
      script.setAttribute(
        "data-publicapikey",
        PaymentGateWayConfig.publicApiKey
      );
      script.setAttribute("data-amount", `${this.totalPrice}`);
      script.setAttribute("data-currency", PaymentGateWayConfig.currency);
      script.setAttribute("data-label", PaymentGateWayConfig.label);

      const shoppingDetail = document.getElementById("payment-detail");
      shoppingDetail.appendChild(script);
    }
  }

  private async getProductsAndCustomerDetails() {
    this.authService.user$.subscribe(
      user => { this.userDetail = user; }
    );
    this.products = this.productService.getLocalCartProducts();
    this.receiptProduct = this.productService.getLocalCartReceipt();
    this.shippingDetails = await this.getShippingDetails();

    // Calculate total amount
    this.products.forEach((product) => {
      this.totalPrice += product.productPrice;
    });

    this.createReceipt();
  }

  private async getShippingDetails() {
   let address: Billing[] = [];
   let count: number = 0;
   while ((address && address.length === 0) || count < 10) {
    address = this.shippingService.getLocalShippings();
    await delay(300);
    count ++;
   }
   if (count < 10) {
    this.isAddressFound = false;
    this.toastService.error("Shipping Address Error", "Address Not Found");
   } else {
    this.isAddressFound = true;
   }

   return address;
  }

  private createReceipt() {
    const receipt: Receipt = {};
    receipt.receiptProducts = this.receiptProduct;
    if (this.shippingDetails) {
      this.shippingDetails.forEach(shipping => delete shipping.$key);
      receipt.shippingDetails = this.shippingDetails[0];
    }
    receipt.userKey = this.userDetail.$key;
    receipt.userName = this.userDetail.userName;
    receipt.userPhoneNumber = this.userDetail.phoneNumber;
    receipt.userEmail = this.userDetail.emailId;

    // remove product keys before insert
    receipt.receiptProducts.forEach(rpt => delete rpt.$key);
    receipt.status = ReceiptStatusEnum.PendingPayment;
    // push data to database
    this.receiptNumber = this.receiptService.createReceipts(receipt);
  }
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
