import { Component, OnInit, VERSION } from "@angular/core";
import { Router } from "@angular/router";

import { Gender } from '../../../../shared/models';
import { TranslateService, ThemeService, ToastService, ProductService, AuthService } from "./../../../../shared/services";

declare var $: any;
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  angularVersion = VERSION;
  genderList: Gender[];
  colorPallet1 = [
    {
      title: "Purple Theme",
      color: "color-purple",
      id: "purple-theme",
    },
    {
      title: "Blue Theme",
      color: "color-blue",
      id: "blue-theme",
    },
  ];

  colorPallet2 = [
    {
      title: "Red Theme",
      color: "color-red",
      id: "red-theme",
    },
    {
      title: "Violet Theme",
      color: "color-violet",
      id: "violet-theme",
    },
  ];
  languageList = [
    { language: "English", langCode: "en" },
    { language: "French", langCode: "fr" },
    { language: "Persian", langCode: "fa" },
    { language: "Japanese", langCode: "ja" },
    { language: "Hindi", langCode: "hin" },
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    public productService: ProductService,
    public translate: TranslateService,
    private themeService: ThemeService,
    private toastService: ToastService
  ) {
    console.log(translate.data);
  }

  ngOnInit() {
    this.getMasterData();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  setLang(lang: string) {
    // console.log("Language", lang);
    this.translate.use(lang).then(() => {});
  }

  updateTheme(theme: string) {
    this.themeService.updateThemeUrl(theme);
  }

  private getMasterData(): void {
    const allGenders = this.productService.getGenders();
    allGenders.snapshotChanges().subscribe(
      (product) => {
        this.genderList = [];
        product.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.genderList.push(y as Gender);
        });
        this.genderList.sort((a,b) => a.index > b.index? 1 : -1);
      },
      (err) => {
        this.toastService.error("Error while fetching Genders", err);
      }
    );
  }
}
