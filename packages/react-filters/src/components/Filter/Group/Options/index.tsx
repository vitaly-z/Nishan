import React, { useContext } from "react";

import { NotionFilterContext } from "../../../../NotionFilter";
import { FilterGroupProps } from "../../../../types";
import BasicMenu from "../../../Shared/BasicMenu";
import Svgicon from "../../../Shared/Svgicon";


export default function FilterGroupOptions({ parent_filter, trails, filter }: FilterGroupProps) {
  const { filters, setFilters, nestingLevel, default_group_operator } = useContext(NotionFilterContext)
  const last_trail = trails[trails.length - 1];
  return <div className="NotionFilter-Group-Options" style={{ display: "flex", alignItems: "center" }}>
    <BasicMenu label={<Svgicon icon="ellipsis" />} items={[
      {
        label: "Remove",
        icon: <Svgicon icon="remove" />,
        onClick() {
          filter.filters = []
          setFilters({ ...filters })
        }
      },
      {
        label: "Duplicate",
        icon: <Svgicon icon="duplicate" />,
        onClick() {
          if (parent_filter) {
            parent_filter.filters.push(JSON.parse(JSON.stringify(filter)));
            setFilters({ ...filters })
          }
        }
      },
      filter.filters.length === 1 ? {
        label: "Turn into filter",
        icon: <Svgicon icon="turn_into" />,
        onClick() {
          if (parent_filter) {
            parent_filter.filters[last_trail] = filter.filters[0]
            setFilters({ ...filters })
          }
        }
      } : null,
      nestingLevel > trails.length + 1 ? {
        label: "Wrap in group",
        icon: <Svgicon icon="turn_into" />,
        onClick() {
          if (parent_filter) {
            parent_filter.filters[last_trail] = {
              operator: default_group_operator,
              filters: [filter]
            }
            setFilters({ ...filters })
          }
        },
        description: "Create a filter group around this"
      } : null
    ]} />
  </div>
}