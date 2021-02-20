import { CheckoutComponent } from "./checkout.component";
import { ResultComponent } from "./result/result.component";
import { ShippingDetailsComponent } from "./shipping-details/shipping-details.component";
import { BillingDetailsComponent } from "./billing-details/billing-details.component";
import { ProductsComponent } from "./products/products.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PaymentDetailsComponent } from "./payment-success/payment-details.component";

export const checkoutRoutes: Routes = [
  {
    path: "checkouts",
    component: CheckoutComponent,
    children: [
      {
        path: "",
        component: ProductsComponent,
        outlet: "checkOutlet",
      },
      {
        path: "shipping-details",
        component: ShippingDetailsComponent,
        outlet: "checkOutlet",
      },
      {
        path: "billing-details",
        component: BillingDetailsComponent,
        outlet: "checkOutlet",
      },
      {
        path: "result",
        component: ResultComponent,
        outlet: "checkOutlet",
      },
    ],
  },
  {
    path: "success",
    component: PaymentDetailsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(checkoutRoutes)],
  exports: [RouterModule],
})
export class CheckoutRoutingModule {}
