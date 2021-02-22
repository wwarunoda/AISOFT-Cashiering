import { ToastService } from "./../../../../../shared/services/toast.service";
import { Billing } from "./../../../../../shared/models/billing";
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
    private authService: AuthService,
    private shippingService: ShippingService,
    productService: ProductService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    /* Hiding products Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "block";
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("resultTab").style.display = "none";

    this.calculateTotalPrice();
    // authService.user$.pipe(
    //   map((user) => {
    //     this.userDetails = user;
    //   })
    // );
  }

  ngOnInit() {
    this.initForms();
    this.getLocalReceiptDetails();
  }

  ngOnDestroy() {
    // this.removePayment();
  }

  private initForms() {
    this.shippingForm = this.formBuilder.group({
      key$: "",
      firstName: [null, Validators.required],
      lastName: [null],
      email: [null, Validators.required],
      telephone: [null, [Validators.maxLength(10), Validators.required]],
      unitNumber: [null, Validators.required],
      street: [null, Validators.required],
      state: [null, Validators.required],
      surburb: [null, Validators.required],
      country: [0, Validators.required],
    });
    this.countryController.setValue("Australia");
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
    return this.shippingForm.controls.email;
  }
  get phoneController(): AbstractControl {
    return this.shippingForm.controls.telephone;
  }
  get unitNumberController(): AbstractControl {
    return this.shippingForm.controls.unitNumber;
  }
  get streetController(): AbstractControl {
    return this.shippingForm.controls.street;
  }
  get stateController(): AbstractControl {
    return this.shippingForm.controls.state;
  }
  get surburbController(): AbstractControl {
    return this.shippingForm.controls.surburb;
  }
  get countryController(): AbstractControl {
    return this.shippingForm.controls.country;
  }

  updateUserDetails() {
    if (this.validateForm()) {
      const data: Billing = {
        $key: "",
        userId: 1,
        firstName: this.firstNameController.value,
        lastName: this.lastNameController.value,
        emailId: this.emailController.value,
        phoneNumber: this.phoneController.value,
        unitNumber: this.unitNumberController.value,
        street: this.streetController.value,
        country: this.countryController.value,
        surburb: this.surburbController.value,
        state: this.stateController.value,
        createdDate: Date.now().toLocaleString(),
      };

      delete data.$key;
      // this.pay(this.totalPrice);
      this.shippingService.createShippings(data);

      setTimeout(() => {
        this.router.navigate([
          "checkouts",
          { outlets: { checkOutlet: ["result"] } },
        ]);
      }, 1000);
    } else {
      this.toastService.error(
        "Form Invalid",
        "All required fields has to be filled"
      );
    }
  }

  private getLocalReceiptDetails() {
    let customerDetails: Billing = {};
    const localAddressArray = this.shippingService.getLocalShippings();
    if (localAddressArray && localAddressArray.length) {
      const localAddress = localAddressArray[0];
      customerDetails.country = localAddress.country;
      customerDetails.emailId = localAddress.emailId;
      customerDetails.firstName = localAddress.firstName;
      customerDetails.lastName = localAddress.lastName;
      customerDetails.phoneNumber = localAddress.phoneNumber;
      customerDetails.state = localAddress.state;
      customerDetails.street = localAddress.street;
      customerDetails.surburb = localAddress.surburb;
      customerDetails.unitNumber = localAddress.unitNumber;
      this.setCustomerDetails(customerDetails);
    } else {
      this.authService.user$.subscribe((user) => {
        customerDetails.emailId = user.emailId;
        customerDetails.firstName = user.userName;
        customerDetails.phoneNumber = user.phoneNumber;
        customerDetails.country = "Australia";
        this.setCustomerDetails(customerDetails);
      });
    }
  }

  private setCustomerDetails(customerDetails: Billing ) {
    this.firstNameController.setValue(customerDetails.firstName);
    this.lastNameController.setValue(customerDetails.lastName);
    this.emailController.setValue(customerDetails.emailId);
    this.phoneController.setValue(customerDetails.phoneNumber);
    this.unitNumberController.setValue(customerDetails.unitNumber);
    this.streetController.setValue(customerDetails.street);
    this.stateController.setValue(customerDetails.state);
    this.surburbController.setValue(customerDetails.surburb);
    this.countryController.setValue(customerDetails.country);
  }

  private calculateTotalPrice() {
    if (this.products && this.products.length) {
      this.totalPrice = 0;
      this.products.forEach((product) => {
        product.productQuantity.forEach((quantity) => {
          this.totalPrice += (product.productPrice * quantity.productQuantity);
        });
      });
    }
  }

  private validateForm(): boolean {
    return (
      this.firstNameController.value &&
      this.phoneController.value &&
      this.emailController.value &&
      this.unitNumberController.value &&
      this.streetController.value &&
      this.countryController.value &&
      this.surburbController.value &&
      this.stateController.value
    );
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
