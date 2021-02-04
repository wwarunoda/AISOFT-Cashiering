import { Size, Colour, Brand } from "./";
export class Product {
  $key?: string;
  productId?: string;
  productName?: string;
  productCategoryId?: number;
  productCategory?: string;
  productDescription?: string;
  genderKey?: string;
  gender?: string;
  productPrice?: number;
  productImageUrl?: string;
  productAdded?: number;
  productQuatity?: number;
  ratings?: number;
  favourite?: boolean;
  productSeller?: string;
  material?: string;
  materialComposition?: string;
  liningMaterial?: string;
  colour?: Colour[];
  sizeType?: number;
  size?: Size;
  modelDetails?: string;
  isProductAvailable?: boolean;
  productBrand?: string;
}
