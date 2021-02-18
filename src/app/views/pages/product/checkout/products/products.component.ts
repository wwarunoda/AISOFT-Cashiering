import { ProductService } from "../../../../../shared/services/product.service";
import { Component, OnInit } from "@angular/core";
import { Product, ReceiptProduct } from "../../../../../shared/models";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
})
export class ProductsComponent implements OnInit {
  checkoutProducts: Product[];
  receiptProduct: ReceiptProduct[];
  totalPrice: number = 0;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.createShoppingCartTabs();
    this.getProductData();
  }

  private createShoppingCartTabs(): void {
    document.getElementById("shippingTab").style.display = "none";
    // document.getElementById("billingTab").style.display = "none";
    document.getElementById("resultTab").style.display = "none";
  }

  private getProductData(): void {
    const products = this.productService.getLocalCartProducts();

    this.checkoutProducts = products;

    this.receiptProduct = this.productService.getLocalCartReceipt();

    products.forEach((product) => {
      this.totalPrice += product.productPrice;
    });
  }
}
