import { Brand } from "./brand";
import { FileExt } from "./file.ext";

export interface ReceiptProduct {
  $key?: string;
  productKey?: string;
  productName?: string;
  sizeData?: string;
  sizeName?: string;
  productBrandKey?: string;
  productBrand?: Brand;
  productQuantity?: number;
  productPrice?: number;
  productColour?: string;
  productColourCode?: string;
  imageList?: FileExt[];
}
