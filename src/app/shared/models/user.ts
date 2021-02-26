export class User {
  $key?: string;
  userName?: string;
  emailId?: string;
  password?: string;
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
  state?: string;
  roles?: Roles;
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
  state: string;
  zip: number;
}
