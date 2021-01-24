import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Billing } from "./../models/billing";
import { Injectable } from "@angular/core";
import { ShippingsProductsEnum, ProductsEnum } from "../enum";

@Injectable({
  providedIn: "root",
})
export class ShippingService {
  shippings: AngularFireList<Billing>;
  shipping: AngularFireObject<Billing>;
  constructor(private db: AngularFireDatabase) {
    this.getshippings();
  }

  createshippings(data: Billing) {
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
