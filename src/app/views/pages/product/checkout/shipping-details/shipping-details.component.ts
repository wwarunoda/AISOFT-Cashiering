import { ShippingService, ReceiptService, AuthService, ToastService } from "../../../../../shared/services";
import { Receipt, User, ReceiptProduct, Product, Billing } from "../../../../../shared/models";
import { ReceiptStatusEnum } from "../../../../../shared/enum";
import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ProductService } from "../../../../../shared/services/product.service";
import { select } from "@ngrx/store";
@Component({
  selector: "app-shipping-details",
  templateUrl: "./shipping-details.component.html",
  styleUrls: ["./shipping-details.component.scss"],
})
export class ShippingDetailsComponent implements OnInit, OnDestroy {
  userDetails: User;
  shippingForm: FormGroup;
  totalPrice: number = 0;
  receiptProduct: ReceiptProduct[];
  products: Product[];
  shippingDetails: Billing;
  userDetail: User;
  tax = 6.4;

  constructor(
    private authService: AuthService,
    private shippingService: ShippingService,
    private productService: ProductService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private receiptService: ReceiptService
  ) {
    /* Hiding products Element */
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("shippingTab").style.display = "block";
    document.getElementById("productsTab").style.display = "none";
    document.getElementById("resultTab").style.display = "none";
    // authService.user$.pipe(
    //   map((user) => {
    //     this.userDetails = user;
    //   })
    // );
  }

  ngOnInit() {
    this.initForms();
    this.getAllProducts();
    this.getLocalReceiptDetails();
    this.authService.user$.subscribe((user) => {
      if(user.hasOwnProperty('$key')) {
        this.userDetail = user;
      }
    });
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
      this.shippingDetails = {
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

      delete this.shippingDetails.$key;
      // this.pay(this.totalPrice);
      this.shippingService.createShippings(this.shippingDetails);
      this.createReceipt();
        this.router.navigate([
          "checkouts",
          { outlets: { checkOutlet: ["result"] } },
        ]);
    } else {
      this.toastService.error(
        "Form Invalid",
        "All required fields has to be filled"
      );
    }
  }

  private getLocalReceiptDetails() {
    this.receiptProduct = this.productService.getLocalCartReceipt();
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
    this.calculateTotalPrice();
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
    if (this.receiptProduct && this.receiptProduct.length) {
      this.totalPrice = 0;
      this.receiptProduct.forEach((product) => {
          this.totalPrice += (product.productPrice * product.productQuantity);
      });
    }
  }

  private getAllProducts() {
    const x = this.productService.getProducts();
    x.snapshotChanges().subscribe(
      (product) => {
        this.products = [];
        product.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.products.push(y as Product);
        });
      });
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

  // Receipt Creation

  private createReceipt() {
    // if (this.validateProductQuantity()) {
      if (true) {
      const receipt: Receipt = {};
      receipt.receiptProducts = this.receiptProduct;
      receipt.shippingDetails = this.shippingDetails;
      if (this.userDetail) {
        receipt.userKey = this.userDetail.$key;
        receipt.userName = this.userDetail.userName;
        receipt.userPhoneNumber = this.userDetail.phoneNumber;
        receipt.userEmail = this.userDetail.emailId;
      }
      receipt.totalAmount = this.totalPrice + this.tax;
      // remove product keys before insert
      receipt.receiptProducts.forEach((rpt) => delete rpt.$key);
      receipt.status = ReceiptStatusEnum.PendingPayment;
      // push data to database

      this.receiptService.createReceipts(receipt);
    } else {
      this.toastService.error("Product Validation", "Selected Product not available");
    }
  }

  // private validateProductQuantity(): boolean {
  //   this.receiptProduct.forEach(rcpt => {
  //     const selectedProduct: Product = this.products.find(product => product.$key === rcpt.productKey);
  //     if (selectedProduct && selectedProduct.productQuantity) {
  //       const productQuantity: ProductQuantity[] = selectedProduct.productQuantity??[];
  //       const selectedQuantity = productQuantity
  //         .find((x) => x.productColor === rcpt.productColour);
  //       if (selectedQuantity && rcpt.productQuantity > selectedQuantity.productQuantity) {
  //         return false;
  //       }
  //   }
  //   });
  //   return true;
  // }
}
