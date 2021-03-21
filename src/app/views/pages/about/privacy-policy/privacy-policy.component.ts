import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-privacy-policy",
  templateUrl: "./privacy-policy.component.html",
  styleUrls: ["./privacy-policy.component.scss"],
})
export class PrivacyPolicyComponent implements OnInit {
  config: any;
  collection = { count: 4, data: [] };
  constructor() {}

  ngOnInit() {
  for (let i = 1; i <= 4; i++) {
    this.collection.data.push(
      i
    );
  }

  this.config = {
    itemsPerPage: 1,
    currentPage: 1,
    totalItems: this.collection.count
  };
  }

  pageChanged(event){
    this.config.currentPage = event;
  }
}
