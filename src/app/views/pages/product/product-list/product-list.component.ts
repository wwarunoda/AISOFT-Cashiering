import { Component, OnInit } from "@angular/core";
import { Product } from "../../../../shared/models/product";
import { AuthService } from "../../../../shared/services/auth.service";
import { ProductService } from "../../../../shared/services/product.service";
import { ToastService } from "src/app/shared/services/toast.service";
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  productList: Product[];
  loading = false;
  brands = ["All", "Apple", "Realme", "Nokia", "Motorolla"];

  selectedBrand: "All";

  page = 1;
  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private ToastService: ToastService
  ) {}

  ngOnInit() {
    this.getAllProducts();
  }

  getAllProducts() {
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
      },
      (err) => {
        this.ToastService.error("Error while fetching Products", err);
      }
    );
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
}
