import { ShippingService } from "../../../../../shared/services/";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-checkout-navbar",
  templateUrl: "./checkout-navbar.component.html",
  styleUrls: ["./checkout-navbar.component.scss"],
})
export class CheckoutNavbarComponent implements OnInit {
  constructor(private shippingService: ShippingService) {}

  ngOnInit() {}
}
