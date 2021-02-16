import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Billing } from "./../models/billing";
import { Injectable } from "@angular/core";
import { ShippingsProductsEnum, ProductsEnum } from "../enum";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root",
})
export class ShippingService {
  shippings: AngularFireList<Billing>;
  shipping: AngularFireObject<Billing>;
  constructor(private db: AngularFireDatabase,
              private toastService: ToastService) {
    this.getshippings();
  }

  createshippings(data: Billing) {
    const a: Billing[] = JSON.parse(localStorage.getItem("avct_shipping")) || [];
    if (data) {
      a.push(data);
    }
    this.toastService.wait(
      "Adding Shipping Address", "Shipping Address Added"
    );
    setTimeout(() => {
      localStorage.setItem("avct_shipping", JSON.stringify(a));
    }, 500);
    this.shippings.push(data);
  }

  getshippings() {
    this.shippings = this.db.list(ShippingsProductsEnum.TableName);
    return this.shippings;
  }

  getshippingById(key: string) {
    this.shipping = this.db.object(ProductsEnum.TableName + "/" + key);
    return this.shipping;
  }

  updateshipping(data: Billing) {
    this.shippings.update(data.$key, data);
  }

  deleteshipping(key: string) {
    this.shippings.remove(key);
  }
}
