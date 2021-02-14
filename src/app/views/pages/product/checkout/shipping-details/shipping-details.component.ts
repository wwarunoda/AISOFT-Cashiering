import { Product } from "../../../../../shared/models/product";
import { ShippingService } from "../../../../../shared/services/shipping.service";
import { UserDetail, User } from "../../../../../shared/models/user";
import { AuthService } from "../../../../../shared/services/auth.service";
import { Component, OnInit, Renderer2, Inject } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ProductService } from "../../../../../shared/services/product.service";
import { DOCUMENT } from '@angular/common';
import { map } from "rxjs/operators";
@Component({
  selector: "app-shipping-details",
  templateUrl: "./shipping-details.component.html",
  styleUrls: ["./shipping-details.component.scss"],
})
export class ShippingDetailsComponent implements OnInit {
  userDetails: User;
  shippingForm: FormGroup;

  // userDetail: UserDetail;

  products: Product[];
  key =
    "A1001CTYCxgwTHvadCWKyV9m/ixKCimCqN/cv5/2+SiU0iNc267zZAdNMpqUkizVY9tG7J";
  password = "s4nydboX";
  endpoint = "sandbox";
  // handler:any = null;
  constructor(
    authService: AuthService,
    private shippingService: ShippingService,
    productService: ProductService,
    private router: Router,
    private _renderer2: Renderer2,
    private formBuilder: FormBuilder,
   @Inject(DOCUMENT) private _document: Document
  ) {
    /* Hiding products Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "block";
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("resultTab").style.display = "none";

    // this.userDetail = new UserDetail();
    this.products = productService.getLocalCartProducts();
    // authService.user$.pipe(
    //   map((user) => {
    //     this.userDetails = user;
    //   })
    // );
  }


  ngOnInit() {
    this.initForms();
    this.loadStripe();
  }

  private initForms() {
    this.shippingForm = this.formBuilder.group({
      key$: "",
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.required],
      address: [null, Validators.required],
      address2: [null, Validators.required],
      state: [0, Validators.required],
    });
  }

  get keyController(): AbstractControl {
    return this.shippingForm.controls.key$;
  }
  get firstNameController(): AbstractControl {
    return this.shippingForm.controls.firstName;
  }
  get lastNameController(): AbstractControl {
    return this.shippingForm.controls.lastName;
  }
  get emailController(): AbstractControl {
    return this.shippingForm.controls.firstName;
  }
  get addressController(): AbstractControl {
    return this.shippingForm.controls.address;
  }
  get address2Controller(): AbstractControl {
    return this.shippingForm.controls.address2;
  }
  get stateController(): AbstractControl {
    return this.shippingForm.controls.state;
  }

  updateUserDetails() {
    const products = [];
    let totalPrice = 0;
    this.products.forEach((product) => {
      delete product.$key;
      totalPrice += product.productPrice;
      products.push(product);
    });
    const data = {
      $key: '',
      userId: 1,
      firstName: this.firstNameController.value,
      lastName: this.lastNameController.value,
      emailId: this.emailController.value,
      address1: this.addressController.value,
      address2: this.address2Controller.value,
      country: '',
      state: this.stateController.value,
      zip: '000',
      products,
      totalPrice,
      shippingDate: Date.now(),
    };
    this.pay(totalPrice);
    this.shippingService.createshippings(data);
    this.router.navigate([
      "checkouts",
      { outlets: { checkOutlet: ["billing-details"] } },
    ]);
  }

  private loadStripe() {
    if(!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://secure.ewaypayments.com/scripts/eCrypt.js";
      // s.onload = () => {
      //   this.handler = (<any>window).StripeCheckout.configure({
      //     key: 'pk_test_aeUUjYYcx4XNfKVW60pmHTtI',
      //     locale: 'auto',
      //     token: function (token: any) {
      //       // You can access the token ID with `token.id`.
      //       // Get the token ID to your server-side code for use.
      //       console.log(token)
      //       alert('Payment Success!!');
      //     }
      //   });
      // }
      window.document.body.appendChild(s);
    }
  }

  pay(amount: number) {

    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_aeUUjYYcx4XNfKVW60pmHTtI',
      locale: 'auto',
      token: function (token: any) {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        console.log(token)
        alert('Token Created!!');
      }
    });

    handler.open({
      name: 'Demo Site',
      description: '2 widgets',
      amount
    });

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
