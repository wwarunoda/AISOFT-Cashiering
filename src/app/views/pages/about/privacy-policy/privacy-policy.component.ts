import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-privacy-policy",
  templateUrl: "./privacy-policy.component.html",
  styleUrls: ["./privacy-policy.component.scss"],
})
export class PrivacyPolicyComponent implements OnInit {
  config: any;
  collection = { count: 5, data: [] };
  constructor() {}

  ngOnInit() {
  for (let i = 1; i <= 5; i++) {
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
