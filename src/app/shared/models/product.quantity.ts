import { Size } from ".";

export interface ProductQuantity {
  id?: string;
  productSize?: Size;
  productColor?: string;
  productColorDescription?: string;
  productQuantity?: number;
  isSelected?: boolean;
  isColorSelected?: boolean;
}
