import { Injectable } from "@angular/core";
declare var toast: any;
@Injectable({
  providedIn: "root",
})
export class ToastService {
  constructor() {}

  success(title: any, msg: any) {
    toast.success(msg, title);
  }
  info(title: any, msg: any) {
    toast.info(msg, title);
  }
  warning(title: any, msg: any) {
    toast.warning(msg, title);
  }
  error(title: any, msg: any) {
    toast.error(msg, title);
  }

  wait(title: any, msg: any) {
    toast.info(msg, title, { timeOut: 3000 });
  }
}
