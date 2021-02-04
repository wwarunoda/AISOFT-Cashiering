import { ToastService } from "./../../../../shared/services/toast.service";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { ProductService, FileService } from "../../../../shared/services";
import {
  Product,
  Brand,
  Gender,
  Category,
  Size,
} from "../../../../shared/models";
import { ActivatedRoute } from "@angular/router";
import { FileExt } from "../../../../shared/models/file.ext";

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
  selectedGend: Gender;
  genderList: Gender[];
  product: Product = new Product();
  brandsList: Brand[];
  categoryMasterList: Category[];
  categoryList: Category[];
  selectedCategory: Category;
  sizeMasterList: Size[];
  sizeList: Size[];
  fileList: FileExt[];
  selectedSize: Size;
  seletedBrand: "All";
  selectedGenderKey: "";
  constructor(
    private productService: ProductService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private fileService: FileService
  ) {}

  ngOnInit() {
    this.getMasterData();
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
      // $("#exampleModalLong").modal("hide");
      this.product = payload;
      this.uploadFiles(this.product.$key);
      toastr.success(
        "product " + payload.productName + "is added successfully",
        "Product Creation"
      );
    });
  }

  private getMasterData(): void {
    // Select Brands

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

  onGenderChange(genderChangeValue: Gender) {
    this.categoryList = this.categoryMasterList.filter(
      (category) => category.genderKey == genderChangeValue.$key
    );
  }

  onCategoryChange(categoryChangeValue: Category) {
    this.selectedCategory = categoryChangeValue;
    this.sizeList = this.sizeMasterList.filter(
      (size) => size.sizeTypeKey == categoryChangeValue.sizeTypeKey
    );
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

  private uploadFiles(productKey$: string): void {
    if (this.fileList && this.fileList.length) {
      let fileCount = 0;
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
        const uploadTask = this.fileService.uploadFile("products", file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            file.uploadProgress = progress;
            // switch (snapshot.state) {
            //   case firebase.storage.TaskState.PAUSED: // or 'paused'
            //     console.log('Upload is paused');
            //     break;
            //   case firebase.storage.TaskState.RUNNING: // or 'running'
            //     console.log("Upload is running");
            //     break;
            // }
          },
          (error) => {
            file.errorMessage = error.message;
            this.toastService.error("Error :", error);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              console.log("File available at", downloadURL);
              file.downloadedUrl = downloadURL;
            });
          }
        );
      });
    }
  }

  onFileChange(event) {
    this.fileList = [];
    this.fileList = [...event.target.files];
    this.fileList.forEach((file) => {
      file.uploadProgress = 0;
    });
  }
}
