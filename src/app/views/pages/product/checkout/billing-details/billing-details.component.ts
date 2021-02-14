import { ProductService } from "../../../../../shared/services/product.service";
import { Product } from "../../../../../shared/models/product";
import { BillingService } from "../../../../../shared/services/billing.service";
import { Component, OnInit, ViewChild, Renderer2, Inject } from "@angular/core";
import { User, UserDetail } from "../../../../../shared/models/user";
import { AuthService } from "../../../../../shared/services/auth.service";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { map } from "rxjs/operators";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: "app-billing-details",
  templateUrl: "./billing-details.component.html",
  styleUrls: ["./billing-details.component.scss"],
})
export class BillingDetailsComponent implements OnInit {
  userDetails: User;
  products: Product[];
  userDetail: UserDetail;

  constructor(
    authService: AuthService,
    private billingService: BillingService,
    productService: ProductService,
    private router: Router,
    private _renderer2: Renderer2,
   @Inject(DOCUMENT) private _document: Document
  ) {
    /* Hiding Shipping Tab Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "none";
    document.getElementById("billingTab").style.display = "block";
    document.getElementById("resultTab").style.display = "none";

    this.userDetail = new UserDetail();
    this.products = productService.getLocalCartProducts();
    authService.user$.pipe(
      map((user) => {
        this.userDetails = user;
      })
    );
  }

  ngOnInit() {}

  updateUserDetails(form: NgForm) {
    let totalPrice = 0;
    const products = [];
    this.products.forEach((product) => {
      delete product.$key;
      totalPrice += product.productPrice;
      products.push(product);
    });

    const data = {
      ...form.value,
      emailId: this.userDetails.emailId,
      userId: this.userDetails.$key,
      products,
      totalPrice,
      billingDate: Date.now(),
    };
    this.PayNow();
    // this.billingService.createBillings(data);

    // this.router.navigate([
    //   "checkouts",
    //   { outlets: { checkOutlet: ["result"] } },
    // ]);
  }

  private PayNow() {
    let script = this._renderer2.createElement('script');
        script.type = `application/ld+json`;
        script.text = `
            {
                "@context": "https://secure.ewaypayments.com/scripts/eCrypt.min.js"
                /* your schema.org microdata goes here */
                class="eway-paynow-button"
                data-publicapikey="XXX-XXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                data-amount="500"
                data-currency="AUD"
                data-resulturl="http://www.eway.com.au/shared-demo/results.aspx"
            }
        `;

        this._renderer2.appendChild(this._document.body, script);
  }
}
