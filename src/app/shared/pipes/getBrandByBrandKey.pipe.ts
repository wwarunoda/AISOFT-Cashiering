import { ProductService } from '../services/';
import { Pipe, PipeTransform } from "@angular/core";
import { first } from 'rxjs/operators';
import { Brand } from '../models';

@Pipe({
  name: "getBrandByBrandKey",
})
export class GetBrandByBrandKeyPipe implements PipeTransform {
  constructor(private productService: ProductService) {}
  async transform(brandKey: string): Promise<string> {
    if (brandKey != null) {
      const brandData = await this.productService.getBrandById(brandKey).snapshotChanges().pipe(first()).toPromise();
      const brand = brandData.payload.toJSON() as Brand;
      return brand.name;
    } else {
      return brandKey;
    }
  }
}
