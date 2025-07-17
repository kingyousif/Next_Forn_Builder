"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileSpreadsheet, User, Clock, Filter } from "lucide-react";
import { addDays, format, isWeekend, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/context/page";

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  maxWorkDays?: number;
  unavailableDates?: Date[];
}

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  employeeCount: number; // New field for required employees per shift
}

interface ScheduleDay {
  date: Date;
  assignments: {
    userId: string;
    userName: string;
    shiftId: string;
  }[];
}

interface availability {
  userId: string;
  unavailableDates: Date[];
  maxWorkDays: number;
}

interface userAvailability {
  name: string;
  unavailableDates: Date[];
  maxWorkDays: number;
}

interface UserShiftAssignment {
  userId: string;
  allowedShifts: string[]; // Array of shift IDs the user can work
}

export default function SchedulePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [availability, setAvailability] = useState<availability[]>([]);
  const [userAvailability, setUserAvailability] = useState<userAvailability[]>(
    []
  );
  const [userShiftAssignments, setUserShiftAssignments] = useState<
    UserShiftAssignment[]
  >([]);
  const [newShift, setNewShift] = useState<Omit<Shift, "id">>({
    name: "",
    startTime: "",
    endTime: "",
    employeeCount: 1, // Default to 1 employee
  });
  const url = process.env.NEXT_PUBLIC_API_URL;
  const { token, user } = useAuth();

  useEffect(() => {
    shiftsFetch();
    fetchUsers();
    fetchSchedule();
    fetchAvailability();

    // Initialize user shift assignments from localStorage or set defaults
    const savedAssignments = localStorage.getItem("userShiftAssignments");
    if (savedAssignments) {
      setUserShiftAssignments(JSON.parse(savedAssignments));
    }

    // Fetch users from API (commented out for now, using localStorage)
  }, [token, user]);

  // Save assignments when they change
  useEffect(() => {
    if (userShiftAssignments.length > 0) {
      localStorage.setItem(
        "userShiftAssignments",
        JSON.stringify(userShiftAssignments)
      );
    }
  }, [userShiftAssignments]);

  async function shiftsFetch() {
    try {
      const response = await axios.get(`${url}schedule/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShifts(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching shifts:", err);
      throw err;
    }
  }

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // This would be the actual API call
      const response = await axios.post<User[]>(`${url}user/fetch`, {
        id: user._id || user.id,
      });
    
      setUsers(response.data);

      toast({
        title: "Success",
        description: "Users loaded successfully",
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // This would be the actual API call
      const response = await axios.post<userAvailability[]>(
        `${url}schedule/availability/get`,
        {
          userId: user._id || user.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setUserAvailability(response.data);

      toast({
        title: "Success",
        description: "Users loaded successfully",
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // fetch shedule from API
  const fetchSchedule = async () => {
    try {
      
      const response = await axios.post(
        `${url}schedule/get`,
        {
          startDate: "2023-01-01",
          endDate: "3023-12-31",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
     
      setSchedule(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching schedule:", err);
      throw err;
    }
  };

  // Add a new shift
  const addShift = async () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all shift details",
        variant: "destructive",
      });
      return;
    }

    // Validate employee count
    if (newShift.employeeCount < 1) {
      toast({
        title: "Error",
        description: "Required employees must be at least 1",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: newShift.name,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      employeeCount: newShift.employeeCount,
      department: user.department,
      createdBy: user.fullName,
    };

 

    const response = await axios
      .post(`${url}schedule/shifts/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        shiftsFetch();
        setNewShift({ name: "", startTime: "", endTime: "", employeeCount: 1 });
        toast({
          title: "Success",
          description: "Shift added successfully",
        });
      })
      .catch((err) => {
        console.error("Error adding shift:", err);
        toast({
          title: "Error",
          description: "Failed to add shift",
          variant: "destructive",
        });
      });
  };

  // Remove a shift
  const removeShift = async (id: string) => {
    try {
      await axios.delete(`${url}schedule/shifts/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await shiftsFetch(); // Refresh shifts list after deletion

      toast({
        title: "Success",
        description: "Shift removed successfully",
      });
    } catch (error) {
      console.error("Error removing shift:", error);
      toast({
        title: "Error",
        description: "Failed to remove shift",
        variant: "destructive",
      });
    }
  };

  // Update user's unavailable dates
  const updateUserAvailability = () => {
    if (!selectedUser) return;

    

    const updatedUsers = users.map((user) => {
      if (user._id === selectedUser._id) {
        const data = {
          unavailableDates: selectedDates,
          maxWorkDays: selectedUser.maxWorkDays,
          userId: selectedUser._id,
          allowedShifts: selectedUser.allowedShifts,
        };
        axios
          .post(`${url}schedule/availability/set`, data, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
      
            toast({
              title: "Success",
              description: `Availability updated for ${selectedUser.name}`,
            });
          });
      }
      return user;
    });

    setUsers(updatedUsers);
    setSelectedUser(null);
    setSelectedDates([]);

    toast({
      title: "Success",
      description: `Availability updated for ${selectedUser.name}`,
    });
  };

  // Update user's max work days
  const updateUserMaxWorkDays = (userId: string, maxDays: number) => {
    const updatedUsers = users.map((user) => {
      if (user._id === userId) {
        return { ...user, maxWorkDays: maxDays };
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  // Generate a schedule for the current month
  const generateSchedule = () => {
    setLoading(true);

    try {
      // Get all days in the current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const newSchedule: ScheduleDay[] = [];

      // For each day in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const assignments: {
          userId: string;
          userName: string;
          shiftId: string;
        }[] = [];

        // For each shift, assign an available employee
        shifts.forEach((shift) => {
          // Filter available employees (not already assigned that day, not unavailable, and can work this shift)
          const availableEmployees = users.filter((user) => {
            // Check if user is already assigned to this day
            const alreadyAssigned = assignments.some(
              (a) => a.userId === user._id
            );
            if (alreadyAssigned) return false;

            // Check if user has marked this date as unavailable
            const isUnavailable = user.unavailableDates?.some(
              (unavailableDate) =>
                unavailableDate.getDate() === date.getDate() &&
                unavailableDate.getMonth() === date.getMonth() &&
                unavailableDate.getFullYear() === date.getFullYear()
            );
            if (isUnavailable) return false;

            // Check if user has reached their max work days
            const userAssignmentsCount = newSchedule.reduce((count, day) => {
              return (
                count +
                day.assignments.filter((a) => a.userId === user._id).length
              );
            }, 0);

            if (userAssignmentsCount >= (user.maxWorkDays || 22)) return false;

            // NEW: Check if user is allowed to work this shift
            const userShiftAssignment = userShiftAssignments.find(
              (a) => a.userId === user._id
            );
            if (userShiftAssignment) {
              // If user has shift assignments, check if this shift is allowed
              return userShiftAssignment.allowedShifts.includes(shift._id);
            }

            // If no specific assignments are set, assume user can work any shift
            return true;
          });

          // If we have available employees, randomly select one
          if (availableEmployees.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * availableEmployees.length
            );
            const selectedEmployee = availableEmployees[randomIndex];

            assignments.push({
              userId: selectedEmployee._id,
              userName: selectedEmployee.name,
              shiftId: shift._id,
            });
          }
        });

        newSchedule.push({
          date,
          assignments,
        });
      }

      setSchedule(newSchedule);

      toast({
        title: "Success",
        description: "Schedule generated successfully",
      });
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to generate schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "Myyyy-MM-dd");
  };

  // Check if a date is in the selected dates array
  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      (selectedDate) =>
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
    );
  };

  // Toggle a date in the selected dates array
  const toggleDateSelection = (date: Date) => {
    if (isDateSelected(date)) {
      setSelectedDates(
        selectedDates.filter(
          (selectedDate) =>
            !(
              selectedDate.getDate() === date.getDate() &&
              selectedDate.getMonth() === date.getMonth() &&
              selectedDate.getFullYear() === date.getFullYear()
            )
        )
      );
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Get shift by ID
  const getShiftById = (shiftId: string) => {
    return shifts.find((shift) => shift.id === shiftId);
  };
  const exportToExcel = () => {
    if (schedule.length === 0) return;

    try {
      // Create headers
      const headers = [
        "Date",
        ...shifts.map((s) => `${s.name} (${s.startTime}-${s.endTime})`),
      ].join(",");

      // Create rows
      const rows = schedule
        .map((day) => {
          const date = format(day.date, "yyyy-MM-dd");
          const shiftData = shifts.map((shift) => {
            const assignment = day.assignments.find(
              (a) => a.shiftId === shift.id
            );
            return assignment ? `"${assignment.userName}"` : "";
          });

          return [`"${date}"`, ...shiftData].join(",");
        })
        .join("\n");

      // Combine and download
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `employee-schedule-${format(currentMonth, "yyyy-MM")}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the schedule.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Scheduling</h1>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load Employees"
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="shifts">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shifts">Manage Shifts</TabsTrigger>
          <TabsTrigger value="employees">Employee Availability</TabsTrigger>
          <TabsTrigger value="generate">Generate Schedule</TabsTrigger>
          <TabsTrigger value="view">View Schedule</TabsTrigger>
        </TabsList>
        {/* Shifts Tab */}
        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Shifts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="shiftName">Shift Name</Label>
                  <Input
                    id="shiftName"
                    value={newShift.name}
                    onChange={(e) =>
                      setNewShift({ ...newShift, name: e.target.value })
                    }
                    placeholder="Morning Shift"
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) =>
                      setNewShift({ ...newShift, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) =>
                      setNewShift({ ...newShift, endTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="employeeCount">Required Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min="1"
                    value={newShift.employeeCount}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        employeeCount: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addShift} className="w-full">
                    Add Shift
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Current Shifts</h3>
                {shifts.length === 0 ? (
                  <p className="text-muted-foreground">
                    No shifts defined yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Required Employees</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shifts.map((shift) => (
                        <TableRow key={shift.name}>
                          <TableCell>{shift.name}</TableCell>
                          <TableCell>{shift.startTime}</TableCell>
                          <TableCell>{shift.endTime}</TableCell>
                          <TableCell>{shift.employeeCount || 1}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeShift(shift._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="selectEmployee">Select Employee</Label>
                    <Select
                      onValueChange={(value) => {
                        const user = users.find((u) => u._id === value);
                        setSelectedUser(user || null);
                        setSelectedDates(user?.unavailableDates || []);
                      }}
                      value={selectedUser?._id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUser && (
                    <div>
                      <Label htmlFor="maxWorkDays">Maximum Work Days</Label>
                      <Input
                        id="maxWorkDays"
                        type="number"
                        min="0"
                        max="31"
                        value={selectedUser.maxWorkDays || 22}
                        onChange={(e) => {
                          const maxDays = parseInt(e.target.value);
                          updateUserMaxWorkDays(selectedUser._id, maxDays);
                          setSelectedUser({
                            ...selectedUser,
                            maxWorkDays: maxDays,
                          });
                        }}
                      />
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Select Unavailable Dates
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on dates when {selectedUser.name} is not available
                      to work
                    </p>

                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        className="rounded-md border"
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                      />
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">
                        Selected Unavailable Dates:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No dates selected
                          </p>
                        ) : (
                          selectedDates.map((date, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {format(date, "yyyy-MM-dd")}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => toggleDateSelection(date)}
                              />
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">
                        Assign Available Shifts
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select which shifts {selectedUser.name} can work
                      </p>

                      <div className="space-y-2">
                        {shifts.map((shift) => {
                          // Check if this shift is assigned to the user
                          const assignment = userShiftAssignments.find(
                            (a) => a.userId === selectedUser._id
                          );
                          const isAssigned = assignment?.allowedShifts.includes(
                            shift._id
                          );

                          return (
                            <div
                              key={shift._id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={`shift-${shift._id}`}
                                checked={isAssigned}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;

                                  setUserShiftAssignments((prev) => {
                                    // Find if user already has assignments
                                    const existingIndex = prev.findIndex(
                                      (a) => a.userId === selectedUser._id
                                    );

                                    if (existingIndex >= 0) {
                                      // Update existing assignment
                                      const updated = [...prev];
                                      if (isChecked) {
                                        // Add shift to allowed shifts
                                        updated[existingIndex] = {
                                          ...updated[existingIndex],
                                          allowedShifts: [
                                            ...updated[existingIndex]
                                              .allowedShifts,
                                            shift._id,
                                          ],
                                        };
                                      } else {
                                        // Remove shift from allowed shifts
                                        updated[existingIndex] = {
                                          ...updated[existingIndex],
                                          allowedShifts: updated[
                                            existingIndex
                                          ].allowedShifts.filter(
                                            (id) => id !== shift._id
                                          ),
                                        };
                                      }
                                      return updated;
                                    } else {
                                      // Create new assignment for this user
                                      return [
                                        ...prev,
                                        {
                                          userId: selectedUser._id,
                                          allowedShifts: isChecked
                                            ? [shift._id]
                                            : [],
                                        },
                                      ];
                                    }
                                  });
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label
                                htmlFor={`shift-${shift._id}`}
                                className="text-sm font-medium"
                              >
                                {shift.name} ({shift.startTime}-{shift.endTime})
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button className="mt-4" onClick={updateUserAvailability}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-muted-foreground">
                  No employees loaded yet. Click "Load Employees" to get
                  started.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Max Work Days</TableHead>
                      <TableHead>Unavailable Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.maxWorkDays || 22}</TableCell>
                        <TableCell>
                          {user.unavailableDates?.length || 0} days
                          {user.unavailableDates &&
                            user.unavailableDates.length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="link" size="sm">
                                    View
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">
                                      Unavailable Dates
                                    </h4>
                                    <div className="max-h-[200px] overflow-y-auto">
                                      {user.unavailableDates.map(
                                        (date, index) => (
                                          <div
                                            key={index}
                                            className="text-sm py-1 border-b last:border-0"
                                          >
                                            {format(date, "Myyyy-MM-dd")}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Select Month</Label>
                    <div className="flex mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(currentMonth, "MMMM yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={currentMonth}
                            onSelect={(date) => date && setCurrentMonth(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">
                    Schedule Generation Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The system will generate a schedule based on:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Employee availability (unavailable dates)</li>
                    <li>Maximum work days per employee</li>
                    <li>Defined shifts</li>
                    <li>Fair distribution of shifts</li>
                  </ul>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={generateSchedule}
                    disabled={
                      loading || users.length === 0 || shifts.length === 0
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Schedule"
                    )}
                  </Button>

                  {schedule.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={generateSchedule}
                      disabled={loading}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Tab */}
        <TabsContent value="view" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">
                Monthly Schedule: {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                {schedule.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={exportToExcel}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export to Excel
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {format(currentMonth, "MMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={currentMonth}
                      onSelect={(date) => date && setCurrentMonth(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Schedule Available</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    No schedule has been generated for this month yet.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() =>
                      document.querySelector('[data-value="generate"]')?.click()
                    }
                  >
                    Go to Generate Schedule
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                          <TableHead className="w-[120px] font-medium">
                            Date
                          </TableHead>
                          {shifts.map((shift) => (
                            <TableHead
                              key={shift._id}
                              className="font-medium text-center"
                            >
                              <div className="flex flex-col items-center">
                                <span>{shift.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {shift.startTime}-{shift.endTime}
                                </span>
                                {/* Add employee count badge */}
                                {schedule.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="mt-1 bg-primary/10"
                                  >
                                    {schedule.reduce((count, day) => {
                                      return (
                                        count +
                                        day.assignments.filter(
                                          (a) => a.shiftId === shift._id
                                        ).length
                                      );
                                    }, 0)}{" "}
                                    employees
                                  </Badge>
                                )}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedule.map((day) => {
                          const isWeekendDay = isWeekend(day.date);
                          return (
                            <TableRow
                              key={day.date.toISOString()}
                              className={isWeekendDay ? "bg-muted/30" : ""}
                            >
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span
                                    className={isWeekendDay ? "font-bold" : ""}
                                  >
                                    {format(day.date, "EEE")}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {format(day.date, "yyyy-MM-dd")}
                                  </span>
                                </div>
                              </TableCell>
                              {shifts.map((shift) => {
                                // Get all assignments for this shift on this day
                                const shiftAssignments = day.assignments.filter(
                                  (a) => a.shiftId === shift._id
                                );
                                const assignmentCount = shiftAssignments.length;

                                return (
                                  <TableCell
                                    key={shift._id}
                                    className="text-center"
                                  >
                                    {assignmentCount > 0 ? (
                                      <div className="flex flex-col items-center gap-1 py-1">
                                        <div className="flex flex-wrap justify-center gap-1">
                                          {shiftAssignments.map(
                                            (assignment) => (
                                              <Avatar
                                                key={assignment.userId}
                                                className="h-8 w-8"
                                              >
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                  {assignment.userName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                                </AvatarFallback>
                                              </Avatar>
                                            )
                                          )}
                                        </div>
                                        <Badge
                                          variant="secondary"
                                          className="mt-1"
                                        >
                                          {assignmentCount}{" "}
                                          {assignmentCount === 1
                                            ? "employee"
                                            : "employees"}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-muted/50 text-muted-foreground border-dashed"
                                      >
                                        Unassigned
                                      </Badge>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
