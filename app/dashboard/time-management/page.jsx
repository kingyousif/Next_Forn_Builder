"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  User,
  Calendar,
  AlertCircle,
  PlusCircle,
  Edit,
  Trash,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Utility to combine Tailwind classes
import { toast } from "sonner";

export default function HRTimeManagement() {
  // State for employee time management data
  const [employeeTimeData, setEmployeeTimeData] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state control
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [removeUser, setRemoveUser] = useState([]);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    userId: [], // Changed from userId to userId array
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    graceMinutesLate: 15,
    graceMinutesEarly: 10,
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
  });

  // State for user selection dropdown
  const [selectedUser, setSelectedUser] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Only show first 10 users by default or filter by search term
  const filteredUsers = useMemo(() => {
    const unselected = users.filter(
      (user) =>
        !formData.userId.includes(user.userId) &&
        (user?.active === false || !user?.active)
    );
    if (searchTerm.trim() === "") {
      return unselected.slice(0, 10);
    }

    return unselected
      .filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10);
  }, [users, formData.userId, searchTerm]);
  const url = process.env.NEXT_PUBLIC_API_URL;

  // Fetch data on component mount
  useEffect(() => {
    // Fetch employee time data
    fetchEmployeeTimeData();

    // Fetch users for dropdown
    fetchUsers();
  }, []);

  // API calls
  const fetchEmployeeTimeData = async () => {
    try {
      // In a real application, this would be an actual API call
      // const response = await fetch('/api/employee-time-management');
      // const data = await response.json();

      // Mock data for demo
      await axios.post(`${url}timeManagement/fetch`).then((res) => {
        const mockData = res.data;
        setEmployeeTimeData(mockData);
        setIsLoading(false);
      });
    } catch (err) {
      setError("Failed to fetch employee time data");
      setIsLoading(false);
      console.error("Error fetching employee time data:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      await axios.get(`${url}attendanceUser/fetch`).then((res) => {
        setUsers(res.data);
      });
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    setRemoveUser([]);
  }, [isDialogOpen]);

  // Add this function to check user availability before submitting
  const checkUserAvailability = async () => {
    try {
      const userIdsToCheck = formData.userId;

      if (userIdsToCheck.length === 0) return true;

      const response = await axios.post(
        `${url}timeManagement/checkUserAvailability`,
        {
          userId: userIdsToCheck,
          currentScheduleId: isEditing ? currentId : null,
        }
      );

      if (!response.data.available) {
        toast.error(
          `Some employees are already assigned to other schedules: ${response.data.assignedUsers.join(
            ", "
          )}`
        );
        return false;
      }

      return true;
    } catch (err) {
      toast.error("Error checking user availability");
      console.error("Error checking user availability:", err);
      return false;
    }
  };

  // Update the create function
  const createEmployeeTimeData = async () => {
    try {
      // Check availability first
      const isAvailable = await checkUserAvailability();
      if (!isAvailable) return;

      const userNames = formData.userId.map(
        (userId) =>
          users.find((user) => String(user.userId) === String(userId))?.name ||
          "Unknown User"
      );

      const newRecord = {
        ...formData,
        userNames,
      };

      await axios.post(`${url}timeManagement/create`, newRecord).then((res) => {
        setEmployeeTimeData([
          ...employeeTimeData,
          { ...newRecord, _id: res.data.id },
        ]);
        resetForm();

        setIsDialogOpen(false); // Close dialog after successful submission
        toast.success(res?.data?.message || "Record created successfully");
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create record");
      setError("Failed to create record");
      setIsLoading(false);
      console.error("Error creating employee time data:", err);
    }
  };

  // Update the update function
  const updateEmployeeTimeData = async () => {
    try {
      // Check availability first
      const isAvailable = await checkUserAvailability();
      if (!isAvailable) return;

      const userNames = formData.userId.map(
        (userId) =>
          users.find((user) => String(user.userId) === String(userId))?.name ||
          "Unknown User"
      );

      const updatedData = {
        ...formData,
        userNames,
      };

      await axios
        .put(`${url}timeManagement/update/${currentId}`, updatedData)
        .then((res) => {
          setEmployeeTimeData(
            employeeTimeData.map((item) =>
              item._id === currentId ? { ...updatedData, _id: currentId } : item
            )
          );
          resetForm();
          if (removeUser.length > 0) {
            removeUser.forEach((userId) => {
              axios.get(`${url}attendanceUser/${userId}`).catch((error) => {
                toast.error(
                  error?.response?.data?.message || "Failed to remove user"
                );
              });
            });
          }

          setIsDialogOpen(false); // Close dialog after successful submission
          toast.success(res?.data?.message || "Record updated successfully");
        });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update record");
      setError("Failed to update record");
      setIsLoading(false);
      console.error("Error updating employee time data:", err);
    }
  };

  const deleteEmployeeTimeData = async (id) => {
    try {
      setIsLoading(true);
      // In a real application, this would be an actual API call
      // await fetch(`/api/employee-time-management/${id}`, {
      //   method: 'DELETE'
      // });

      // Mock delete
      setTimeout(() => {
        setEmployeeTimeData(employeeTimeData.filter((item) => item._id !== id));
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError("Failed to delete record");
      setIsLoading(false);
      console.error("Error deleting employee time data:", err);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle adding a user to the userId array
  const handleAddUser = () => {
    if (selectedUser && !formData.userId.includes(selectedUser)) {
      setFormData({
        ...formData,
        userId: [...formData.userId, selectedUser],
      });
      setSelectedUser(""); // Reset selected user after adding
    }
  };

  // Handle removing a user from the userId array
  const handleRemoveUser = (userId) => {
    const userToRemove = users.find(
      ({ userId: id }) => String(id) === String(userId)
    );
    setRemoveUser((prev) => [...prev, userToRemove._id]);

    if (userToRemove) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userId: prevFormData.userId.filter((id) => id !== userId),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateEmployeeTimeData();
    } else {
      createEmployeeTimeData();
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      userId: item.userId,
      workHoursPerDay: item.workHoursPerDay,
      workDaysPerWeek: item.workDaysPerWeek,
      graceMinutesLate: item.graceMinutesLate,
      graceMinutesEarly: item.graceMinutesEarly,
      startTime: item.startTime,
      endTime: item.endTime,
      notes: item.notes || "",
    });
    setIsEditing(true);
    setCurrentId(item._id);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      userId: [],
      workHoursPerDay: 8,
      workDaysPerWeek: 5,
      graceMinutesLate: 15,
      graceMinutesEarly: 10,
      startTime: "09:00",
      endTime: "17:00",
      notes: "",
    });
    setSelectedUser("");
    setIsEditing(false);
    setCurrentId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Get user name by ID
  // Fix the getUserName function to handle string/number type mismatches
  const getUserName = (userId) => {
    const user = users.find((user) => String(user.userId) === String(userId));
    return user ? user.name : "Unknown User";
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            HR Time Management System
          </CardTitle>
          <CardDescription>
            Manage employee work schedules, attendance policies, and time
            allowances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Employee Time Schedules</h3>
            <Button
              className="flex items-center gap-2"
              onClick={openCreateDialog}
            >
              <PlusCircle size={16} />
              Add New Schedule
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center text-red-500 flex flex-col items-center">
                <AlertCircle size={32} className="mb-2" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setError(null);
                    fetchEmployeeTimeData();
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableCaption>Employee time management schedules</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule Name</TableHead>
                  <TableHead>Assigned Employees</TableHead>
                  <TableHead>Hours/Day</TableHead>
                  <TableHead>Days/Week</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Grace Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeTimeData.length > 0 ? (
                  employeeTimeData.map((item) => (
                    <TableRow key={item.userId}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.userNames.map((name, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="mr-1 mb-1"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{item.workHoursPerDay}h</TableCell>
                      <TableCell>{item.workDaysPerWeek} days</TableCell>
                      <TableCell>
                        {item.startTime} - {item.endTime}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Late: {item.graceMinutesLate} min</div>
                          <div>Early: {item.graceMinutesEarly} min</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit size={16} />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500"
                              >
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Time Schedule
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this time
                                  schedule? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteEmployeeTimeData(item._id)
                                  }
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No time schedules found. Create your first schedule using
                      the button above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {employeeTimeData.length} schedule(s) found
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEmployeeTimeData()}
            >
              Refresh Data
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Create/Edit Dialog - Controlled by state instead of DialogTrigger */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Time Schedule" : "Create New Time Schedule"}
            </DialogTitle>
            <DialogDescription>
              Define work hours, attendance rules, and time allowances for
              employees
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Schedule Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              {/* Multi-user selection section */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Employees</Label>
                <div className="col-span-3 space-y-4">
                  <div className="flex gap-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedUser
                            ? users.find((user) => user.userId === selectedUser)
                                ?.name
                            : "Select employee"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search employees..."
                            onValueChange={setSearchTerm}
                          />
                          <CommandGroup>
                            {filteredUsers.map((user) => (
                              <CommandItem
                                key={user._id}
                                value={user.name}
                                onSelect={() => {
                                  setSelectedUser(user.userId);
                                  setOpen(false);
                                  setSearchTerm(""); // Clear search on select
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUser === user.userId
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {user.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      onClick={handleAddUser}
                      disabled={!selectedUser}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected users display */}
                  <div className="border rounded-md p-2 min-h-16">
                    {formData.userId.length > 0 ? (
                      <ScrollArea className="h-32">
                        <div className="flex flex-wrap gap-2">
                          {formData.userId.map((userId) => (
                            <Badge
                              key={userId}
                              variant="secondary"
                              className="flex items-center gap-1 px-2 py-1"
                            >
                              {getUserName(userId)}
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(userId)}
                                className="h-4 w-4 rounded-full text-slate-500 hover:bg-slate-200 inline-flex items-center justify-center"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-2">
                        No employees selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workHoursPerDay" className="text-right">
                  Hours Per Day
                </Label>
                <Input
                  id="workHoursPerDay"
                  name="workHoursPerDay"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.workHoursPerDay}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workDaysPerWeek" className="text-right">
                  Days Per Week
                </Label>
                <Input
                  id="workDaysPerWeek"
                  name="workDaysPerWeek"
                  type="number"
                  min="1"
                  max="7"
                  value={formData.workDaysPerWeek}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="graceMinutesLate" className="text-right">
                  Grace Minutes (Late)
                </Label>
                <Input
                  id="graceMinutesLate"
                  name="graceMinutesLate"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.graceMinutesLate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="graceMinutesEarly" className="text-right">
                  Grace Minutes (Early)
                </Label>
                <Input
                  id="graceMinutesEarly"
                  name="graceMinutesEarly"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.graceMinutesEarly}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || formData.userId.length === 0}
              >
                {isLoading ? "Processing..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding the HR Time Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Clock className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Work Hours</h4>
                <p className="text-sm text-gray-500">
                  Define daily work hours, including start time and end time for
                  each employee schedule.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Work Days</h4>
                <p className="text-sm text-gray-500">
                  Set how many days per week employees are expected to work.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Grace Periods</h4>
                <p className="text-sm text-gray-500">
                  Configure allowances for late arrivals or early departures
                  without penalty.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <User className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Employee Assignment</h4>
                <p className="text-sm text-gray-500">
                  Assign multiple employees to the same time management profile.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
