import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { FileExt } from "../../models";

@Component({
  selector: "app-image-slide-show",
  templateUrl: "./image-slide-show.component.html",
  styleUrls: ["./image-slide-show.component.scss"],
})
export class ImageSlideShowComponent implements OnChanges, OnInit {
  @Input() imageList: FileExt[];
  constructor() {}

  ngOnChanges() {
    console.log(this.imageList);
  }

  ngOnInit() {}
}
