import { Component, OnInit } from "@angular/core";
import { ReceiptProduct } from "../../../../shared/models";
import { ProductService } from "../../../../shared/services/product.service";
@Component({
  selector: "app-cart-products",
  templateUrl: "./cart-products.component.html",
  styleUrls: ["./cart-products.component.scss"],
})
export class CartProductsComponent implements OnInit {
  cartProducts: ReceiptProduct[];
  showDataNotFound = true;

  // Not Found Message
  messageTitle = "No Products Found in Cart";
  messageDescription = "Please, Add Products to Cart";

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.getCartProduct();
  }

  removeCartProduct(product: ReceiptProduct) {
    this.productService.removeLocalCartReceipt(product);

    // Recalling
    this.getCartProduct();
  }

  getCartProduct() {
    this.cartProducts = this.productService.getLocalCartReceipt();
  }
}
