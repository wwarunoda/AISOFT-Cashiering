import { Billing, User, ReceiptProduct } from "./.";
export class Receipt {
  $key?: string;
  receiptNumber?: string;
  receiptProducts?: ReceiptProduct[];
  totalAmount?: number;
  shippingDetails?: Billing;
  userKey?: string;
  userName?: string;
  userEmail?: string;
  userPhoneNumber?: string;
  status?: number;
  accessCode?: string;
}
