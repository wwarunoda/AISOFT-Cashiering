import { Product } from "../../../../../shared/models/product";
import { ShippingService } from "../../../../../shared/services/shipping.service";
import { UserDetail, User } from "../../../../../shared/models/user";
import { AuthService } from "../../../../../shared/services/auth.service";
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ProductService } from "../../../../../shared/services/product.service";
import { map } from "rxjs/operators";
@Component({
  selector: "app-shipping-details",
  templateUrl: "./shipping-details.component.html",
  styleUrls: ["./shipping-details.component.scss"],
})
export class ShippingDetailsComponent implements OnInit {
  userDetails: User;

  userDetail: UserDetail;

  products: Product[];
  key =
    "A1001CTYCxgwTHvadCWKyV9m/ixKCimCqN/cv5/2+SiU0iNc267zZAdNMpqUkizVY9tG7J";
  password = "s4nydboX";
  endpoint = "sandbox";

  constructor(
    authService: AuthService,
    private shippingService: ShippingService,
    productService: ProductService,
    private router: Router
  ) {
    /* Hiding products Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "block";
    document.getElementById("productsTab").style.display = "none";
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
    const products = [];
    let totalPrice = 0;
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
      shippingDate: Date.now(),
    };

    this.shippingService.createshippings(data);

    this.router.navigate([
      "checkouts",
      { outlets: { checkOutlet: ["billing-details"] } },
    ]);
  }

  // private checkOut() {
  //   const client = rapid.createClient(this.key, this.password, this.endpoint);

  //   client.createTransaction(rapid.Enum.Method.DIRECT, {
  //     Customer: {
  //       CardDetails: {
  //         Name: "John Smith",
  //         Number: "4444333322221111",
  //         ExpiryMonth: "12",
  //         ExpiryYear: "25",
  //         CVN: "123"
  //       }
  //     },
  //     Payment: {
  //       TotalAmount: 1000
  //     },
  //     TransactionType: "Purchase"
  //   }).then((response) => {
  //     if (response.get("TransactionStatus")) {
  //       console.log("Payment successful! ID: " + response.get("TransactionID"));
  //     }
  //   });
  // }
}
