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
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
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
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <br />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {value
                    ? frameworks.find((framework) => framework.value === value)
                        ?.label
                    : "Select name..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder={element.placeholder}

                    // onChange={(event) => setValue(event.currentTarget.value)}
                  />
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
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={element.id}
              placeholder={element.placeholder}
              required={element.required}
            />
          </div>
        );
      case "textarea":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={element.id}
              placeholder={element.placeholder}
              required={element.required}
              rows={3}
            />
          </div>
        );
      case "dropdown":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select>
              <SelectTrigger id={element.id}>
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
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {element.options?.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox id={option.id} className="rounded-none" />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <RadioGroup>
              {element.options?.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case "date":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input id={element.id} type="date" required={element.required} />
          </div>
        );
      case "file":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input id={element.id} type="file" required={element.required} />
          </div>
        );
      case "divider":
        return (
          <div key={element.id} className="py-2">
            <div className="border-t" />
          </div>
        );
      case "select":
        const [selectedValues, setSelectedValues] = useState<string[]>([]);
        const [searchValue, setSearchValue] = useState("");

        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedValues.length > 0
                    ? `${selectedValues.length} item${
                        selectedValues.length > 1 ? "s" : ""
                      } selected`
                    : element.placeholder || "Select items..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
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
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle dir={formData.direction}>{formData.title}</CardTitle>
          {formData.description && (
            <p className="text-muted-foreground" dir={formData.direction}>
              {formData.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-6" dir={formData.direction}>
            {formData.elements.map((element: any) =>
              renderFormElement(element)
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit">
            {formData.settings.submitButtonText || "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
