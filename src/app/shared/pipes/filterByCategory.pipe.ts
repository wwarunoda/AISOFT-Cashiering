import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterByCategory",
})
export class FilterByCategoryPipe implements PipeTransform {
  transform(items: any, select?: any): any {
    if (items != null && select != null && select.name !== "All Categories") {
      return select
        ? items.filter(
            (item: { productCategory: any }) => item.productCategory === select.$key
          )
        : items;
    } else {
      return items;
    }
  }
}
