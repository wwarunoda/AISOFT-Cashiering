import { AddressState } from './addressState';
export class Billing {
  $key?: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  emailId?: string;
  phoneNumber?: string;
  unitNumber?: string;
  street?: string;
  country?: string;
  surburb?: string;
  state?: AddressState;
  createdDate?: string;
  userKey?: string;
}
