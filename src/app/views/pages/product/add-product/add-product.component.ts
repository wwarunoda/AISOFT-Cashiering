import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ProductService } from "../../../../shared/services/product.service";
import { Product, Brand } from "../../../../shared/models";

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
  product: Product = new Product();
  brand: Brand = new Brand();

  constructor(private productService: ProductService) {}

  ngOnInit() {
      const allBrands = this.productService.getBrands();
      allBrands.snapshotChanges().subscribe()
  }

  createProduct(productForm: NgForm) {
    const payload: Product = {
      ...productForm.value,
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

    // const brand: Brand = {
    //    $key: null,
    //    id: shortId.generate(),
    //    name: 'Emerald',
    //    description: 'Emerald Cloths'
    //  };

    //  this.productService.createBrand(brand, () => {
    //   $("#exampleModalLong").modal("hide");
    //   toastr.success(
    //     "brand " + brand.name + "is added successfully",
    //     "Brand Creation"
    //   );
    //  });
  }
}
