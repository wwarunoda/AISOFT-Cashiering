import { Billing } from './billing';
import { ReceiptProduct } from "./receiptProduct";
export class Receipt {
  $key?: string;
  products?: ReceiptProduct[];
  shippingDetails?: Billing;
}
