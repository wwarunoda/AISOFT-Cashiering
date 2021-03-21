import { ShippingService, ReceiptService, AuthService, ToastService } from "../../../../../shared/services";
import { Receipt, User, ReceiptProduct, Product, Billing, ProductQuantity, AddressState } from "../../../../../shared/models";
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
  tempUser: User;
  addressState: AddressState[];
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
    this.getMasterData();
    this.getAllProducts();
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
      state: [0, Validators.required],
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
      if (this.userDetail && !this.userDetail.$key && this.tempUser && this.tempUser.$key) {
        this.userDetail.$key = this.tempUser.$key;
      } else if (this.userDetail && !this.userDetail.$key){
        this.userDetail.$key = "anonymous";
      } else if (!this.userDetail) {
        this.userDetail = {
          firstName: this.firstNameController.value,
          lastName: this.lastNameController.value,
          phoneNumber: this.phoneController.value,
          emailId: this.emailController.value,
          unitNumber: this.unitNumberController.value,
          street: this.stateController.value,
          surburb: this.surburbController.value,
          country: this.countryController.value,
          state: this.stateController.value,
          $key: "anonymous"
        };
      }
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
        userKey: this.userDetail.$key,
        createdDate: Date.now().toLocaleString(),
      };

      delete this.shippingDetails.$key;
      // this.pay(this.totalPrice);
      this.shippingService.createShippings(this.shippingDetails);
      this.createReceipt();
    } else {
      this.toastService.error(
        "Form Invalid",
        "All required fields has to be filled"
      );
    }
  }
  private getMasterData() {
    const states = this.shippingService.getStates();
    states.snapshotChanges().subscribe(
      (state) => {
        this.addressState = [];
        state.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.addressState.push(y as AddressState);
        });
      });
    this.authService.user$.subscribe((user) => {
        if (user.hasOwnProperty('$key')) {
          this.tempUser = user;
        }
      });
  }

  private getLocalReceiptDetails() {
    this.receiptProduct = this.productService.getLocalCartReceipt();
    const customerDetails: Billing = {};
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
      customerDetails.userKey = localAddress.userKey;
      this.userDetail = customerDetails;
      this.setCustomerDetails(customerDetails);
      this.shippingService.createShippings(customerDetails);
    } else {
      this.authService.user$.subscribe((user) => {
        if (user.hasOwnProperty('$key')) {
          this.userDetail = user;
          customerDetails.emailId = user.emailId;
          customerDetails.firstName = user.firstName;
          customerDetails.lastName = user.lastName;
          customerDetails.phoneNumber = user.phoneNumber;
          customerDetails.country = "Australia";
          customerDetails.state = user.state;
          customerDetails.street = user.street;
          customerDetails.surburb = user.surburb;
          customerDetails.unitNumber = user.unitNumber;
          customerDetails.userKey = user.$key;
        }
        this.setCustomerDetails(customerDetails);
        this.shippingService.createShippings(customerDetails);
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
    if (this.validateProductQuantity()) {
      const receipt: Receipt = {createdDate: new Date().toString(), lastUpdatedDate: new Date().toString()};
      receipt.receiptProducts = this.receiptProduct;
      receipt.shippingDetails = this.shippingDetails;
      if (this.userDetail) {
        if (!this.userDetail.$key && this.tempUser && this.tempUser.$key) {
          this.userDetail.$key = this.tempUser.$key;
        } else if (!this.userDetail.$key){
          this.userDetail.$key = "anonymous";
        }
        receipt.userKey = this.userDetail.$key;
        if (this.userDetail.firstName) {
          receipt.userName = this.userDetail.firstName + " " + this.userDetail.lastName;
        } else {
          receipt.userName = this.firstNameController.value + " " + this.lastNameController.value;
        }
        receipt.userPhoneNumber = this.userDetail?.phoneNumber ?? this.phoneController.value;
        receipt.userEmail = this.userDetail.emailId ?? this.emailController.value;
      }
      receipt.totalAmount = this.totalPrice + this.tax;
      // remove product keys before insert
      receipt.receiptProducts.forEach((rpt) => delete rpt.$key);
      receipt.status = ReceiptStatusEnum.PendingPayment;
      // push data to database

      this.receiptService.createReceipts(receipt);
      this.toastService.wait(
        "Adding Shipping Address", "Shipping Address Added"
      );
      this.router.navigate([
        "checkouts",
        { outlets: { checkOutlet: ["result"] } },
      ]);
    } else {
      this.toastService.error("Product Validation", "Selected Product not available");
    }
  }

  private validateProductQuantity(): boolean {
    let status: boolean = true;
    this.receiptProduct.forEach(rcpt => {
      let quantity: number = 0;
      if (status) {
      const selectedProduct: Product = this.products.find(product => product.$key === rcpt.productKey);
      if (selectedProduct && selectedProduct.productQuantity) {
        const productQuantities: ProductQuantity[] = [];
        for (const prd of Object.keys(selectedProduct.productQuantity)) {
          productQuantities.push(selectedProduct.productQuantity[prd]);
        }
        const selectedQuantity = productQuantities
          .find((x) => x.productColor === rcpt.productColour);
        const tempProduct = this.receiptProduct
          .filter(x => x.productKey === rcpt.productKey && x.productColour === rcpt.productColour && x.sizeName === rcpt.sizeName);
        tempProduct.forEach(y => quantity += y.productQuantity);
        if (selectedQuantity && quantity > selectedQuantity.productQuantity) {
          status = false;
        }
    }
    }});
    return status;
  }

  addressReset() {
    this.shippingService.removeLocalAddresses();
    this.setCustomerDetails({});
  }
}
