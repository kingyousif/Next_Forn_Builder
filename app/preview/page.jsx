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
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import axios from "axios";
import { useAuth } from "@/components/context/page";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const [forms, setForms] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const url = process.env.NEXT_PUBLIC_API_URL;

  // Track all form inputs
  const [formInputs, setFormInputs] = useState({});

  // Centralized state for form elements
  const [nameState, setNameState] = useState({
    open: false,
    value: "",
  });

  // State for select/multiselect components
  const [selectStates, setSelectStates] = useState({});

  // Update handleInputChange to use element.label consistently
  const handleInputChange = (element, value) => {
    setFormInputs((prev) => ({
      ...prev,
      [element.label]: value,
    }));

    // Clear validation error when field is filled
    if (value && validationErrors[element.label]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[element.label];
        return newErrors;
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (elementLabel, option, checked) => {
    setFormInputs((prev) => {
      const currentValues = prev[elementLabel] || [];
      const newValues = checked
        ? [...currentValues, option.label]
        : currentValues.filter((value) => {
            // This filter needs to return a boolean value
            return value !== option.label;
          });

      return {
        ...prev,
        [elementLabel]: newValues,
      };
    });
  };

  // Handle radio change
  const handleRadioChange = (elementLabel, value) => {
    setFormInputs((prev) => ({
      ...prev,
      [elementLabel]: value,
    }));

    // Clear validation error when field is filled
    if (value && validationErrors[elementLabel]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[elementLabel];
        return newErrors;
      });
    }
  };

  // Handle select change
  const handleSelectChange = (elementLabel, value) => {
    setFormInputs((prev) => ({
      ...prev,
      [elementLabel]: value,
    }));

    // Clear validation error when field is filled
    if (value && validationErrors[elementLabel]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[elementLabel];
        return newErrors;
      });
    }
  };

  // Toggle selection in multi-select
  const toggleSelectValue = (elementLabel, value) => {
    const currentValues = selectStates[elementLabel]?.selectedValues || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateSelectState(elementLabel, "selectedValues", newValues);

    // Also update the formInputs state
    setFormInputs((prev) => ({
      ...prev,
      [elementLabel]: newValues,
    }));

    // Clear validation error if at least one item is selected
    if (newValues.length > 0 && validationErrors[elementLabel]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[elementLabel];
        return newErrors;
      });
    }
  };

  // Initialize or update select state for a specific element
  const initSelectState = (elementLabel) => {
    if (!selectStates[elementLabel]) {
      setSelectStates((prev) => ({
        ...prev,
        [elementLabel]: {
          open: false,
          selectedValues: [],
          searchValue: "",
        },
      }));
    }
  };

  // Update select state
  const updateSelectState = (elementLabel, key, value) => {
    setSelectStates((prev) => ({
      ...prev,
      [elementLabel]: {
        ...prev[elementLabel],
        [key]: value,
      },
    }));
  };

  // Modify the fetchData function's initialization of formInputs
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://172.18.1.31:8000/form/fetch/${user.id}`
      );

      const forms = response.data;
      const activeForm = forms.find((form) => form.active);

      if (!activeForm) {
        redirect("/dashboard");
        return;
      }

      setForms(forms);
      setFormData(activeForm);

      // Initialize empty form inputs object using labels as keys
      const initialInputs = {};
      activeForm.elements?.forEach((element) => {
        if (element.type === "checkbox" || element.type === "select") {
          initialInputs[element.label] = [];
        } else if (element.type !== "divider") {
          initialInputs[element.label] = "";
        }
      });
      setFormInputs(initialInputs);
    } catch (error) {
      console.error("Error fetching forms:", error);
      // Consider showing an error message to the user
      redirect("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredElements = formData?.elements?.filter(
      (element) => element.required && element.type !== "divider"
    );

    requiredElements?.forEach((element) => {
      const value = formInputs[element.label];

      // Check each type of field
      switch (element.type) {
        case "checkbox":
        case "select":
          if (!value || value.length === 0) {
            errors[element.label] = "This field is required";
          }
          break;
        case "name":
        case "dropdown":
        case "radio":
        case "text":
        case "textarea":
        case "date":
        case "file":
          if (!value || value === "") {
            errors[element.label] = "This field is required";
          }
          break;
        default:
          break;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const users = await axios.post(`${url}user/fetchById`, { id: user.id });
    if (users.data.role !== "admin") {
      toast.error(
        "You are not authorized to submit this form. just admin can access it"
      );
      return;
    }

    if (
      formInputs["New Name"] === "" ||
      formInputs["ناو"] === "" ||
      formInputs["Name"] === ""
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!validateForm()) {
      // Validate form before submission
      // Scroll to the first error
      const firstErrorElement = document.querySelector(".error-message");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setSubmitting(true);

    try {
      // Check if we have any file inputs
      const hasFiles = Object.values(formInputs).some(
        (value) => value instanceof File
      );

      let submissionData;

      if (hasFiles) {
        // Use FormData to handle file uploads
        const submissionFormData = new FormData();
        submissionFormData.append("formId", formData._id);
        submissionFormData.append("userId", user.id);
        submissionFormData.append("createdBy", user.name);

        // Convert responses to a more manageable format
        const responsesWithoutFiles = { ...formInputs };

        // Add each response to formData
        Object.entries(formInputs).forEach(([key, value]) => {
          if (value instanceof File) {
            // Add file with field name as key
            submissionFormData.append(key, value);
            // Remove from regular responses
            delete responsesWithoutFiles[key];
          }
        });

        // Add remaining responses as JSON
        submissionFormData.append(
          "responses",
          JSON.stringify(responsesWithoutFiles)
        );
        submissionFormData.append("submittedAt", new Date().toISOString());

        submissionData = submissionFormData;
      } else {
        // Regular JSON submission without files
        submissionData = {
          formId: formData._id,
          userId: user.id,
          createdBy: user.name,
          createdFor:
            formInputs["New Name"] ||
            formInputs["ناو"] ||
            formInputs["Name"] ||
            "None",
          department: user.department,
          responses: formInputs,
          submittedAt: new Date().toISOString(),
        };
      }

      // Send data to your API endpoint
      const response = await axios.post(
        "http://172.18.1.31:8000/formSubmission",
        submissionData,
        hasFiles
          ? {
              headers: { "Content-Type": "multipart/form-data" },
            }
          : {}
      );

      // Show success message or redirect
      toast.success(
        formData.settings.successMessage || "Form submitted successfully"
      );
      // Optionally redirect
      // redirect("/success-page");
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Failed to submit form. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Move the fetchUser function outside of renderFormElement
  const fetchUser = async () => {
    try {
      const response = await axios.post(`${url}user/fetchForDepartment`, {
        department: formData?.department || user?.department,
        user: user?._id || user?.id,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  // Move the useEffect hooks outside of renderFormElement
  useEffect(() => {
    if (user && formData) {
      const fetchData = async () => {
        const fetchedUsers = await fetchUser();
        setUsers(fetchedUsers);
      };

      fetchData();
    }
  }, [user?.department, formData, url]);

  const renderFormElement = (element) => {
    const hasError = validationErrors[element.label];

    switch (element.type) {
      case "name":
        // Combine existing options with fetched users
        const options = Array.from(
          new Set(
            [
              ...(element.options || []),
              ...users.map((user) => ({
                value: user.name,
                label: user.fullName,
              })),
            ].map(JSON.stringify)
          )
        ).map(JSON.parse);

        return (
          <div key={element.id} className="space-y-3">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between text-left font-normal h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    hasError && "border-destructive ring-destructive"
                  )}
                >
                  {value
                    ? options.find((framework) => framework.value === value)
                        ?.label
                    : element.placeholder || "Select name..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full min-w-[200px] p-0 backdrop-blur-sm bg-popover/90 shadow-lg rounded-md border border-border">
                <Command className="w-full">
                  <CommandInput
                    placeholder={element.placeholder}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty className="py-2 text-center text-sm">
                      No name found.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue);
                            setOpen(false);
                            handleInputChange(element, currentValue);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{framework.label}</span>
                          <Check
                            className={cn(
                              "h-4 w-4 text-primary",
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
            {hasError && (
              <p className="text-destructive text-xs mt-1 error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "text":
        return (
          <div key={element.id} className="space-y-3" dir={formData?.direction}>
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={element.id}
              name={element.label}
              placeholder={element.placeholder}
              className={cn(
                "h-10 rounded-md border border-input px-3 py-2 bg-background text-foreground transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2",
                hasError && "border-destructive ring-destructive"
              )}
              value={formInputs[element.label] || ""}
              onChange={(e) => handleInputChange(element, e.target.value)}
            />
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "textarea":
        return (
          <div key={element.id} className="space-y-3">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={element.id}
              name={element.label}
              placeholder={element.placeholder}
              rows={3}
              className={cn(
                "min-h-24 rounded-md border border-input bg-background px-3 py-2 text-foreground transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y",
                hasError && "border-destructive ring-destructive"
              )}
              value={formInputs[element.label] || ""}
              onChange={(e) => handleInputChange(element, e.target.value)}
            />
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "dropdown":
        return (
          <div key={element.id} className="space-y-3">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={formInputs[element.label] || ""}
              onValueChange={(value) =>
                handleSelectChange(element.label, value)
              }
            >
              <SelectTrigger
                id={element.id}
                className={cn(
                  "h-10 rounded-md border border-input bg-background px-3 text-foreground transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  hasError && "border-destructive ring-destructive"
                )}
              >
                <SelectValue placeholder={element.placeholder} />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm bg-popover/90 border border-border shadow-lg rounded-md">
                {element.options?.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "checkbox":
        return (
          <div key={element.id} className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2 ml-1">
              {element.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.id}
                    className={cn(
                      "h-5 w-5 rounded-sm border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                      hasError && "border-destructive"
                    )}
                    checked={(formInputs[element.label] || []).includes(
                      option.label
                    )}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(element.label, option, checked)
                    }
                  />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal cursor-pointer select-none"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "radio":
        return (
          <div key={element.id} className="space-y-3" dir={formData?.direction}>
            <Label className="text-sm font-medium flex items-center">
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <RadioGroup
              value={formInputs[element.label] || ""}
              onValueChange={(value) => {
                handleRadioChange(element.label, value);
              }}
              dir={formData?.direction}
              className={cn(
                "ml-1 space-y-2",
                hasError && "p-2 border border-destructive rounded-md"
              )}
            >
              {element.options?.map((option) => (
                <div
                  key={option.id}
                  className="relative flex items-center  rounded-lg transition-all hover:bg-accent/10 dark:hover:bg-accent/20 group cursor-pointer"
                >
                  <RadioGroupItem
                    value={option.label}
                    id={option.id}
                    className="h-5 w-5 border-2 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all group-hover:border-primary dark:border-border"
                  />
                  <Label
                    htmlFor={option.id}
                    className="ml-3 p-2 text-sm font-medium select-none transition-colors group-hover:text-primary dark:group-hover:text-primary flex-1"
                    dir="ltr"
                  >
                    {option.label}
                  </Label>
                  <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-accent dark:border-accent/50" />
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "date":
        return (
          <div key={element.id} className="space-y-3">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id={element.id}
                type="date"
                className={cn(
                  "h-10 rounded-md border border-input bg-background px-3 py-2 text-foreground transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  hasError && "border-destructive ring-destructive"
                )}
                value={formInputs[element.label] || ""}
                onChange={(e) => handleInputChange(element, e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </div>
            </div>
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "file":
        return (
          <div key={element.id} className="space-y-3">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id={element.id}
                type="file"
                className={cn(
                  "h-10 rounded-md border border-input bg-background px-3 py-2 text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary transition-all cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  hasError && "border-destructive ring-destructive"
                )}
                onChange={(e) => handleInputChange(element, e.target.files[0])}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <UploadIcon className="h-4 w-4 opacity-50" />
              </div>
            </div>
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      case "divider":
        return (
          <div key={element.id} className="py-4">
            <div className="border-t border-border dark:border-border" />
          </div>
        );
      case "select":
        if (!selectStates[element.label]) {
          initSelectState(element.label);
        }

        const selectState = selectStates[element.label] || {
          open: false,
          selectedValues: [],
          searchValue: "",
        };

        return (
          <div key={element.id} className="space-y-3">
            <Label
              htmlFor={element.id}
              className="text-sm font-medium flex items-center"
            >
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Popover
              open={selectState.open}
              onOpenChange={(open) =>
                updateSelectState(element.label, "open", open)
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between h-10 rounded-md border border-input bg-background px-3 py-2 text-left font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    hasError && "border-destructive ring-destructive"
                  )}
                >
                  {selectState.selectedValues.length > 0
                    ? `${selectState.selectedValues.length} item${
                        selectState.selectedValues.length > 1 ? "s" : ""
                      } selected`
                    : element.placeholder || "Select items..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full min-w-[300px] p-0 backdrop-blur-sm bg-popover/90 shadow-lg rounded-md border border-border">
                <Command className="w-full">
                  <CommandInput
                    placeholder={element.placeholder || "Search items..."}
                    value={selectState.searchValue}
                    onValueChange={(value) =>
                      updateSelectState(element.label, "searchValue", value)
                    }
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty className="py-2 text-center text-sm">
                      No items found.
                    </CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
                      {element.options
                        ?.filter((option) =>
                          option.label
                            .toLowerCase()
                            .includes(selectState.searchValue.toLowerCase())
                        )
                        .map((option) => (
                          <CommandItem
                            key={option.value}
                            onSelect={() =>
                              toggleSelectValue(element.label, option.value)
                            }
                            className="flex items-center cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex h-4 w-4 items-center justify-center rounded border border-input">
                                {selectState.selectedValues.includes(
                                  option.value
                                ) && <Check className="h-3 w-3 text-primary" />}
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
            {hasError && (
              <p className="text-destructive text-xs error-message">
                {validationErrors[element.label]}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : (
        <Card className="shadow-lg dark:shadow-primary/10 overflow-hidden border-border bg-card text-card-foreground">
          <CardHeader className="px-6 pt-6 pb-4 bg-muted/20 dark:bg-muted/5 border-b border-border">
            <CardTitle dir={formData?.direction} className="text-2xl font-bold">
              {formData?.title}
            </CardTitle>
            {formData?.description && (
              <p
                className="text-muted-foreground mt-2"
                dir={formData?.direction}
              >
                {formData?.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <form
              className="space-y-6"
              dir={formData?.direction}
              onSubmit={handleSubmit}
              id="formElement"
            >
              {formData?.elements?.map((element) => renderFormElement(element))}
            </form>
          </CardContent>
          <CardFooter className="px-6 py-4 bg-muted/20 dark:bg-muted/5 border-t border-border">
            <Button
              type="submit"
              form="formElement"
              disabled={submitting}
              className="w-full sm:w-auto min-w-32 h-10 rounded-md transition-all bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div
                    className="h-4
                  w-4 animate-spin rounded-full border-b-2 border-t-2 border-primary-foreground"
                  ></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                formData?.settings?.submitButtonText || "Submit"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
