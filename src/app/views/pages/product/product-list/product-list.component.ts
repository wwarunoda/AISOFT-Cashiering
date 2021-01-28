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
  productList: Product[];
  loading = false;
  brands: Brand[];
  selectedBrand:Brand = { $key: '', name: "All", description: '', id: 0, index: 1  };
  selectedCategory:Category = { $key: '', name: "All Categories", description: '', id: 0, index: 1  };
  genderList: Gender[];
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
      (gender) => {
        this.categoryList = [
          {
            $key: '',
            id: 0,
            name: 'All Categories',
            description: '',
            index: 1
          }
        ];
        gender.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.categoryList.push(y as Category);
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
      this.productService.setActiveGender(this.selecredGender);
      this.getSelectdProducts();
      }
    });

  }

  private getSelectdProducts() {
    this.loading = true;
    const x = this.productService.getProducts();
    x.snapshotChanges().subscribe(
      (product) => {
        this.loading = false;
        this.productList = [];
        product.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.productList.push(y as Product);
        });
        this.productList = this.productList.filter(product => product.genderKey == this.selecredGender.$key);
      },
      (err) => {
        this.toastService.error("Error while fetching Products", err);
      }
    );
  }
}
