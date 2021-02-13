import { Component, Input, OnInit } from "@angular/core";
import { FileExt } from "../../models";

@Component({
  selector: "app-image-slide-show",
  templateUrl: "./image-slide-show.component.html",
  styleUrls: ["./image-slide-show.component.scss"],
})
export class ImageSlideShowComponent implements OnInit {
  @Input() imageList: FileExt[];
  constructor() {}

  ngOnInit() {}
}
