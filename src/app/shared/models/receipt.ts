import { Billing, User, ReceiptProduct } from "./.";
export class Receipt {
  $key?: string;
  receiptProducts?: ReceiptProduct[];
  shippingDetails?: Billing;
  user?: User;
  userKey?: string;
}
