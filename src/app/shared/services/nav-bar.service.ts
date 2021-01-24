import { Injectable } from "@angular/core";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from "@angular/fire/database";
import { NavBar } from "../models/navbar";
import { AuthService } from "./auth.service";
import { ToastService } from "./toast.service";

@Injectable()
export class NavBarService {
  navBarList: AngularFireList<NavBar>;
  navBarItem: AngularFireObject<NavBar>;

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  getNavBarItems() {
    this.navBarList = this.db.list("navigation");
    return this.navBarList;
  }

  createNavBarItem(data: NavBar, callback: () => void) {
    this.navBarList.push(data);
    callback();
  }

  getNavBarItemById(key: string) {
    this.navBarItem = this.db.object("navigation/" + key);
    return this.navBarList;
  }

  updateProduct(data: NavBar) {
    this.navBarList.update(data.$key, data);
  }

  deleteProduct(key: string) {
    this.navBarList.remove(key);
  }
}
