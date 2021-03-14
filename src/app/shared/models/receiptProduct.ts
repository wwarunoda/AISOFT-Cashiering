import { Brand } from "./brand";
import { FileExt } from "./file.ext";

export interface ReceiptProduct {
  $key?: string;
  productKey?: string;
  productName?: string;
  sizeKey?: string;
  sizeName?: string;
  productBrandKey?: string;
  productBrand?: Brand;
  productQuantity?: number;
  productPrice?: number;
  productColour?: string;
  imageList?: FileExt[];
}
