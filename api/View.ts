import Data from "./Data";
import { NishanArg, TView, ViewAggregations, ViewFormatProperties } from "../types/types";
import { error } from '../utils/logs';

/**
 * A class to represent view of Notion
 * @noInheritDoc
 */
class View extends Data<TView> {
  constructor(arg: NishanArg<TView>) {
    super(arg);
  }

  /**
   * Update the current view
   * @param options Options to update the view
   */
  // ? TD:1:M Convert the parameter as an interface
  async update(options: { sorts?: [string, 1 | -1][], filters?: [string, string, string, string][], properties?: ViewFormatProperties[], aggregations?: ViewAggregations[] } = {}) {
    if (this.data) {
      const { sorts = [], filters = [], properties = [], aggregations = [] } = options;
      const args: any = {};

      if (sorts && sorts.length !== 0) {
        if (!args.query2) args.query2 = {};
        args.query2.sort = sorts.map((sort) => ({
          property: sort[0],
          direction: sort[1] === -1 ? 'ascending' : 'descending'
        }));
      }

      if (aggregations && aggregations.length !== 0) {
        if (!args.query2) args.query2 = {};
        args.query2.aggregations = aggregations;
      }

      if (filters && filters.length !== 0) {
        if (!args.query2) args.query2 = {};
        args.query2.filter = {
          operator: 'and',
          filters: filters.map((filter) => ({
            property: filter[0],
            filter: {
              operator: filter[1],
              value: {
                type: filter[2],
                value: filter[3]
              }
            }
          }))
        };
      }

      if (properties && properties.length !== 0) {
        args.format = { [`${this.data.type}_wrap`]: true };
        args.format[`${this.data.type}_properties`] = properties;
      }

      // ? FIX:2:H Respect previous filters and sorts
      await this.saveTransactions([this.updateOp([], args)]);
    } else
      throw new Error(error("Data has been deleted"))
  }
}

export default View;
