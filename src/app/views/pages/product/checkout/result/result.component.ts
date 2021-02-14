import { Product } from "../../../../../shared/models/product";
import { ProductService } from "../../../../../shared/services/product.service";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import * as jspdf from "jspdf";
import html2canvas from "html2canvas";
import { PaymentGateWayConfig } from "../../../../../../environments/payment-gateway.config";

declare var $: any;
@Component({
  selector: "app-result",
  templateUrl: "./result.component.html",
  styleUrls: ["./result.component.scss"],
})
export class ResultComponent implements OnInit, AfterViewInit {
  products: Product[];
  date: number;
  totalPrice = 0;
  tax = 6.4;

  constructor(private productService: ProductService) {
    /* Hiding Billing Tab Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "none";
    // document.getElementById("billingTab").style.display = "none";
    document.getElementById("resultTab").style.display = "block";

    this.products = productService.getLocalCartProducts();

    this.products.forEach((product) => {
      this.totalPrice += product.productPrice;
    });

    this.date = Date.now();
  }

  ngOnInit() {}

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
}
