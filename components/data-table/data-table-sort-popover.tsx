"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  X,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import { ReactSortable } from "react-sortablejs";
import type { Table, SortingState, ColumnSort } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableSortPopoverProps {
  table: Table<any>;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
}

export function DataTableSortPopover({
  table,
  sorting,
  setSorting,
}: DataTableSortPopoverProps) {
  const [open, setOpen] = useState(false);
  const hasSorting = sorting.length > 0;

  // Get all sortable columns
  const availableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanSort())
    .map((column) => ({
      id: column.id,
      label: column.header?.toString() || column.id,
    }));

  const addSort = () => {
    // Find first available column that's not already being sorted
    const usedColumnIds = new Set(sorting.map((sort) => sort.id));
    const availableColumnId = availableColumns.find(
      (col) => !usedColumnIds.has(col.id)
    )?.id;

    if (availableColumnId) {
      const newSort: ColumnSort = {
        id: availableColumnId,
        desc: false,
      };
      setSorting([...sorting, newSort]);
    }
  };

  const updateSort = (
    index: number,
    columnId: string | null,
    desc: boolean | null
  ) => {
    const newSorting = [...sorting];

    if (columnId !== null) {
      newSorting[index] = {
        ...newSorting[index],
        id: columnId,
      };
    }

    if (desc !== null) {
      newSorting[index] = {
        ...newSorting[index],
        desc,
      };
    }

    setSorting(newSorting);
  };

  const removeSort = (index: number) => {
    const newSorting = [...sorting];
    newSorting.splice(index, 1);
    setSorting(newSorting);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sorting);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSorting(items);
  };

  const getUnusedColumns = () => {
    const usedColumnIds = new Set(sorting.map((sort) => sort.id));
    return availableColumns.filter((col) => !usedColumnIds.has(col.id));
  };

  const getColumnLabel = (columnId: string) => {
    return (
      availableColumns.find((col) => col.id === columnId)?.label || columnId
    );
  };

  const listWithIds = sorting.map((sort, index) => ({
    ...sort,
    // Adding a unique identifier for SortableJS
    _id: `${sort.id}-${index}`,
  }));

  const handleSetList = (newList) => {
    // Map back to your original structure
    const updatedSorting = newList.map((item) => ({
      id: item.id,
      desc: item.desc,
    }));

    setSorting(updatedSorting);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasSorting ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Sorting</span>
          {hasSorting && (
            <Badge
              variant="secondary"
              className="ml-1 bg-background text-foreground"
            >
              {sorting.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-max p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <h3 className="font-medium">Sort Priority</h3>
            {hasSorting && <Badge variant="secondary">{sorting.length}</Badge>}
          </div>
          {hasSorting && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setSorting([])}
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="p-4 max-h-max overflow-y-auto">
          {sorting.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No sorting applied. Add a sort to organize your data.</p>
            </div>
          ) : (
            <div className="mb-4 relative">
              <p className="text-sm text-muted-foreground mb-4">
                Drag to reorder the sort priority. The table will be sorted by
                the first column, then by the second, and so on.
              </p>

              <ReactSortable
                list={listWithIds}
                setList={handleSetList}
                animation={150}
                delayOnTouchOnly={true}
                delay={100}
                handle=".sort-handle"
                className="space-y-2"
              >
                {listWithIds.map((sort, index) => (
                  <div
                    key={sort._id}
                    className="flex items-center gap-2 p-2 border rounded-md bg-muted/20"
                  >
                    <div className="sort-handle cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <Badge
                      variant="secondary"
                      className="bg-primary text-primary-foreground"
                    >
                      {index + 1}
                    </Badge>

                    <Select
                      value={sort.id}
                      onValueChange={(value) => updateSort(index, value, null)}
                    >
                      <SelectTrigger className="w-full max-w-[180px]">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={sort.id}>
                          {getColumnLabel(sort.id)}
                        </SelectItem>
                        {getUnusedColumns().map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant={sort.desc ? "ghost" : "secondary"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateSort(index, null, false)}
                      >
                        <ArrowUp className="h-4 w-4" />
                        <span className="sr-only">Sort ascending</span>
                      </Button>
                      <Button
                        variant={sort.desc ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateSort(index, null, true)}
                      >
                        <ArrowDown className="h-4 w-4" />
                        <span className="sr-only">Sort descending</span>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-8 w-8 p-0"
                      onClick={() => removeSort(index)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove sort</span>
                    </Button>
                  </div>
                ))}
              </ReactSortable>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={addSort}
              disabled={getUnusedColumns().length === 0}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add sort
            </Button>

            {sorting.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSorting([])}
                className="flex items-center gap-1"
              >
                <Trash className="h-4 w-4" />
                Reset all
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={!hasSorting}
          >
            Apply Sorting
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
