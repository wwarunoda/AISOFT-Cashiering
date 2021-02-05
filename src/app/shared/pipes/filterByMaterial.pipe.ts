import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterByMaterial",
})
export class FilterByMaterialPipe implements PipeTransform {
  transform(items: any, select?: any): any {
    if (items != null && select != null && select.name !== "All") {
      return select
        ? items.filter(
            (item: { productMaterial: any }) => item.productMaterial === select.$key
          )
        : items;
    } else {
      return items;
    }
  }
}
