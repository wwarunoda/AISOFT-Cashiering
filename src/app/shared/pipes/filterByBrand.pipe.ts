import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterByBrand",
})
export class FilterByBrandPipe implements PipeTransform {
  transform(items: any, select?: any): any {
    if (select != null && select.name !== "All") {
      return select
        ? items.filter(
            (item: { productBrand: any }) => item.productBrand === select.$key
          )
        : items;
    } else {
      return items;
    }
  }
}
