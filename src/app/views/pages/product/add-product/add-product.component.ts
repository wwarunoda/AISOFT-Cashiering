import { ToastService } from "./../../../../shared/services/toast.service";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  Form,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { ProductService, FileService } from "../../../../shared/services";
import {
  Product,
  Brand,
  Gender,
  Category,
  Size,
  FileExt,
  ProductQuantity,
} from "../../../../shared/models";
import { ActivatedRoute } from "@angular/router";
import { ProductsEnum } from "../../../../shared/enum";

declare var $: any;
declare var require: any;
declare var toastr: any;
const shortId = require("shortid");
const moment = require("moment");

@Component({
  selector: "app-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.scss"],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  productFormExt: FormGroup;

  page = 1;
  selectedGend: Gender;
  genderList: Gender[];
  product: Product = new Product();
  productQuantityList: ProductQuantity[] = [];
  brandsList: Brand[];
  categoryMasterList: Category[];
  categoryList: Category[];
  selectedCategory: Category;
  sizeMasterList: Size[];
  sizeList: Size[];
  fileList: FileExt[] = [];
  selectedSize: Size;
  seletedBrand: "All";
  selectedGenderKey: "";
  isQuantityUpdate = false;
  isSavedSuccessfully = false;

  get keyController(): AbstractControl {
    return this.productForm.controls.key$;
  }
  get productGenderController(): AbstractControl {
    return this.productForm.controls.productGender;
  }
  get productBrandController(): AbstractControl {
    return this.productForm.controls.productBrand;
  }
  get productNameController(): AbstractControl {
    return this.productForm.controls.productName;
  }
  get productCategoryController(): AbstractControl {
    return this.productForm.controls.productCategory;
  }
  get productPriceController(): AbstractControl {
    return this.productForm.controls.productPrice;
  }
  get productDescriptionController(): AbstractControl {
    return this.productForm.controls.productDescription;
  }
  get productImagesController(): AbstractControl {
    return this.productForm.controls.productImages;
  }

  get productQuantityKeyController(): AbstractControl {
    return this.productFormExt.controls.key$;
  }
  get productSizeController(): AbstractControl {
    return this.productFormExt.controls.productSize;
  }
  get productColorController(): AbstractControl {
    return this.productFormExt.controls.productColor;
  }
  get productColorDescriptionController(): AbstractControl {
    return this.productFormExt.controls.productColorDescription;
  }
  get productQuantityController(): AbstractControl {
    return this.productFormExt.controls.productQuantity;
  }

  constructor(
    private productService: ProductService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private fileService: FileService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    // get required data
    this.getMasterData();
    // init form
    this.initForms();
  }

  // init forms
  private initForms() {
    this.productForm = this.formBuilder.group({
      key$: "",
      productGender: [null, Validators.required],
      productBrand: [null, Validators.required],
      productName: [null, Validators.required],
      productCategory: [null, Validators.required],
      productPrice: [0, Validators.required],
      productDescription: null,
      productImages: null,
    });

    this.productFormExt = this.formBuilder.group({
      key$: "",
      productSize: [null, Validators.required],
      productColor: ["#ffffff", Validators.required],
      productColorDescription: [null, Validators.required],
      productQuantity: [0, Validators.required],
    });

    this.isSavedSuccessfully = false;
  }

  private getMasterData(): void {
    const allBrands = this.productService.getBrands();
    allBrands.snapshotChanges().subscribe(
      (brand) => {
        this.brandsList = [];
        brand.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.brandsList.push(y as Brand);
        });
      },
      (err) => {
        this.toastService.error("Error while fetching Brands", err);
      }
    );

    const allGenders = this.productService.getGenders();
    allGenders.snapshotChanges().subscribe(
      (gender) => {
        this.genderList = [];
        gender.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.genderList.push(y as Gender);
        });
        if (this.genderList != null) {
          this.selectedGend = this.genderList.find(
            (gender) => gender.$key == this.selectedGenderKey
          );
        }
      },
      (err) => {
        this.toastService.error("Error while fetching Genders", err);
      }
    );

    // Select Brands
    const allCategories = this.productService.getCategories();
    allCategories.snapshotChanges().subscribe(
      (brand) => {
        this.categoryMasterList = [];
        brand.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.categoryMasterList.push(y as Category);
        });
        this.selectCategoryByGender();
      },
      (err) => {
        this.toastService.error("Error while fetching Category", err);
      }
    );

    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.selectedGenderKey = queryParams.key;
      if (this.genderList != null) {
        this.selectedGend = this.genderList.find(
          (gender) => gender.$key == queryParams.key
        );
        this.categoryList = this.categoryMasterList.filter(
          (category) => category.genderKey == this.selectedGend.$key
        );
        if (this.categoryList != null) {
          this.selectedCategory = this.categoryList[0];
          this.selectSizes(this.selectedCategory);
        }
      }
    });
  }

  private selectCategoryByGender() {
    if (this.categoryMasterList != null) {
      this.categoryList = [];
      if (this.getMasterData != null && this.selectedGend != null) {
        this.categoryList = this.categoryMasterList.filter(
          (category) => category.genderKey == this.selectedGend.$key
        );
        if (this.categoryList != null) {
          this.selectedCategory = this.categoryList[0];
        }
        this.selectSizes(this.selectedCategory);
      }
    }
  }

  private selectSizes(categorySelected: Category) {
    if (categorySelected != null) {
      const allSizes = this.productService.getSizes();
      allSizes.snapshotChanges().subscribe(
        (size) => {
          this.sizeMasterList = [];
          size.forEach((element) => {
            const y = { ...element.payload.toJSON(), $key: element.key };
            this.sizeMasterList.push(y as Size);
          });
          this.sizeList = this.sizeMasterList.filter(
            (size) => size.sizeTypeKey == categorySelected.sizeTypeKey
          );
        },
        (err) => {
          this.toastService.error("Error while fetching Size", err);
        }
      );
    }
  }

  // upload files
  private uploadFiles(productKey$: string): void {
    if (this.fileList && this.fileList.length) {
      this.productImagesController.disable();
      let fileCount = 0;
      let downloadedFileCount = 0;
      this.fileList.forEach((file) => {
        fileCount += 1;
        if (file.name) {
          const extension = file.name.substr(
            file.name.indexOf(".") + 1,
            file.name.length
          );
          const name = file.name.substr(0, file.name.indexOf("."));
          file.fileExtension = extension;
          file.fileName = name;
          file.key$ = productKey$ + "_" + fileCount;
        }
        const uploadTask = this.fileService.uploadFile(
          ProductsEnum.TableName,
          file
        );
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            file.uploadProgress = progress;
          },
          (error) => {
            file.errorMessage = error.message;
            this.toastService.error("Error :", error.message);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              file.downloadedUrl = downloadURL;
              downloadedFileCount += 1;

              if (downloadedFileCount === this.fileList.length) {
                this.isSavedSuccessfully = true;
                toastr.success(
                  "Product " +
                    this.product.productName +
                    " is added successfully",
                  "Product Creation"
                );
              }
            });
          }
        );
      });
    }
  }

  createProduct(productForm: NgForm) {
    const payload: Product = {
      // ...productForm.value,
      productCategory: this.selectedCategory.$key,
      genderKey: this.selectedGend.$key,
      gender: this.selectedGend.name,
      productId: "PROD_" + shortId.generate(),
      productAdded: moment().unix(),
      ratings: Math.floor(Math.random() * 5 + 1),
      favourite: false,
    };

    if (productForm.value.productImageUrl === undefined) {
      payload.productImageUrl =
        "http://via.placeholder.com/640x360/007bff/ffffff";
    }

    this.productService.createProduct(payload, () => {
      this.product = new Product();
      this.product = payload;
      // toastr.success(
      //   "product " + payload.productName + "is added successfully",
      //   "Product Creation"
      // );
    });
  }

  onGenderChange(genderChangeValue: Gender) {
    this.categoryList = this.categoryMasterList.filter(
      (category) =>
        category.genderKey === this.productGenderController.value.$key
    );
  }

  onCategoryChange(categoryChangeValue: Category) {
    this.selectedCategory = categoryChangeValue;
    this.sizeList = this.sizeMasterList.filter(
      (size) => size.sizeTypeKey === categoryChangeValue.sizeTypeKey
    );
  }

  // on select images
  onSelect(event) {
    this.fileList = [...event.addedFiles];
    this.fileList.forEach((file) => {
      file.uploadProgress = 1;
    });

    // this.uploadFiles(shortId);
  }

  // on remove images
  onRemove(event) {
    this.fileList.splice(this.fileList.indexOf(event), 1);
  }

  // add product
  addProduct() {
    this.product = {
      productQuantity: this.productQuantityList,
      productBrandName: this.productBrandController.value.name,
      productBrand: this.productBrandController.value,
      genderKey: this.productGenderController.value.$key,
      gender: this.productGenderController.value.name,
      genderVM: this.productGenderController.value,
      productCategory: this.productCategoryController.value.name,
      productCategoryVM: this.productCategoryController.value,
      productPrice: this.productPriceController.value,
      productDescription: this.productDescriptionController.value,
      productName: this.productNameController.value,
    };
    delete this.product.productBrand.$key;
    delete this.product.genderVM.$key;
    delete this.product.productCategoryVM.$key;

    this.productService.addProduct(this.product, (key) => {
      this.product = new Product();
      this.uploadFiles(key);
    });
  }

  // add product quantity
  addProductQuantity(): void {
    if (this.productFormExt && this.productFormExt.valid) {
      const quantity: ProductQuantity = {
        id: this.isQuantityUpdate
          ? this.productQuantityKeyController.value
          : shortId.generate(),
        productColor: this.productColorController.value,
        productSize: this.productSizeController.value,
        productColorDescription: this.productColorDescriptionController.value,
        productQuantity: this.productQuantityController.value,
      };

      delete quantity.productSize.$key;

      if (this.isQuantityUpdate) {
        const updatingQuantity = this.productQuantityList.find(
          (productQuantity) => productQuantity.id === quantity.id
        );
        this.productQuantityList = this.productQuantityList.filter(
          (productQuantity) => productQuantity.id !== quantity.id
        );
        quantity.id = updatingQuantity.id;
        this.isQuantityUpdate = false;
      }
      this.productQuantityList = [...this.productQuantityList, quantity];

      this.resetProductQuantity();
    }
  }

  // add product quantity
  updateProductQuantity(quantity: ProductQuantity): void {
    this.isQuantityUpdate = true;
    this.productFormExt.setValue(quantity);
    // this.productSizeController.setValue(this.sizeList.find(size => size.$key === quantity.productSize.$key));
  }

  // add product quantity
  deleteProductQuantity(quantity: ProductQuantity): void {
    this.productQuantityList = this.productQuantityList.filter(
      (productQuantity) => productQuantity.id !== quantity.id
    );
  }

  // rest product quantity form
  resetProductQuantity() {
    this.productFormExt.reset();
    this.productColorController.setValue("#ffffff");
  }

  // reset forms
  resetProductForm() {
    this.product = {};
    this.fileList = [];
    this.isSavedSuccessfully = false;
    this.productQuantityList = [];
    this.productForm.reset();
    this.resetProductQuantity();
  }

  // close dialog
  closeDialog() {
    $("#exampleModalLong").modal("hide");
    this.resetProductForm();
  }
}
