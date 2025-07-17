"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/context/page";
import axios from "axios";

// Form validation schema
const formSchema = z
  .object({
    requestorId: z.string({
      required_error: "Please select your name",
    }),
    swapWithId: z.string({
      required_error: "Please select who you want to swap with",
    }),
    fromDate: z.date({
      required_error: "Please select the start date",
    }),
    toDate: z.date({
      required_error: "Please select the end date",
    }),
    position: z.string({
      required_error: "Please select your position",
    }),
    fromShift: z.string({
      required_error: "Please select your current shift",
    }),
    toShift: z.string({
      required_error: "Please select the shift you want",
    }),
  })
  .refine((data) => data.requestorId !== data.swapWithId, {
    message: "You cannot swap shifts with yourself",
    path: ["swapWithId"],
  })
  .refine((data) => data.fromDate <= data.toDate, {
    message: "End date cannot be before start date",
    path: ["toDate"],
  });

export default function ShiftSwapPage() {
  const { user, token } = useAuth();
  const url = process.env.NEXT_PUBLIC_API_URL;
  const [employees, setEmployees] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [openRequestor, setOpenRequestor] = useState(false);
  const [openSwapWith, setOpenSwapWith] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  // Add state to track the selected position

  // Define shifts based on position
  const getShifts = (position) => {
    if (position === "senior") {
      return [
        { id: "morning", name: "Morning (7AM-7PM)" },
        { id: "night", name: "Night (7PM-7AM)" },
      ];
    } else if (position === "registered") {
      return [
        { id: "morning", name: "Morning (8AM-8PM)" },
        { id: "night", name: "Night (8PM-8AM)" },
      ];
    } else {
      // Default shifts if no position selected
      return [
        { id: "morning", name: "Morning" },
        { id: "night", name: "Night" },
      ];
    }
  };

  // Get shifts based on current position
  const shifts = getShifts(selectedPosition);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestorId: "",
      swapWithId: "",
      position: "",
      fromShift: "",
      toShift: "",
      reason: "",
    },
  });

  useEffect(() => {
    getUserName();
  }, [user]);

  // get the user name
  async function getUserName() {
    try {
      const response = await axios.post(
        `${url}user/fetchForDepartmentForSwap`,
        {
          user: user.id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      const newEmployees = response.data.map((data) => ({
        id: data._id,
        name: data.fullName,
      }));

      setEmployees((prevEmployees) => {
        // Create a Set of existing employee IDs for efficient lookup
        const existingIds = new Set(prevEmployees.map((emp) => emp.id));

        // Filter out duplicates from new employees
        const uniqueNewEmployees = newEmployees.filter(
          (emp) => !existingIds.has(emp.id)
        );

        return [...prevEmployees, ...uniqueNewEmployees];
      });
    } catch (error) {}
  }

  // Form submission handler
  async function onSubmit(values) {
    setIsSubmitting(true);

    try {
      // Get employee names for better display in confirmation
      const requestor = employees.find((emp) => emp.id === values.requestorId);
      const swapWith = employees.find((emp) => emp.id === values.swapWithId);

      values.fromDate = format(values.fromDate, "yyyy-MM-dd");
      values.toDate = format(values.toDate, "yyyy-MM-dd");

      const allData = {
        createdName: user ? user.fullName : requestor?.name,
        position: values.position,
        swapingName: swapWith?.name,
        Createdsheft: values.fromShift,
        createdDate: values.fromDate,
        forSheft: values.toShift,
        forDate: values.toDate,
        department: user.department,
        reason: reason || "No reason provided",
      };

      

      //sending the request to the backend
      const response = await axios
        .post(
          `${url}work-swap/create`,

          allData,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          // Show success message
          toast.success(
            <div className="flex flex-col gap-1">
              <h3 className="font-medium">Shift Swap Created</h3>
              <p className="text-sm">
                Your request to swap shifts with {swapWith?.name} has been
                submitted successfully.
              </p>
            </div>
          );
        });

      // Reset form
      form.reset();
    } catch (error) {
      toast.error("Failed to submit shift swap request. Please try again.");
      console.error("Error submitting shift swap request:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Shift Swap Request
        </h1>
        <p className="text-muted-foreground mt-2">
          Use this form to request a shift swap with another nurse.
        </p>
      </div>

      <Card className="border-border/40 shadow-lg">
        <CardHeader className="bg-primary/5 border-b border-border/30">
          <CardTitle>Nurse Shift Swap Form</CardTitle>
          <CardDescription>
            All fields are required. Requests must be approved by management.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              {/* Employee Selection Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Requestor Selection */}
                <FormField
                  control={form.control}
                  name="requestorId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Your Name</FormLabel>

                      <Popover
                        open={openRequestor}
                        onOpenChange={setOpenRequestor}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openRequestor}
                              className="justify-between w-full font-normal"
                              disabled={!!user} // This would disable the button when user.id exists
                            >
                              {user.id || user._id
                                ? (field.value = user.fullName)
                                : field.value
                                ? employees.find(
                                    (employee) => employee.id === field.value
                                  )?.name
                                : "Select your name"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search employees..." />
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup>
                              {employees.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={employee.id}
                                  onSelect={() => {
                                    form.setValue("requestorId", employee.id);
                                    setOpenRequestor(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      employee.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {employee.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Swap With Selection */}
                <FormField
                  control={form.control}
                  name="swapWithId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Swap With</FormLabel>
                      <Popover
                        open={openSwapWith}
                        onOpenChange={setOpenSwapWith}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openSwapWith}
                              className="justify-between w-full font-normal"
                            >
                              {field.value
                                ? employees.find(
                                    (employee) => employee.id === field.value
                                  )?.name
                                : "Select employee to swap with"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search employees..." />
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup>
                              {employees.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={employee.id}
                                  onSelect={() => {
                                    form.setValue("swapWithId", employee.id);
                                    setOpenSwapWith(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      employee.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {employee.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Position Selection */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedPosition(value); // Update the selected position
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="senior">Senior Nurse</SelectItem>
                        <SelectItem value="registered">
                          Registered Nurse
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* From Date */}
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* To Date */}
                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Shift Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* From Shift */}
                <FormField
                  control={form.control}
                  name="fromShift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Shift</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* To Shift */}
                <FormField
                  control={form.control}
                  name="toShift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Shift</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select requested shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Swap</FormLabel>
                    <FormControl>
                      <Input
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a reason for this shift swap request"
                        value={reason}
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly explain why you need to swap shifts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border/30 bg-muted/20 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
