import { TranslateService } from "./../../../../shared/services/translate.service";
import { Component, OnDestroy, OnInit, VERSION } from "@angular/core";
import { Router } from "@angular/router";

import { Gender } from "../../../../shared/models";
import {
  TranslateService,
  ThemeService,
  ToastService,
  ProductService,
  AuthService,
} from "./../../../../shared/services";
import { ThemeService } from "src/app/shared/services/theme.service";
import { NavBarService } from "src/app/shared/services/nav-bar.service";
import { NavBar } from "src/app/shared/models/navbar";
import { ToastService } from "src/app/shared/services/toast.service";
import { SubSink } from "subsink";
declare var $: any;
declare var toast: any;

declare var $: any;
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  angularVersion = VERSION;

  navItems: NavBar[];
  activeNavItems: NavBar[];
  isAdmin: boolean;

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

  private subSink = new SubSink();

  constructor(
    public authService: AuthService,
    private router: Router,
    public productService: ProductService,
    public translate: TranslateService,
    private themeService: ThemeService,
    private navBarService: NavBarService,
    private toastService: ToastService
  ) {
    console.log(translate.data);
  }

  ngOnInit() {
    this.getMasterData();
    this.checkPrivileges();
    this.getNavBarList();
    // this.addNavBarList();
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
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
        this.genderList.sort((a, b) => (a.index > b.index ? 1 : -1));
      },
      (err) => {
        this.toastService.error("Error while fetching Genders", err);
      }
    );
  }

  private checkPrivileges(): void {
    this.subSink.sink = this.authService.isAdmin$.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
      this.activeNavItems = this.navItems.filter(
        (navItem) => navItem.isAdmin === this.isAdmin
      );
    });
  }

  private getNavBarList() {
    this.subSink.sink = this.navBarService
      .getNavBarItems()
      .valueChanges()
      .subscribe((navItems) => {
        this.navItems = navItems;

        this.activeNavItems = this.navItems.filter(
          (navItem) => navItem.isAdmin === this.isAdmin
        );
      });
  }

  private addNavBarList() {
    const navBarItem: NavBar = {
      isAdmin: false,
      description: "Our Products",
      routerLink: "/products/all-products",
    };
    this.navBarService.createNavBarItem(navBarItem, () => {
      $("#exampleModalLong").modal("hide");
      this.toastService.success(
        "navItem " + navBarItem.description + "is added successfully",
        "Nav Item Creation"
      );
    });
  }
}
