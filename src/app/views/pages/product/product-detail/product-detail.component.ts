import { Product } from "../../../../shared/models/product";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProductService } from "../../../../shared/services/product.service";
import { ToastService } from "../../../../shared/services";
@Component({
  selector: "app-product-detail",
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private sub: any;
  product: Product;
  totalQuantity: number;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private ToastService: ToastService
  ) {
    this.product = new Product();
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      const id = params.id; // (+) converts string 'id' to a number
      this.getProductDetail(id);
    });
  }

  getProductDetail(id: string) {
    const x = this.productService.getProductById(id);
    x.snapshotChanges().subscribe(
      (product) => {
        const y = { ...(product.payload.toJSON() as Product), $key: id };
        this.product = y;

        if(this.product) {
          this.totalQuantity = 0;
          this.product.productQuantity.forEach(p => {
            if(p.productQuantity) {
              this.totalQuantity += p.productQuantity;
            }
          })
        }
      },
      (error) => {
        this.ToastService.error("Error while fetching Product Detail", error);
      }
    );
  }

  addToCart(product: Product) {
    if (this.totalQuantity > 0)
      this.productService.addToCart(product);
    else
      this.ToastService.error("Item not Available", '');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
