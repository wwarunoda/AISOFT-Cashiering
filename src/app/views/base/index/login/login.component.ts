import { NgForm, EmailValidator } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserService, ShippingService, AuthService, ToastService } from "../../../../shared/services";
import { User, AddressState } from "../../../../shared/models";
declare var $: any;
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  providers: [EmailValidator],
})
export class LoginComponent implements OnInit {
  user = {
    emailId: "",
    loginPassword: "",
  };
  addressState: AddressState[];
  errorInUserCreate = false;
  errorMessage: any;
  createUser: User;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private shippingService: ShippingService
  ) {
    this.createUser = new User();
  }

  ngOnInit() {
    this.getMasterData();
  }

  private getMasterData() {
    const states = this.shippingService.getStates();
    states.snapshotChanges().subscribe(
      (state) => {
        this.addressState = [];
        state.forEach((element) => {
          const y = { ...element.payload.toJSON(), $key: element.key };
          this.addressState.push(y as AddressState);
        });
      });
  }

  addUser(userForm: NgForm) {
    if (userForm.value["password"] === userForm.value["conPassword"]) {
    userForm.value["isAdmin"] = false;
    this.authService
      .createUserWithEmailAndPassword(
        userForm.value["emailId"],
        userForm.value["password"]
      )
      .then((res) => {
        const user = {
          email: res.user.email,
          famil_name: this.createUser.firstName,
          uid: res.user.uid,
          verified_email: res.user.emailVerified,
          phoneNumber: this.createUser.phoneNumber,
          picture: res.user.photoURL,
          firstName: this.createUser.firstName,
          lastName: this.createUser.lastName,
          unitNumber: this.createUser.unitNumber,
          street: this.createUser.street,
          surburb: this.createUser.surburb,
          state: this.createUser.state
        };

        this.userService.createUser(user);

        this.toastService.success("Registering", "User Registeration");

        setTimeout((router: Router) => {
          $("#createUserForm").modal("hide");
          this.router.navigate(["/"]);
        }, 1500);
      })
      .catch((err) => {
        this.errorInUserCreate = true;
        this.errorMessage = err;
        this.toastService.error("Error while Creating User", err);
      });
    } else {
      this.toastService.error("Password Mismatch", "Confirm Password Mismatch");
    }
  }

  signInWithEmail(userForm: NgForm) {
    this.authService
      .signInRegular(userForm.value["emailId"], userForm.value["loginPassword"])
      .then((res) => {
        this.toastService.success(
          "Authentication Success",
          "Logging in please wait"
        );

        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");

        setTimeout((router: Router) => {
          this.router.navigate([returnUrl || "/"]);
        }, 1500);

        this.router.navigate(["/"]);
      })
      .catch((err) => {
        this.toastService.error(
          "Authentication Failed",
          "Invalid Credentials, Please Check your credentials"
        );
      });
  }

  signInWithGoogle() {
    this.authService
      .signInWithGoogle()
      .then((res) => {
        if (res.additionalUserInfo.isNewUser) {
          this.userService.createUser(res.additionalUserInfo.profile);
        }
        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
        location.reload();
        this.router.navigate(["/"]);
      })
      .catch((err) => {
        this.toastService.error("Error Occured", "Please try again later");
      });
  }
}
