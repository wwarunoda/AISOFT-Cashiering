import { AddressState } from './addressState';
export class User {
  $key?: string;
  userName?: string;
  emailId?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  createdOn?: string;
  isAdmin?: boolean;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  unitNumber?: string;
  street?: string;
  country?: string;
  surburb?: string;
  state?: AddressState;
  roles?: Roles;
  location?: {
    lat: number;
    lon: number;
  };
}

export interface Roles {
  subscriber?: boolean;
  editor?: boolean;
  admin?: boolean;
}

export class UserDetail {
  $key: string;
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber?: string;
  emailId: string;
  address1: string;
  address2: string;
  country: string;
  state: AddressState;
  zip: number;
}

export interface CustomUser {
  $key: string;
  uid: string;
}
