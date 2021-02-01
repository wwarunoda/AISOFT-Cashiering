export enum ClientsEnum {
  TableName = "clients",
  email = "email",
}

export enum BillingsEnum {
  TableName = "billings",
}

export enum ProductsEnum {
  TableName = "products",
}

export enum FavouriteProductsEnum {
  TableName = "favouriteProducts",
  userId = "userId",
}

export enum ShippingsProductsEnum {
  TableName = "shippings",
}

export enum BrandEnum {
  TableName = "brand",
  Id = "id",
  Name = "name",
  Description = "description",
}

export enum GenderEnum {
  TableName = "gender",
  Id = "id",
  Name = "name",
  Description = "description",
}

export enum CategoriesEnum {
  TableName = "categories",
  Id = "id",
  Name = "name",
  GenderKey = "genderKey",
  Description = "description",
  index = "index"
}

export enum SizeEnum {
  TableName = "size",
  Data = "data",
  IsActive = "isActive",
  Name = "name",
  SizeTypeKey = "sizeTypeKey"
}

export enum SizeTypeEnum {
  TableName = "sizeType",
  Description = "description",
  Name = "name"
}
