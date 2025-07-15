"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Check,
  ChevronsUpDown,
  Eye,
  Calendar,
  Upload,
  Minus,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";

interface FormPreviewProps {
  formData: any;
}

export function FormPreview({ formData }: FormPreviewProps) {
  const renderFormElement = (element: any) => {
    switch (element.type) {
      case "name":
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");
        const frameworks = element.options;

        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-11 bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
                >
                  {value
                    ? frameworks.find((framework) => framework.value === value)
                        ?.label
                    : "Select name..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={element.placeholder} />
                  <CommandList>
                    <CommandEmpty>No name found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue);
                            setOpen(false);
                          }}
                        >
                          {framework.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              framework.value === value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "text":
        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Input
              id={element.id}
              placeholder={element.placeholder}
              required={element.required}
              className="h-11 bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Textarea
              id={element.id}
              placeholder={element.placeholder}
              required={element.required}
              rows={4}
              className="bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        );

      case "dropdown":
        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Select>
              <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={element.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((option: any) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div key={element.id} className="space-y-4 group">
            <Label className="text-sm font-medium flex items-center gap-2">
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <div className="space-y-3">
              {element.options?.map((option: any) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Checkbox id={option.id} className="rounded" />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "radio":
        return (
          <div key={element.id} className="space-y-4 group">
            <Label className="text-sm font-medium flex items-center gap-2">
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <RadioGroup className="space-y-3">
              {element.options?.map((option: any) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "date":
        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Input
              id={element.id}
              type="date"
              required={element.required}
              className="h-11 bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
            />
          </div>
        );

      case "file":
        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              <Upload className="h-4 w-4 text-green-600" />
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Input
              id={element.id}
              type="file"
              required={element.required}
              className="h-11 bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        );

      case "divider":
        return (
          <div key={element.id} className="py-6">
            <div className="flex items-center">
              <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
              <Minus className="mx-4 h-4 w-4 text-slate-400" />
              <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            </div>
          </div>
        );

      case "select":
        const [selectedValues, setSelectedValues] = useState<string[]>([]);
        const [searchValue, setSearchValue] = useState("");

        return (
          <div key={element.id} className="space-y-3 group">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center gap-2"
            >
              {element.label}
              {element.required && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Required
                </Badge>
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-11 bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
                >
                  {selectedValues.length > 0
                    ? `${selectedValues.length} item${
                        selectedValues.length > 1 ? "s" : ""
                      } selected`
                    : element.placeholder || "Select items..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder={element.placeholder || "Search items..."}
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {element.options
                        ?.filter((option: any) =>
                          option.label
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                        )
                        .map((option: any) => (
                          <CommandItem
                            key={option.value}
                            onSelect={() => {
                              const newSelectedValues = selectedValues.includes(
                                option.value
                              )
                                ? selectedValues.filter(
                                    (item) => item !== option.value
                                  )
                                : [...selectedValues, option.value];
                              setSelectedValues(newSelectedValues);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex h-4 w-4 items-center justify-center rounded border">
                                {selectedValues.includes(option.value) && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Form Preview</h2>
          <p className="text-sm text-muted-foreground">
            See how your form will look to users
          </p>
        </div>
      </div>

      <Card className="shadow-xl border-0 bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" dir={formData.direction}>
                {formData.title}
              </CardTitle>
              {formData.description && (
                <p
                  className="text-muted-foreground mt-2"
                  dir={formData.direction}
                >
                  {formData.description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                {formData.elements?.length || 0} fields
              </Badge>
              {formData.percentage && (
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                >
                  {formData.percentage}% weight
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {formData.elements?.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Eye className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No form elements yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Add some elements to your form to see the preview
              </p>
            </div>
          ) : (
            <form className="space-y-8" dir={formData.direction}>
              {formData.elements.map((element: any) =>
                renderFormElement(element)
              )}
            </form>
          )}
        </CardContent>

        {formData.elements?.length > 0 && (
          <CardFooter className="bg-slate-50 dark:bg-slate-800 border-t p-6">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {formData.settings?.submitButtonText || "Submit"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
