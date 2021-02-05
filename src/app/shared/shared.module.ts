import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NoProductsFoundComponent } from "./components/no-products-found/no-products-found.component";
import { MDBBootstrapModule } from "angular-bootstrap-md";
import { AngularFireModule } from "@angular/fire";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { FormsModule, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { OwlModule } from "ngx-owl-carousel";
import { NgxPaginationModule } from "ngx-pagination";
import { HttpClientModule } from "@angular/common/http";
import { NoAccessComponent } from "./components/no-access/no-access.component";
import { PageNotFoundComponent } from "./components/page-not-found/page-not-found.component";
import { FilterByBrandPipe } from "./pipes/filterByBrand.pipe";
import { FilterByCategoryPipe } from "./pipes/filterByCategory.pipe";
import { ProductService } from "./services/product.service";
import { AdminGaurd } from "./guards/admin-gaurd";
import { AuthGuard } from "./guards/auth_gaurd";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { TranslatePipe } from "./pipes/translate.pipe";
import { NgxContentLoadingModule } from "ngx-content-loading";
import { CardLoaderComponent } from "./components/card-loader/card-loader.component";
import { MomentTimeAgoPipe } from "./pipes/moment-time-ago.pipe";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CdkTableModule } from "@angular/cdk/table";
import { CdkTreeModule } from "@angular/cdk/tree";
import { FireBaseConfig } from "./../../environments/firebase.config";
import { FileService } from "./services/file.service";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { NavBarService } from "./services/nav-bar.service";
import { GetBrandByBrandKeyPipe } from "./pipes/getBrandByBrandKey.pipe";
import { GetCategoryByCategoryKeyPipe } from "./pipes/getCategoryByCategoryKey.pipe";
import { NgxDropzoneModule } from "ngx-dropzone";

@NgModule({
  imports: [
    CommonModule,
    MDBBootstrapModule.forRoot(),
    AngularFireModule.initializeApp(FireBaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    OwlModule,
    NgxPaginationModule,
    NgxContentLoadingModule,
    AngularFirestoreModule,
    NgxDropzoneModule,
  ],
  declarations: [
    NoProductsFoundComponent,
    FilterByBrandPipe,
    FilterByCategoryPipe,
    GetBrandByBrandKeyPipe,
    GetCategoryByCategoryKeyPipe,
    NoAccessComponent,
    PageNotFoundComponent,
    TranslatePipe,
    CardLoaderComponent,
    MomentTimeAgoPipe,
  ],
  exports: [
    NoProductsFoundComponent,
    FormsModule,
    MDBBootstrapModule,
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    OwlModule,
    NgxPaginationModule,
    FilterByBrandPipe,
    FilterByCategoryPipe,
    GetBrandByBrandKeyPipe,
    GetCategoryByCategoryKeyPipe,
    NoAccessComponent,
    PageNotFoundComponent,
    TranslatePipe,
    MomentTimeAgoPipe,
    NgxContentLoadingModule,
    CardLoaderComponent,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    ScrollingModule,
    NgxDropzoneModule,
  ],
  providers: [
    AuthService,
    FileService,
    AuthGuard,
    AdminGaurd,
    ProductService,
    NavBarService,
    UserService,
    FormBuilder,
  ],
})
export class SharedModule {}
