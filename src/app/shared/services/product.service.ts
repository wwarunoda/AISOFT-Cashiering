import { Injectable } from "@angular/core";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from "@angular/fire/database";
import { AuthService } from "./auth.service";
import { ToastService } from "./toast.service";
import {
  FavouriteProductsEnum,
  ProductsEnum,
  BrandEnum,
  GenderEnum,
  CategoriesEnum,
  SizeEnum,
  SizeTypeEnum,
  MaterialEnum,
} from "../enum";
import {
  FavouriteProduct,
  Product,
  Brand,
  Gender,
  Category,
  Size,
  SizeType,
  Material,
  Receipt,
  ReceiptProduct,
} from "../models";
import { firestore } from "firebase/app";
@Injectable()
export class ProductService {
  products: AngularFireList<Product>;
  product: AngularFireObject<Product>;
  brands: AngularFireList<any>;
  genders: AngularFireList<Gender>;
  categories: AngularFireList<Category>;
  sizes: AngularFireList<Size>;
  sizeTypes: AngularFireList<SizeType>;
  material: AngularFireList<Material>;
  // favouriteProducts
  favouriteProducts: AngularFireList<FavouriteProduct>;
  cartProducts: AngularFireList<FavouriteProduct>;
  currentDate: Date;
  currentUserId: string;
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    authService.user.subscribe((user) => {
      if (user) {
      this.currentUserId = user.email;
      }
    });
  }

  //#region old services

  getProducts() {
    this.products = this.db.list(ProductsEnum.TableName);
    return this.products;
  }

  createProduct(data: Product, callback: () => void) {
    this.products.push(data);
    callback();
  }

  addProduct(data: Product, callback: (key: string) => void) {
    data.createdDate = data.lastUpdatedDate = firestore.Timestamp.now()
      .toDate()
      .toLocaleString();
    data.createdUser = this.currentUserId;
    const pushedItem = this.products.push(data);
    callback(pushedItem.key);
  }

  getProductById(key: string) {
    this.product = this.db.object(ProductsEnum.TableName + "/" + key);
    return this.product;
  }

  updateProduct(key: string, data: Product, callback: () => void) {
    this.products.update(key, data);
    callback();
  }

  deleteProduct(key: string) {
    this.products.remove(key);
  }

  /*
   ----------  Favourite Product Function  ----------
  */

  // Get Favourite Product based on userId
  async getUsersFavouriteProduct() {
    const user = await this.authService.user$.toPromise();
    this.favouriteProducts = this.db.list(
      FavouriteProductsEnum.TableName,
      (ref) => ref.orderByChild(FavouriteProductsEnum.userId).equalTo(user.$key)
    );
    return this.favouriteProducts;
  }

  // Adding New product to favourite if logged else to localStorage
  addFavouriteProduct(data: Product): void {
    const a: Product[] = JSON.parse(localStorage.getItem("avf_item")) || [];
    a.push(data);
    this.toastService.wait("Adding Product", "Adding Product as Favourite");
    setTimeout(() => {
      localStorage.setItem("avf_item", JSON.stringify(a));
    }, 1500);
  }

  // Fetching unsigned users favourite proucts
  getLocalFavouriteProducts(): Product[] {
    const products: Product[] =
      JSON.parse(localStorage.getItem("avf_item")) || [];

    return products;
  }

  // Removing Favourite Product from Database
  removeFavourite(key: string) {
    this.favouriteProducts.remove(key);
  }

  // Removing Favourite Product from localStorage
  removeLocalFavourite(product: Product) {
    const products: Product[] = JSON.parse(localStorage.getItem("avf_item"));

    for (let i = 0; i < products.length; i++) {
      if (products[i].productId === product.productId) {
        products.splice(i, 1);
        break;
      }
    }
    // ReAdding the products after remove
    localStorage.setItem("avf_item", JSON.stringify(products));
  }

  /*
   ----------  Cart Product Function  ----------
  */

  // Adding new Product to cart db if logged in else localStorage
  addToCart(data: Product, receipt: ReceiptProduct): void {
    const a: Product[] = JSON.parse(localStorage.getItem("avct_item")) || [];
    const b: ReceiptProduct[] =
      JSON.parse(localStorage.getItem("avct_receiptProduct")) || [];
    if (data) {
      a.push(data);
    }
    if (receipt) {
      b.push(receipt);
    }

    this.toastService.wait(
      "Adding Product to Cart",
      "Product Adding to the cart"
    );
    setTimeout(() => {
      localStorage.setItem("avct_item", JSON.stringify(a));
      localStorage.setItem("avct_receiptProduct", JSON.stringify(b));
    }, 500);
  }

  // Removing cart from local
  removeLocalCartProduct(product: Product) {
    let products: Product[] = JSON.parse(localStorage.getItem("avct_item"));
    let receiptProducts: ReceiptProduct[] = JSON.parse(
      localStorage.getItem("avct_receiptProduct")
    );

    // for (let i = 0; i < products.length; i++) {
    //   if (products[i].$key === product.$key) {
    //     products.splice(i, 1);
    //     break;
    //   }
    // }

    // for (let i = 0; i < receiptProducts.length; i++) {
    //   if (receiptProducts[i].productKey === product.$key) {
    //     receiptProducts.splice(i, 1);
    //     break;
    //   }
    // }

    if (products && products.length) {
      products = products.filter(
        (innerProduct) => innerProduct.$key !== product.$key
      );
    }

    if (receiptProducts && receiptProducts.length) {
      receiptProducts = receiptProducts.filter(
        (innerProduct) => innerProduct.productKey !== product.$key
      );
    }

    // ReAdding the products after remove
    localStorage.setItem("avct_item", JSON.stringify(products));
    localStorage.setItem(
      "avct_receiptProduct",
      JSON.stringify(receiptProducts)
    );
  }

  removeLocalAllProducts() {
    localStorage.removeItem("avct_item");
    localStorage.removeItem("avct_receiptProduct");
  }

  // Fetching Locat CartsProducts
  getLocalCartProducts(): Product[] {
    const products: Product[] =
      JSON.parse(localStorage.getItem("avct_item")) || [];

    return products;
  }

  getLocalCartReceipt(): ReceiptProduct[] {
    const receipts: ReceiptProduct[] =
      JSON.parse(localStorage.getItem("avct_receiptProduct")) || [];

    return receipts;
  }
  //#endregion

  //#region brand services
  getBrands() {
    this.brands = this.db.list(BrandEnum.TableName);
    return this.brands;
  }

  getBrandById(key: string) {
    return this.db.object(BrandEnum.TableName + "/" + key);
  }

  createBrand(data: Brand, callback: () => void) {
    this.brands = this.getBrands();
    this.brands.push({
      id: data.id,
      name: data.name,
      description: data.description,
    });
    callback();
  }

  updateBrand(data: Brand) {
    this.brands.update(data.$key, data);
  }

  deleteBrand(key: string) {
    this.brands.remove(key);
  }
  //#endregion

  //#region Gender
  getGenders(): AngularFireList<Gender> {
    this.genders = this.db.list(GenderEnum.TableName);
    return this.genders;
  }

  getGenderById(key: string) {
    return this.db.object(GenderEnum.TableName + "/" + key);
  }
  //#endregion

  //#region Categories
  getCategories() {
    this.categories = this.db.list(CategoriesEnum.TableName);
    return this.categories;
  }

  createCategory(data: Category, callback: () => void) {
    this.categories.push(data);
    callback();
  }

  getCategoryById(key: string) {
    return this.db.object(CategoriesEnum.TableName + "/" + key);
  }

  updateCategory(data: Category) {
    this.categories.update(data.$key, data);
  }

  deleteCategory(key: string) {
    this.categories.remove(key);
  }
  //#endregion

  //#region size
  getSizes() {
    this.sizes = this.db.list(SizeEnum.TableName);
    return this.sizes;
  }

  getSizeTypes() {
    this.sizeTypes = this.db.list(SizeTypeEnum.TableName);
    return this.sizeTypes;
  }
  //#endregion

  //#region material
  getMaterial() {
    this.material = this.db.list(MaterialEnum.TableName);
    return this.material;
  }
}
