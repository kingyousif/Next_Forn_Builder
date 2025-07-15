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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Upload,
  Sparkles,
  User,
  FileText,
  Calendar,
  CheckSquare,
  Circle,
  List,
  Divide,
  Star,
  Zap,
  Send,
  Loader2,
} from "lucide-react";
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
import Link from "next/link";

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

    setFormInputs((prev) => ({
      ...prev,
      [elementLabel]: newValues,
    }));

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

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://172.18.1.31:8000/form/fetch/${user.id || user._id}`
      );

      const forms = response.data;
      const activeForm = forms.find((form) => form.active);

      if (!activeForm) {
        redirect("/dashboard");
        return;
      }

      setForms(forms);
      setFormData(activeForm);

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
    setSubmitting(true);
    event.preventDefault();

    const users = await axios.post(`${url}user/fetchById`, {
      id: user.id || user._id,
    });

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
      const firstErrorElement = document.querySelector(".error-message");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    try {
      const hasFiles = Object.values(formInputs).some(
        (value) => value instanceof File
      );

      let submissionData;
      let userID = user.id || user._id;

      if (hasFiles) {
        const submissionFormData = new FormData();
        submissionFormData.append("formId", formData._id);
        submissionFormData.append("userId", userID);
        submissionFormData.append("createdBy", user.name);

        const responsesWithoutFiles = { ...formInputs };

        Object.entries(formInputs).forEach(([key, value]) => {
          if (value instanceof File) {
            submissionFormData.append(key, value);
            delete responsesWithoutFiles[key];
          }
        });

        submissionFormData.append(
          "responses",
          JSON.stringify(responsesWithoutFiles)
        );
        submissionFormData.append("submittedAt", new Date().toISOString());

        submissionData = submissionFormData;
      } else {
        submissionData = {
          formId: formData._id,
          userId: userID,
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

      const response = await axios.post(
        "http://172.18.1.31:8000/formSubmission",
        submissionData,
        hasFiles
          ? {
              headers: { "Content-Type": "multipart/form-data" },
            }
          : {}
      );

      toast.success(
        formData.settings.successMessage || "Form submitted successfully"
      );

      setFormInputs({});
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

  useEffect(() => {
    if (user && formData) {
      const fetchData = async () => {
        const fetchedUsers = await fetchUser();
        setUsers(fetchedUsers);
      };

      fetchData();
    }
  }, [user?.department, formData, url]);

  const getElementIcon = (type) => {
    const iconMap = {
      name: User,
      text: FileText,
      textarea: FileText,
      dropdown: List,
      checkbox: CheckSquare,
      radio: Circle,
      date: Calendar,
      file: Upload,
      select: List,
    };
    return iconMap[type] || FileText;
  };

  const getElementColor = (type) => {
    const colorMap = {
      name: "from-blue-500 to-cyan-500",
      text: "from-green-500 to-emerald-500",
      textarea: "from-purple-500 to-violet-500",
      dropdown: "from-orange-500 to-amber-500",
      checkbox: "from-pink-500 to-rose-500",
      radio: "from-indigo-500 to-blue-500",
      date: "from-teal-500 to-cyan-500",
      file: "from-red-500 to-pink-500",
      select: "from-yellow-500 to-orange-500",
    };
    return colorMap[type] || "from-gray-500 to-slate-500";
  };

  const renderFormElement = (element) => {
    const hasError = validationErrors[element.label];
    const IconComponent = getElementIcon(element.type);
    const gradientColor = getElementColor(element.type);

    switch (element.type) {
      case "name":
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
          <div
            key={element.id}
            className="group relative"
            dir={formData?.direction}
          >
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4" dir={element.dir}>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between h-12 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-sm hover:shadow-md",
                      hasError &&
                        "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                    )}
                  >
                    {value
                      ? options.find((framework) => framework.value === value)
                          ?.label
                      : element.placeholder || "Select name..."}
                    <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full min-w-[200px] p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <Command className="w-full">
                    <CommandInput
                      placeholder={element.placeholder}
                      className="h-12 text-base"
                    />
                    <CommandList>
                      <CommandEmpty className="py-4 text-center text-gray-500">
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
                            className="flex items-center justify-between cursor-pointer p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 rounded-lg mx-2 my-1"
                          >
                            <span className="font-medium">
                              {framework.label}
                            </span>
                            <Check
                              className={cn(
                                "h-5 w-5 text-blue-600",
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
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "text":
        return (
          <div
            key={element.id}
            className="group relative"
            dir={formData?.direction}
          >
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <Input
                id={element.id}
                name={element.label}
                placeholder={element.placeholder}
                className={cn(
                  "h-12 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 text-base transition-all duration-300 focus:shadow-lg focus:scale-[1.02]",
                  hasError &&
                    "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                )}
                value={formInputs[element.label] || ""}
                onChange={(e) => handleInputChange(element, e.target.value)}
              />
              {hasError && (
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "textarea":
        return (
          <div key={element.id} className="group relative">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <Textarea
                id={element.id}
                name={element.label}
                placeholder={element.placeholder}
                rows={4}
                className={cn(
                  "rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 text-base transition-all duration-300 focus:shadow-lg resize-y",
                  hasError &&
                    "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                )}
                value={formInputs[element.label] || ""}
                onChange={(e) => handleInputChange(element, e.target.value)}
              />
              {hasError && (
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div key={element.id} className="group relative">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <Select
                value={formInputs[element.label] || ""}
                onValueChange={(value) =>
                  handleSelectChange(element.label, value)
                }
              >
                <SelectTrigger
                  id={element.id}
                  className={cn(
                    "h-12 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 text-base transition-all duration-300 focus:shadow-lg",
                    hasError &&
                      "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                  )}
                >
                  <SelectValue placeholder={element.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl">
                  {element.options?.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className="cursor-pointer p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 rounded-lg mx-2 my-1 font-medium"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError && (
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div key={element.id} className="group relative">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <div className="space-y-3">
                {element.options?.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-600"
                  >
                    <Checkbox
                      id={option.id}
                      className={cn(
                        "h-6 w-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500 data-[state=checked]:border-pink-500 transition-all duration-300",
                        hasError && "border-red-400"
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
                      className="text-base font-medium cursor-pointer select-none text-gray-800 dark:text-gray-200 flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              {hasError && (
                <p className="text-red-500 text-sm mt-3 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "radio":
        return (
          <div
            key={element.id}
            className="group relative"
            dir={formData?.direction}
          >
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <RadioGroup
                value={formInputs[element.label] || ""}
                onValueChange={(value) =>
                  handleRadioChange(element.label, value)
                }
                dir={formData?.direction}
                className={cn(
                  "space-y-3",
                  hasError &&
                    "p-3 border-2 border-red-400 rounded-xl bg-red-50 dark:bg-red-900/10"
                )}
              >
                {element.options?.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-center  max-w-1/2 lg:max-w-1/6 space-x-4 pr-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer"
                  >
                    <RadioGroupItem
                      value={option.label}
                      id={option.id}
                      className="h-6 w-6 border-2 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-base font-medium cursor-pointer select-none text-gray-800 dark:text-gray-200 flex-1 p-1 lg:p-2"
                      dir="rtl"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {hasError && (
                <p className="text-red-500 text-sm mt-3 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );
      case "date":
        return (
          <div key={element.id} className="group relative">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <div className="relative">
                <Input
                  id={element.id}
                  name={element.label}
                  type="date"
                  className={cn(
                    "h-12 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 text-base transition-all duration-300 focus:shadow-lg focus:scale-[1.02] pl-12",
                    hasError &&
                      "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                  )}
                  value={formInputs[element.label] || ""}
                  onChange={(e) => handleInputChange(element, e.target.value)}
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
              </div>
              {hasError && (
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "file":
        return (
          <div key={element.id} className="group relative">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <div className="relative">
                <Input
                  id={element.id}
                  name={element.label}
                  type="file"
                  className={cn(
                    "h-12 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 text-base transition-all duration-300 focus:shadow-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-red-500 file:to-pink-500 file:text-white hover:file:from-red-600 hover:file:to-pink-600",
                    hasError &&
                      "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                  )}
                  onChange={(e) =>
                    handleInputChange(element, e.target.files[0])
                  }
                />
              </div>
              {hasError && (
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "select":
        // Initialize select state for this element
        initSelectState(element.label);
        const currentSelectState = selectStates[element.label] || {
          open: false,
          selectedValues: [],
          searchValue: "",
        };

        return (
          <div key={element.id} className="group relative">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor}`}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {element.label}
                  {element.required && (
                    <span className="text-red-500 ml-2 text-xl">*</span>
                  )}
                </Label>
              </div>
              <Popover
                open={currentSelectState.open}
                onOpenChange={(open) =>
                  updateSelectState(element.label, "open", open)
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={currentSelectState.open}
                    className={cn(
                      "w-full justify-between h-12 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-sm hover:shadow-md",
                      hasError &&
                        "border-red-400 ring-2 ring-red-200 dark:ring-red-800"
                    )}
                  >
                    <div className="flex flex-wrap gap-1">
                      {currentSelectState.selectedValues.length > 0 ? (
                        currentSelectState.selectedValues.map(
                          (value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                            >
                              {value}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-gray-500">
                          {element.placeholder || "Select options..."}
                        </span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full min-w-[200px] p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <Command className="w-full">
                    <CommandInput
                      placeholder="Search options..."
                      value={currentSelectState.searchValue}
                      onValueChange={(value) =>
                        updateSelectState(element.label, "searchValue", value)
                      }
                      className="h-12 text-base"
                    />
                    <CommandList>
                      <CommandEmpty className="py-4 text-center text-gray-500">
                        No options found.
                      </CommandEmpty>
                      <CommandGroup>
                        {element.options?.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() =>
                              toggleSelectValue(element.label, option.label)
                            }
                            className="flex items-center justify-between cursor-pointer p-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 rounded-lg mx-2 my-1"
                          >
                            <span className="font-medium">{option.label}</span>
                            <Check
                              className={cn(
                                "h-5 w-5 text-yellow-600",
                                currentSelectState.selectedValues.includes(
                                  option.label
                                )
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
                <p className="text-red-500 text-sm mt-2 error-message flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  {validationErrors[element.label]}
                </p>
              )}
            </div>
          </div>
        );

      case "divider":
        return (
          <div key={element.id} className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gradient-to-r from-purple-400 via-pink-400 to-red-400"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Loading your beautiful form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="fixed top-4 left-4 z-50">
        <Button variant="default">
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-6">
            <Sparkles className="h-6 w-6" />
            <span>{formData?.title || "Dynamic Form"}</span>
            <Star className="h-6 w-6" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {formData?.description ||
              "Fill out this beautiful form with our modern interface"}
          </p>
        </div>

        {/* Form Container */}
        <Card className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {formData?.elements?.map((element) => renderFormElement(element))}
            </form>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-8">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-3 h-6 w-6" />
                  Submit Form
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
