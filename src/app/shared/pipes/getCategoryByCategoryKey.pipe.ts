import { ProductService } from '../services';
import { Pipe, PipeTransform } from "@angular/core";
import { first } from 'rxjs/operators';
import { Category } from '../models';

@Pipe({
  name: "getCategoryByCategoryKey",
})
export class GetCategoryByCategoryKeyPipe implements PipeTransform {
  constructor(private productService: ProductService) {}
  async transform(categoryKey: string): Promise<string> {
    if (categoryKey != null) {
      const categoryData = await this.productService.getCategoryById(categoryKey).snapshotChanges().pipe(first()).toPromise();
      const category = categoryData.payload.toJSON() as Category;
      return category.name;
    } else {
      return categoryKey;
    }
  }
}
