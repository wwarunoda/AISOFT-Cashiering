import { ProductService } from "../../../../../shared/services/product.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Product } from "../../../../../shared/models/product";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
})
export class ProductsComponent implements OnInit {
  checkoutProducts: Product[];
  totalPrice: number = 0;

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.createShoppingCartTabs();
    this.getProductData();
  }

  private createShoppingCartTabs(): void {
    document.getElementById("shippingTab").style.display = "none";
    document.getElementById("billingTab").style.display = "none";
    document.getElementById("resultTab").style.display = "none";
  }

  private getProductData(): void {
    const products = this.productService.getLocalCartProducts();

    this.checkoutProducts = products;

    products.forEach((product) => {
      this.totalPrice += product.productPrice;
    });
  }
}
