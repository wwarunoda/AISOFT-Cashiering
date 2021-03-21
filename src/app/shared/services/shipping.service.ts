import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Billing, AddressState } from "./../models";
import { Injectable } from "@angular/core";
import { ShippingsProductsEnum, ProductsEnum, AddressStateEnum } from "../enum";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root",
})
export class ShippingService {
  shippings: AngularFireList<Billing>;
  addressStates: AngularFireList<AddressState>;
  shipping: AngularFireObject<Billing>;
  constructor(private db: AngularFireDatabase,
              private toastService: ToastService) {
    this.getShippings();
  }

  createShippings(data: Billing) {
    // First previous address
    this.removeLocalAddresses();

    const a: Billing[] = JSON.parse(localStorage.getItem("avct_shipping")) || [];
    if (data) {
      a.push(data);
    }
    setTimeout(() => {
      localStorage.setItem("avct_shipping", JSON.stringify(a));
    }, 500);
    // this.shippings.push(data);
  }

  getLocalShippings(): Billing[] {
    const shipping: Billing[] =
      JSON.parse(localStorage.getItem("avct_shipping")) || [];

    return shipping;
  }

  removeLocalAddresses() {
    localStorage.removeItem('avct_shipping');
  }

  getShippings() {
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

  getStates() {
    this.addressStates = this.db.list(AddressStateEnum.TableName);
    return this.addressStates;
  }
}
