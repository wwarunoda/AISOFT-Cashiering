import { ToastService } from './../../../../shared/services/toast.service';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { ProductService } from "../../../../shared/services/product.service";
import { Product, Brand, Gender, Category } from "../../../../shared/models";
import { ActivatedRoute } from '@angular/router';

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
  seletedBrand: "All";
  selectedGenderKey: '';
  constructor(private productService: ProductService,
              private toastService: ToastService,
              private activatedRoute:ActivatedRoute) {}

  ngOnInit() {
      this.getMasterData();

  }

  createProduct(productForm: NgForm) {
    const payload: Product = {
      ...productForm.value,
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
      $("#exampleModalLong").modal("hide");
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
        this.selectedGend = this.genderList.find(gender => gender.$key == this.selectedGenderKey);
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

    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.selectedGenderKey = queryParams.key;
      if (this.genderList != null) {
      this.selectedGend = this.genderList.find(gender => gender.$key == queryParams.key);
      }
    });


  }
  onGenderChange(genderChangeValue: Gender) {
    this.categoryList = this.categoryMasterList.filter(category => category.genderKey == genderChangeValue.$key);
  }
  onCategoryChange(categoryChangeValue: Category) {
    this.selectedCategory = categoryChangeValue;
  }
  private selectCategoryByGender() {
    if(this.categoryMasterList != null) {
      this.categoryList = [];
      if(this.getMasterData != null && this.selectedGend != null) {
        this.categoryList = this.categoryMasterList.filter(category => category.genderKey == this.selectedGend.$key);
        if(this.categoryList != null)
          this.selectedCategory = this.categoryList[0];
      }
    }
  }
}
