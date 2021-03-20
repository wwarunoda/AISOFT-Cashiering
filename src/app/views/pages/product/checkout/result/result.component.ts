import {
  Product,
  Billing,
  ReceiptProduct,
  User,
  Receipt,
} from "../../../../../shared/models";
import { ProductService } from "../../../../../shared/services/product.service";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import * as jspdf from "jspdf";
import html2canvas from "html2canvas";
import { PaymentGateWayConfig } from "../../../../../../environments/payment-gateway.config";
import {
  AuthService,
  ShippingService,
  ToastService,
  ReceiptService,
} from "../../../../../shared/services";
import { threadId } from "worker_threads";
import { SelectMultipleControlValueAccessor } from "@angular/forms";
import { ReceiptStatusEnum, ReceiptDataEnum } from "../../../../../shared/enum";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { FLAG_UNRESTRICTED } from "html2canvas/dist/types/css/syntax/tokenizer";

declare var $: any;
@Component({
  selector: "app-result",
  templateUrl: "./result.component.html",
  styleUrls: ["./result.component.scss"],
})
export class ResultComponent implements OnInit, AfterViewInit {
  id: string;
  products: Product[];
  receiptNumber: string;
  shippingDetails: Billing[];
  receiptProduct: ReceiptProduct[];
  date: number;
  totalPrice = 0;
  tax = 6.4;
  isAddressFound: boolean = false;
  config: any;
  collection = { count: 5, data: [] };
  isPolicyAgree: boolean = false;
  isPaymentLoad: boolean = false;
  private privacyPolicyInfo: BehaviorSubject<boolean>;
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private shippingService: ShippingService,
    private toastService: ToastService,
    private receiptService: ReceiptService
  ) {
    this.privacyPolicyInfo = new BehaviorSubject<boolean>(false);
    /* Hiding Billing Tab Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "none";
    // document.getElementById("billingTab").style.display = "none";
    document.getElementById("resultTab").style.display = "block";

    this.date = Date.now();
  }

  ngOnInit() {
    this.getProductsAndCustomerDetails();
    this.createReceiptIdentification();

    for (let i = 1; i <= 5; i++) {
      this.collection.data.push(
        i
      );
    }

    this.config = {
      itemsPerPage: 1,
      currentPage: 1,
      totalItems: this.collection.count
    };

    this.getValue().subscribe(x => {
      if (x) {
        this.loadPaymentGateWay(this.receiptNumber);
      }
    });
  }
  setValue(): void {
    if (!this.isPaymentLoad) {
      this.isPolicyAgree = false;
    }
    this.privacyPolicyInfo.next(this.isPolicyAgree && this.isPaymentLoad);
  }
  getValue(): Observable<boolean> {
    return this.privacyPolicyInfo.asObservable();
  }

  ngAfterViewInit() {
    // this.loadPaymentGateWay();
  }
  pageChanged(event){
    this.config.currentPage = event;
  }
  downloadReceipt() {
    const data = document.getElementById("receipt");
    // console.log(data);

    html2canvas(data).then((canvas) => {
      // Few necessary setting options
      const imgWidth = 208;
      const pageHeight = 350;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL("image/png");
      const pdf = new jspdf("p", "mm", "a4"); // A4 size page of PDF
      const position = 0;
      pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
      pdf.save("uclobbers.pdf"); // Generated PDF
    });
  }
  private createReceiptIdentification() {
    const randomId = makeReceiptId(ReceiptDataEnum.ReceiptIdSize);
    this.id = "http://localhost:4200/success?ReceiptId=" + randomId;
    // this.id = "https://uclobbers-smart-shopping-de515.web.app/success?ReceiptId=" + randomId;
    this.receiptService.createReceiptId(randomId);
  }
  public loadPaymentGateWay(receiptNumber: string) {
    let email;
    let telephoneNumber;
    const totalAmount = ((this.totalPrice + this.tax) * 100)
      .toString()
      .split(".")[0];
    if (this.shippingDetails) {
      const customerDetails = this.shippingDetails[0];
      email = customerDetails.emailId;
      telephoneNumber = customerDetails.phoneNumber;
    }
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
      script.setAttribute("data-amount", totalAmount);
      script.setAttribute("data-currency", PaymentGateWayConfig.currency);
      script.setAttribute("data-label", PaymentGateWayConfig.label);
      script.setAttribute("data-invoiceref", receiptNumber);
      script.setAttribute("data-resulturl", `${this.id}`);
      script.setAttribute("data-phone", telephoneNumber);
      script.setAttribute("data-email", email);
      script.setAttribute("data-invoicedescription", PaymentGateWayConfig.description);

      const shoppingDetail = document.getElementById("payment-detail");
      shoppingDetail.appendChild(script);
    }
  }

  private async getProductsAndCustomerDetails() {
    this.products = this.productService.getLocalCartProducts();
    this.receiptProduct = this.productService.getLocalCartReceipt();
    this.shippingDetails = await this.getShippingDetails();

    // Calculate total amount
    this.receiptProduct.forEach((receiptProduct) => {
      this.totalPrice +=
        receiptProduct.productPrice * receiptProduct.productQuantity;
    });
    this.getReceiptNumber();
  }

  private async getShippingDetails() {
    let address: Billing[] = [];
    let count: number = 0;
    while ((address && address.length === 0) || count < 10) {
      address = this.shippingService.getLocalShippings();
      await delay(300);
      count++;
    }
    if (count < 10) {
      this.isAddressFound = false;
      this.toastService.error("Shipping Address Error", "Address Not Found");
    } else {
      this.isAddressFound = true;
    }

    return address;
  }

  private getReceiptNumber() {
    this.receiptService.getReceiptNumber().subscribe((receipt) => {
       this.receiptNumber = receipt;
       this.isPaymentLoad = true;
    });
  }

}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeReceiptId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
