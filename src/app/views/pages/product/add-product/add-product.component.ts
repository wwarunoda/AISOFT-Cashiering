import { ToastService } from "./../../../../shared/services/toast.service";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
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
  Material,
  File,
} from "../../../../shared/models";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductsEnum } from "../../../../shared/enum";
import { FirebaseApp } from "@angular/fire";
import { DomSanitizer } from "@angular/platform-browser";
import { first, map } from "rxjs/operators";

declare var $: any;
declare var require: any;
declare var toastr: any;
const shortId = require("shortid");
const moment = require("moment");

declare var File: {
  prototype: File;
  new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
};
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
  selectedMaterial: Material;
  sizeMasterList: Size[];
  sizeList: Size[];
  fileList: any[] = [];
  existingFileList: FileExt[] = [];
  selectedSize: Size;
  seletedBrand: "All";
  selectedGenderKey: "";
  productKey: string;

  isQuantityUpdate = false;
  isUpdate = false;
  isAttachmentUploading = false;
  isSavedSuccessfully = false;
  materialList: Material[];

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
  get productMaterialController(): AbstractControl {
    return this.productForm.controls.productMaterial;
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
    private formBuilder: FormBuilder,
    private router: Router
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
      productGender: [0, Validators.required],
      productBrand: [0, Validators.required],
      productName: [null, Validators.required],
      productCategory: [0, Validators.required],
      productMaterial: [0, Validators.required],
      productPrice: [0, Validators.required],
      productDescription: null,
      productImages: null,
    });

    this.productFormExt = this.formBuilder.group({
      key$: "",
      productSize: [0, Validators.required],
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
        if (this.brandsList && this.brandsList.length) {
          this.productBrandController.setValue(this.brandsList[0]);
        }
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
            (activeGender) => activeGender.$key === this.selectedGenderKey
          );
          if (this.genderList.length) {
            this.productGenderController.setValue(this.genderList[0]);
            this.onGenderChange();
          }
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
        this.onGenderChange();
      },
      (err) => {
        this.toastService.error("Error while fetching Category", err);
      }
    );

    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.selectedGenderKey = queryParams.key;
      if (this.genderList != null) {
        this.selectedGend = this.genderList.find(
          (gender) => gender.$key === queryParams.key
        );
        this.categoryList = this.categoryMasterList.filter(
          (category) => category.genderKey === this.selectedGend?.$key
        );
        if (this.categoryList != null) {
          this.selectedCategory = this.categoryList[0];
          this.selectSizes(this.selectedCategory);
        }
      }
      // this.getProductByKey("-MSuKdjfhWfrkoO875Bf");
      if (queryParams && queryParams.productKey) {
        this.getProductByKey(queryParams.productKey);
      }
    });

    // Select Material
    const allMaterials = this.productService.getMaterial();
    allMaterials.snapshotChanges().subscribe(
      (material) => {
        this.materialList = [];
        material.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.materialList.push(y as Material);
        });
        if (this.materialList) {
          this.selectedMaterial = this.materialList[0];
          this.productMaterialController.setValue(this.selectedMaterial);
        }
      },
      (err) => {
        this.toastService.error("Error while fetching Material", err);
      }
    );
  }

  // get product by id
  private getProductByKey(productKey: string) {
    this.productKey = productKey;
    this.productService
      .getProductById(productKey)
      .valueChanges()
      .subscribe((product) => {
        if (!this.isSavedSuccessfully) {
          this.isUpdate = true;
          this.product = product;
          this.existingFileList = this.product.imageList;
          this.categoryList = this.categoryMasterList;
          this.productQuantityList = this.product.productQuantity;
          this.productPriceController.setValue(this.product.productPrice);
          this.productDescriptionController.setValue(
            this.product.productDescription
          );
          this.productNameController.setValue(this.product.productName);

          this.productForm.disable();
          this.productImagesController.enable();
          this.productPriceController.enable();

          if (this.product.productCategoryVM) {
            this.productCategoryController.setValue(
              this.categoryList.find(
                (category) => category.id === this.product.productCategoryVM.id
              )
            );
          }

          if (this.product.genderVM) {
            this.productGenderController.setValue(
              this.genderList.find(
                (gender) => gender.id === this.product.genderVM.id
              )
            );
          }

          if (this.product.productBrandVM) {
            this.productBrandController.setValue(
              this.brandsList.find(
                (brand) => brand.id === this.product.productBrandVM.id
              )
            );
          }

          if (this.product.materialKey) {
            this.productMaterialController.setValue(
              this.materialList.find((m) => m.$key === this.product.materialKey)
            );
          }
        }
      });
  }

  private selectCategoryByGender() {
    if (this.categoryMasterList != null) {
      this.categoryList = [];
      if (this.selectedGend != null) {
        this.categoryList = this.categoryMasterList.filter(
          (category) => category.genderKey === this.selectedGend.$key
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
          if (this.sizeList && this.sizeList.length) {
            this.productSizeController.setValue(this.sizeList[0]);
          }
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
      this.isAttachmentUploading = true;
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
          file.fileKey = productKey$ + "_" + fileCount;
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
                this.isAttachmentUploading = false;
              }
            });
          }
        );
      });
    }
  }

  onGenderChange() {
    this.categoryList = this.categoryMasterList?.filter(
      (category) =>
        category.genderKey === this.productGenderController.value.$key
    );
    if (this.categoryList && this.categoryList.length) {
      this.productCategoryController.setValue(this.categoryList[0]);
    }
    this.selectedGenderKey = this.productGenderController.value.$key;
  }s

  onCategoryChange(categoryChangeValue: Category) {
    this.selectedCategory = categoryChangeValue;
    if (this.sizeMasterList) {
      this.sizeList = this.sizeMasterList.filter(
        (size) => size?.sizeTypeKey === categoryChangeValue?.sizeTypeKey
      );
    }
  }

  onMaterialChange(materialChangeValue: Category) {
    this.selectedMaterial = materialChangeValue;
  }

  // on select images
  onSelect(event) {
    this.fileList = [...event.addedFiles];
    this.fileList.forEach((file) => {
      file.uploadProgress = 1;
    });

    this.uploadFiles(shortId.generate());
  }

  // on remove images
  onRemove(event) {
    this.fileList.splice(this.fileList.indexOf(event), 1);
    this.fileService.deleteFile(ProductsEnum.TableName, event);
  }

  // add product
  addProduct() {
    if (
      this.productForm.valid &&
      this.productQuantityList &&
      this.productQuantityList.length &&
      ((this.fileList && this.fileList.length) ||
        (this.isUpdate &&
          this.existingFileList &&
          this.existingFileList.length)) &&
      !this.isAttachmentUploading
    ) {
      if (!this.isUpdate) {
        this.product = {
          productQuantity: this.productQuantityList,
          productBrandKey: this.productBrandController.value.$key,
          productBrandVM: this.productBrandController.value,
          genderKey: this.selectedGenderKey,
          gender: this.productGenderController.value.name,
          genderVM: this.productGenderController.value,
          productCategory: this.productCategoryController.value.$key,
          productCategoryVM: this.productCategoryController.value,
          productPrice: Number(this.productPriceController.value),
          productDescription: this.productDescriptionController.value,
          productName: this.productNameController.value,
          imageList: this.fileList,
          isActive: true,
          materialKey: this.productMaterialController.value.$key,
        };
        delete this.product.productBrandVM.$key;
        delete this.product.genderVM.$key;
        delete this.product.productCategoryVM.$key;

        this.productService.addProduct(this.product, (key) => {
          toastr.success(
            "Product " + this.product.productName + " is added successfully",
            "Product Creation"
          );
          this.isSavedSuccessfully = true;
        });
      } else {
        if (this.fileList.length) {
          this.existingFileList = this.existingFileList
            ? this.existingFileList
            : [];
          this.product.imageList = [...this.existingFileList, ...this.fileList];
        } else {
          this.product.imageList = this.existingFileList;
        }
        this.product.productQuantity = this.productQuantityList;
        this.product.productPrice = Number(this.productPriceController.value);
        this.productService.updateProduct(this.productKey, this.product, () => {
          toastr.success(
            "Product " + this.product.productName + " is updated successfully",
            "Product Modification"
          );
          this.isSavedSuccessfully = true;
        });
      }
      this.resetProductForm();
      this.getMasterData();
    }
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
      if (this.productQuantityList) {
        this.productQuantityList = [...this.productQuantityList, quantity];
      } else {
        this.productQuantityList = [quantity];
      }

      this.resetProductQuantity();
    }
  }

  // add product quantity
  updateProductQuantity(quantity: ProductQuantity): void {
    this.isQuantityUpdate = true;
    this.productColorController.setValue(quantity.productColor);
    this.productColorDescriptionController.setValue(
      quantity.productColorDescription
    );
    this.productQuantityController.setValue(quantity.productQuantity);
    this.productQuantityKeyController.setValue(quantity.id);
    this.productSizeController.setValue(
      this.sizeMasterList.find(
        (size) => size.data === quantity.productSize.data
      )
    );
    this.productSizeController.disable();
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
    this.productFormExt.enable();
    this.productColorController.setValue("#ffffff");
  }

  // reset forms
  resetProductForm() {
    this.product = {};
    this.fileList = [];
    this.isSavedSuccessfully = false;
    this.isUpdate = false;
    this.productQuantityList = [];
    this.productForm.reset();
    this.productForm.enable();
    this.resetProductQuantity();
  }

  // close dialog
  closeDialog() {
    $("#exampleModalLong").modal("hide");
    this.resetProductForm();
    this.router.navigate(["products/all-products"], {
      queryParams: { key: this.selectedGenderKey },
    });
  }

  removeImage(image: FileExt) {
    this.existingFileList.splice(this.fileList.indexOf(image), 1);
    this.fileService.deleteFile(ProductsEnum.TableName, image);
  }
}
