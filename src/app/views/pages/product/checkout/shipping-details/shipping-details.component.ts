import { Product } from "../../../../../shared/models/product";
import { ShippingService } from "../../../../../shared/services/shipping.service";
import { UserDetail, User } from "../../../../../shared/models/user";
import { AuthService } from "../../../../../shared/services/auth.service";
import { Component, OnInit, Renderer2, OnDestroy } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ProductService } from "../../../../../shared/services/product.service";
@Component({
  selector: "app-shipping-details",
  templateUrl: "./shipping-details.component.html",
  styleUrls: ["./shipping-details.component.scss"],
})
export class ShippingDetailsComponent implements OnInit, OnDestroy {
  userDetails: User;
  shippingForm: FormGroup;
  totalPrice: number = 0;

  products: Product[];

  constructor(
    authService: AuthService,
    private shippingService: ShippingService,
    productService: ProductService,
    private router: Router,
    private _renderer2: Renderer2,
    private formBuilder: FormBuilder
  ) {
    /* Hiding products Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "block";
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("resultTab").style.display = "none";

    // this.userDetail = new UserDetail();
    this.products = productService.getLocalCartProducts();
    this.calculateTotalPrice();
    // authService.user$.pipe(
    //   map((user) => {
    //     this.userDetails = user;
    //   })
    // );
  }

  ngOnInit() {
    this.initForms();
  }

  ngOnDestroy() {
    // this.removePayment();
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
    this.products.forEach((product) => {
      delete product.$key;
      products.push(product);
    });
    const data = {
      $key: "",
      userId: 1,
      firstName: this.firstNameController.value,
      lastName: this.lastNameController.value,
      emailId: this.emailController.value,
      address1: this.addressController.value,
      address2: this.address2Controller.value,
      country: "",
      state: this.stateController.value,
      zip: "000",
      products,
      totalPrice: this.totalPrice,
      shippingDate: Date.now(),
    };
    // this.pay(this.totalPrice);
    // this.shippingService.createshippings(data);
    this.router.navigate([
      "checkouts",
      { outlets: { checkOutlet: ["result"] } },
    ]);
  }

  private calculateTotalPrice() {
    if (this.products && this.products.length) {
      this.totalPrice = 0;
      this.products.forEach((product) => {
        this.totalPrice += product.productPrice;
      });
    }
  }

  // pay(amount: number) {

  //   var handler = (<any>window).StripeCheckout.configure({
  //     key: 'C3AB9CkGMOrkP+C8ErM3kZ/zs3mRvbMr2ZTUKCicXSWcSq4Isut48wRp4ihSCYzA7WBf8z',
  //     locale: 'auto',
  //     token: function (token: any) {
  //       // You can access the token ID with `token.id`.
  //       // Get the token ID to your server-side code for use.
  //       console.log(token)
  //       alert('Token Created!!');
  //     }
  //   });

  //   handler.open({
  //     name: 'Demo Site',
  //     description: '2 widgets',
  //     amount
  //   });

  // }

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
