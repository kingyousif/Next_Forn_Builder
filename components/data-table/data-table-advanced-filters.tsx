"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  CalendarIcon,
  MoreVertical,
  Trash,
  Plus,
  GripVertical,
} from "lucide-react";
import { ReactSortable } from "react-sortablejs";

interface DataTableAdvancedFiltersProps {
  advancedFilters: any[];
  setAdvancedFilters: (filters: any[]) => void;
  inPopover?: boolean;
  enableDragDrop?: boolean;
}

// Define field types for different filter operations
const FIELD_TYPES = {
  id: "number",
  title: "text",
  status: "text",
  priority: "text",
  type: "text",
  createdAt: "date",
  assignee: "text",
};

// Define operators by field type
const OPERATORS_BY_TYPE = {
  text: [
    { label: "Is", value: "is" },
    { label: "Is not", value: "isNot" },
    { label: "Contains", value: "contains" },
    { label: "Does not contain", value: "notContains" },
    { label: "Equal", value: "equal" },
    { label: "Not equal", value: "notEqual" },
    { label: "Is empty", value: "isNull" },
    { label: "Is not empty", value: "isNotNull" },
  ],
  number: [
    { label: "Is", value: "is" },
    { label: "Is not", value: "isNot" },
    { label: "Equal", value: "equal" },
    { label: "Not equal", value: "notEqual" },
    { label: "Greater than", value: "greaterThan" },
    { label: "Smaller than", value: "smallerThan" },
    { label: "Equal or greater than", value: "equalOrGreaterThan" },
    { label: "Equal or smaller than", value: "equalOrSmallerThan" },
  ],
  date: [
    { label: "Is", value: "is" },
    { label: "Is not", value: "isNot" },
    { label: "Is before", value: "isBefore" },
    { label: "Is after", value: "isAfter" },
    { label: "Is on or before", value: "isOnOrBefore" },
    { label: "Is on or after", value: "isOnOrAfter" },
    { label: "Is between", value: "isBetween" },
    { label: "Is not between", value: "isNotBetween" },
  ],
};

const FIELDS = [
  { label: "ID", value: "id", type: "number" },
  { label: "Title", value: "title", type: "text" },
  { label: "Status", value: "status", type: "text" },
  { label: "Priority", value: "priority", type: "text" },
  { label: "Type", value: "type", type: "text" },
  { label: "Created at", value: "createdAt", type: "date" },
  { label: "Assignee", value: "assignee", type: "text" },
];

const STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in-progress" },
  { label: "Closed", value: "closed" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const TYPE_OPTIONS = [
  { label: "Bug", value: "bug" },
  { label: "Feature", value: "feature" },
  { label: "Enhancement", value: "enhancement" },
];

export function DataTableAdvancedFilters({
  advancedFilters,
  setAdvancedFilters,
  inPopover = false,
  enableDragDrop = false,
}: DataTableAdvancedFiltersProps) {
  const addFilter = () => {
    setAdvancedFilters([
      ...advancedFilters,
      { field: "status", operator: "is", value: "", value2: "" },
    ]);
  };

  const updateFilter = (index: number, key: string, value: any) => {
    const newFilters = [...advancedFilters];

    // If changing the field, reset the operator to an appropriate one for the field type
    if (key === "field") {
      const fieldType = FIELDS.find((f) => f.value === value)?.type || "text";
      newFilters[index] = {
        ...newFilters[index],
        [key]: value,
        operator:
          OPERATORS_BY_TYPE[fieldType as keyof typeof OPERATORS_BY_TYPE][0]
            .value,
        value: "",
        value2: "",
      };
    } else {
      newFilters[index] = { ...newFilters[index], [key]: value };
    }

    setAdvancedFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    const newFilters = [...advancedFilters];
    newFilters.splice(index, 1);
    setAdvancedFilters(newFilters);
  };

  const resetFilters = () => {
    setAdvancedFilters([]);
  };

  const getOperatorsForField = (fieldName: string) => {
    const field = FIELDS.find((f) => f.value === fieldName);
    if (!field) return OPERATORS_BY_TYPE.text;

    return OPERATORS_BY_TYPE[field.type as keyof typeof OPERATORS_BY_TYPE];
  };

  const needsSecondValue = (operator: string) => {
    return operator === "isBetween" || operator === "isNotBetween";
  };

  const getValueInput = (filter: any, index: number) => {
    // For empty/not empty operators, no value input is needed
    if (filter.operator === "isNull" || filter.operator === "isNotNull") {
      return null;
    }

    // Get field type
    const fieldType =
      FIELDS.find((f) => f.value === filter.field)?.type || "text";

    switch (fieldType) {
      case "text":
        if (filter.field === "status") {
          return (
            <Select
              value={filter.value}
              onValueChange={(value) => updateFilter(index, "value", value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else if (filter.field === "priority") {
          return (
            <Select
              value={filter.value}
              onValueChange={(value) => updateFilter(index, "value", value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select options..." />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else if (filter.field === "type") {
          return (
            <Select
              value={filter.value}
              onValueChange={(value) => updateFilter(index, "value", value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select options..." />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else {
          return (
            <Input
              value={filter.value || ""}
              onChange={(e) => updateFilter(index, "value", e.target.value)}
              className="w-[200px]"
              placeholder="Enter value..."
            />
          );
        }

      case "number":
        return (
          <Input
            type="number"
            value={filter.value || ""}
            onChange={(e) => updateFilter(index, "value", e.target.value)}
            className="w-[200px]"
            placeholder="Enter number..."
          />
        );

      case "date":
        return (
          <div className="flex flex-col gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filter.value
                    ? format(new Date(filter.value), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filter.value ? new Date(filter.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      updateFilter(index, "value", date.toISOString());
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {needsSecondValue(filter.operator) && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.value2
                      ? format(new Date(filter.value2), "PPP")
                      : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      filter.value2 ? new Date(filter.value2) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        updateFilter(index, "value2", date.toISOString());
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        );

      default:
        return (
          <Input
            value={filter.value || ""}
            onChange={(e) => updateFilter(index, "value", e.target.value)}
            className="w-[200px]"
            placeholder="Enter value..."
          />
        );
    }
  };

  const renderFilters = () => {
    if (advancedFilters.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No filters applied. Add a filter to narrow down results.
        </div>
      );
    }

    if (enableDragDrop) {
      return (
        <ReactSortable
          list={advancedFilters}
          setList={(newState) => {
            // Update your state here with the new order
            // You'll need to implement this function to update your state
            setAdvancedFilters(newState);
          }}
          className="space-y-4"
          animation={150}
          handle=".handle" // This targets the grip handle
        >
          {advancedFilters.map((filter, index) => (
            <div
              key={`filter-${index}`}
              className="flex items-center gap-2 flex-wrap p-2 border rounded-md bg-muted/20"
            >
              <div className="handle cursor-grab">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              {index > 0 && (
                <Select value="and" onValueChange={() => {}}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="and" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="and">and</SelectItem>
                    <SelectItem value="or">or</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {index === 0 && <div className="w-[80px]">Where</div>}
              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(index, "field", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filter.operator}
                onValueChange={(value) =>
                  updateFilter(index, "operator", value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorsForField(filter.field).map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getValueInput(filter, index)}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ReactSortable>
      );
    } else {
      return (
        <div className="space-y-4">
          {advancedFilters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2 flex-wrap">
              {index > 0 && (
                <Select value="and" onValueChange={() => {}}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="and" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="and">and</SelectItem>
                    <SelectItem value="or">or</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {index === 0 && <div className="w-[80px]">Where</div>}

              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(index, "field", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(value) =>
                  updateFilter(index, "operator", value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorsForField(filter.field).map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {getValueInput(filter, index)}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className={inPopover ? "" : "rounded-md border p-4"}>
      {!inPopover && (
        <div className="mb-4 flex items-center">
          <h3 className="text-lg font-medium">Filters</h3>
          <div className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium">
            {advancedFilters.length}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {renderFilters()}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addFilter}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add filter
          </Button>
          {advancedFilters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <Trash className="h-4 w-4" />
              Reset filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
