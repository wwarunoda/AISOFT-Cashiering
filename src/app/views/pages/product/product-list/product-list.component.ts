import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from "@angular/core";

import { AuthService, ProductService, ToastService } from "../../../../shared/services/";
import { Brand, Product, Gender, Category } from "../../../../shared/models";
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  productMasterList: Product[];
  productList: Product[];
  loading = false;
  brands: Brand[];
  selectedBrand:Brand = { $key: '', name: "All", description: '', id: 0, index: 1  };
  selectedCategory:Category = { $key: '', name: "All Categories", genderKey: '', description: '', id: 0, index: 1  };
  genderList: Gender[];
  categoryMasterList: Category[];
  categoryList: Category[];
  selecredGender: Gender;
  page = 1;
  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private toastService: ToastService,
    private router:Router,
    private activatedRoute:ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.getMasterData();
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }

  removeProduct(key: string) {
    this.productService.deleteProduct(key);
  }

  addFavourite(product: Product) {
    this.productService.addFavouriteProduct(product);
  }

  addToCart(product: Product) {
    this.productService.addToCart(product);
  }

  private getMasterData(): void {
    const allBrands = this.productService.getBrands();
    allBrands.snapshotChanges().subscribe(
      (product) => {
        this.loading = false;
        this.brands = [{
          $key: '',
          id: 0,
          name: 'All',
          description: '',
          index: 1
        }];
        product.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.brands.push(y as Brand);
        });
      },
      (err) => {
        this.toastService.error("Error while fetching Products", err);
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
        this.filterGender();
      },
      (err) => {
        this.toastService.error("Error while fetching Genders", err);
      }
    );

    const allCteogories = this.productService.getCategories();
    allCteogories.snapshotChanges().subscribe(
      (category) => {
        this.categoryMasterList = [];
        category.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.categoryMasterList.push(y as Category);
        });
        this.filterGender();
      },
      (err) => {
        this.toastService.error("Error while fetching Category", err);
      }
    );
  }

  private filterGender(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.genderList != null) {
      this.selecredGender = this.genderList.find(gender => gender.$key == queryParams.key);
      this.selectCategoryByGender();
      this.getSelectdProducts();
      }
    });
  }

  private selectCategoryByGender() {
    if(this.categoryMasterList != null) {
      this.categoryList = [{
        $key: '',
        id: 0,
        name: 'All Categories',
        genderKey: '',
        description: '',
        index: 1
      }];
      this.categoryList = this.categoryMasterList.filter(category => category.genderKey == this.selecredGender.$key);
    }
  }

  private getSelectdProducts() {
    this.loading = true;
    const x = this.productService.getProducts();
    x.snapshotChanges().subscribe(
      (product) => {
        this.loading = false;
        this.productMasterList = [];
        product.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.productMasterList.push(y as Product);
        });
        const productTempList: Product[] = this.productMasterList.filter(product => product.genderKey == this.selecredGender.$key);
        // no need to filter product by category, Gender selection is automatically filter relevant categories
        if(this.categoryList != null) {
          this.productList = [];
          this.categoryList.forEach(category => {
            const productCategoryList = productTempList.filter(product => product.productCategory == category.$key);
            this.productList.push(...productCategoryList);
          });
        }
      },
      (err) => {
        this.toastService.error("Error while fetching Products", err);
      }
    );
  }
}
