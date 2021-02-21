import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, ViewChild } from "@angular/core";

import {
  AuthService,
  ProductService,
  ToastService,
} from "../../../../shared/services/";
import {
  Brand,
  Product,
  Gender,
  Category,
  Material,
} from "../../../../shared/models";

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
  initialCategory: Category = {
    $key: "",
    name: "All Categories",
    genderKey: "",
    description: "",
    id: 0,
    index: 1,
    sizeTypeKey: "",
  };
  selectedBrand: Brand = {
    $key: "",
    name: "All",
    description: "",
    id: 0,
    index: 1,
  };
  selectedCategory: Category = this.initialCategory;
  genderList: Gender[];
  categoryMasterList: Category[];
  categoryList: Category[];
  activatedRouteKey: string;
  materialList: Material[];
  selectedMaterial: Material = { $key: "", name: "All" };
  page = 1;
  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getMasterData();
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }

  removeProduct(key: string) {
    this.productService.deleteProduct(key);
  }

  updateProduct(key: string) {
    console.log(this.activatedRoute);
  }

  addFavourite(product: Product) {
    this.productService.addFavouriteProduct(product);
  }

  addToCart(product: Product) {
    this.productService.addToCart(product, null);
  }

  private getMasterData(): void {
    const allBrands = this.productService.getBrands();
    allBrands.snapshotChanges().subscribe(
      (product) => {
        this.loading = false;
        this.brands = [
          {
            $key: "",
            id: 0,
            name: "All",
            description: "",
            index: 1,
          },
        ];
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

    const allMaterials = this.productService.getMaterial();
    allMaterials.snapshotChanges().subscribe(
      (material) => {
        this.materialList = [
          {
            $key: "",
            name: "All",
          },
        ];
        material.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.materialList.push(y as Material);
        });
      },
      (err) => {
        this.toastService.error("Error while fetching Material", err);
      }
    );
  }

  private filterGender(): void {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      if (this.genderList != null) {
        this.activatedRouteKey = queryParams.key;
        this.selectCategoryByGender();
        this.getSelectedProducts();
      }
    });
  }

  private selectCategoryByGender() {
    if (this.categoryMasterList != null) {
      this.selectedCategory = this.initialCategory;
      this.categoryList = [this.initialCategory];
      if (this.activatedRouteKey) {
        this.categoryList = this.categoryList.concat(
          this.categoryMasterList.filter(
            (category) => category.genderKey === this.activatedRouteKey
          )
        );
      }
    }
  }

  private getSelectedProducts() {
    this.loading = true;
    const x = this.productService.getProducts();
    x.snapshotChanges().subscribe(
      (product) => {
        this.productList = [];
        this.loading = false;
        this.productMasterList = [];
        product.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.productMasterList.push(y as Product);
        });
        let productTempList: Product[] = [];
        if (this.activatedRouteKey) {
          productTempList = this.productMasterList.filter(
            (productTemp) => productTemp.genderKey === this.activatedRouteKey
          );
        }
        // no need to filter product by category, Gender selection is automatically filter relevant categories
        if (
          this.categoryList &&
          this.categoryList.length &&
          productTempList &&
          productTempList.length
        ) {
          this.categoryList.forEach((category) => {
            const productCategoryList = productTempList.filter(
              (productTemp) => productTemp.productCategory === category.$key
            );
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
