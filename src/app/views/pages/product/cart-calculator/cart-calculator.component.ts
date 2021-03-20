import { ProductService, ReceiptService, ShippingService } from 'src/app/shared/services';
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { ReceiptProduct } from "../../../../shared/models";

@Component({
  selector: "app-cart-calculator",
  templateUrl: "./cart-calculator.component.html",
  styleUrls: ["./cart-calculator.component.scss"],
})
export class CartCalculatorComponent implements OnInit, OnChanges {
  @Input() products: ReceiptProduct[];

  totalValue = 0;
  constructor(  private receiptService: ReceiptService,
                private productService: ProductService,
                private shippingService: ShippingService) {}

  ngOnChanges(changes: SimpleChanges) {
    const dataChanges: SimpleChange = changes.products;

    const products: ReceiptProduct[] = dataChanges.currentValue;
    this.totalValue = 0;
    products.forEach((product) => {
      this.totalValue += (product.productPrice * product.productQuantity);
    });
  }

  ngOnInit() {}

  clearCart() {
    this.receiptService.removeLocalAllReceipt();
    this.receiptService.resetReceiptNumber();
    this.productService.removeLocalAllProducts();
  }
}
