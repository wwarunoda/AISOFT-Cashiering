import { Component, OnInit } from "@angular/core";
import { FirebaseApp } from "@angular/fire";
import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { FileService } from "src/app/shared/services/file.service";

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"],
})
export class IndexComponent implements OnInit {
  carouselList = [
    {
      bannerImg: "./assets/banner_img/img_1.jpg",
      title: "Apple iPhone",
      description: "Explore iPhone, the world's most powerful personal device",
    },
    {
      bannerImg: "./assets/banner_img/img_3.jpg",
      title: "Never Settle - OnePlus",
      description:
        " OnePlus creates beautifully designed products with premium build quality & brings the best technology to users around the world",
    },
    {
      bannerImg: "./assets/banner_img/img_4.jpg",
      title: "Google Pixel",
      description: "Discover a better way to capture, store, and see the world",
    },
  ];

  file: any;
  images: any[] = [];

  constructor(private fileService: FileService, private storage: FirebaseApp) {}

  ngOnInit() {
    this.getSlideShowImages();
  }

  // get slide show all images
  private getSlideShowImages(): void {
    const fileList = this.storage.storage().ref().child("slideShow");

    fileList.listAll().then((res) => {
      res.items.forEach((item) => {
        const fileName = item.fullPath;
        this.fileService.getFileByName(fileName).then((url) => {
          this.images = [...this.images, url];
        });
      });
    });
  }
}
