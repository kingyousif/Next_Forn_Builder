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
import { Download, FileSpreadsheet, User } from "lucide-react";
import { format, isFriday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  allowedShifts?: string[];
  isFridayOff?: boolean; // <-- Add this line
}

interface Shift {
  _id: string;
  id?: string;
  name: string;
  startTime: string;
  endTime: string;
  employeeCount: number;
}

interface ScheduleDay {
  date: Date;
  assignments: {
    userId: string;
    userName: string;
    shiftId: string;
  }[];
}

interface UserShiftAssignment {
  userId: string;
  allowedShifts: string[];
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
  const [userShiftAssignments, setUserShiftAssignments] = useState<
    UserShiftAssignment[]
  >([]);
  const [userAvailability, setUserAvailability] = useState([]);
  const [newShift, setNewShift] = useState<Omit<Shift, "_id" | "id">>({
    name: "",
    startTime: "",
    endTime: "",
    employeeCount: 1,
  });
  const url = process.env.NEXT_PUBLIC_API_URL;
  const { token, user } = useAuth();

  useEffect(() => {
    shiftsFetch();
    fetchUsers();
    fetchSchedule(currentMonth);
    fetchAvailability();
  }, [currentMonth, token, url]);

  // Load all data from localStorage
  // const loadFromLocalStorage = () => {
  //   try {
  //     const savedUsers = localStorage.getItem("scheduleUsers");
  //     const savedShifts = localStorage.getItem("scheduleShifts");
  //     const savedSchedule = localStorage.getItem("scheduleData");
  //     const savedAssignments = localStorage.getItem("userShiftAssignments");

  //     if (savedUsers) {
  //       const parsedUsers = JSON.parse(savedUsers);
  //       // Convert date strings back to Date objects
  //       const usersWithDates = parsedUsers.map((user: any) => ({
  //         ...user,
  //         unavailableDates: user.unavailableDates
  //           ? user.unavailableDates.map((dateStr: string) => new Date(dateStr))
  //           : [],
  //       }));
  //       setUsers(usersWithDates);
  //     }

  //     if (savedShifts) {
  //       setShifts(JSON.parse(savedShifts));
  //     }

  //     if (savedSchedule) {
  //       const parsedSchedule = JSON.parse(savedSchedule);
  //       // Convert date strings back to Date objects
  //       const scheduleWithDates = parsedSchedule.map((day: any) => ({
  //         ...day,
  //         date: new Date(day.date),
  //       }));
  //       setSchedule(scheduleWithDates);
  //     }

  //     if (savedAssignments) {
  //       setUserShiftAssignments(JSON.parse(savedAssignments));
  //     }
  //   } catch (error) {
  //     console.error("Error loading from localStorage:", error);
  //   }
  // };

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
  // fetch schedule from API
  const fetchSchedule = async (selectedMonth = currentMonth) => {
    try {
      // Get first and last day of selected month
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const response = await axios.post(
        `${url}schedule/get`,
        {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
     
      setSchedule(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setSchedule([]);
      toast({
        title: "Error",
        description: "Failed to fetch schedule for selected month",
        variant: "destructive",
      });
      throw err;
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // This would be the actual API call
      const response = await axios.post(
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

  const fetchUserAvailabilityById = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}schedule/availability/get-by-id`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let userData;

      if (response.data.success === false) {
        // If no data exists in backend, create default data locally only
        const selectedUserData = users.find((u) => u._id === userId);
        if (!selectedUserData) {
          throw new Error("User not found");
        }

     

        userData = {
          _id: selectedUserData._id,
          name: selectedUserData.name,
          userName: selectedUserData.name, // Add userName property to match the format expected elsewhere
          unavailableDates: [],
          allowedShifts: [],
          maxWorkDays: 22, // Default max work days
          isFridayOff: false, // Default Friday off setting
          isNewRecord: true, // Flag to indicate this is a new record not yet saved to backend
        };

        // Don't create in backend yet - will be created when user clicks Save Changes
      } else {
        userData = response.data;
        // Ensure isFridayOff has a default value if not present
        userData.isFridayOff = userData.isFridayOff || false;
      }

      setSelectedUser(userData);
      setSelectedDates(userData.unavailableDates || []);

      // Update shift assignments based on the data
      if (userData.allowedShifts && userData.allowedShifts.length > 0) {
        setUserShiftAssignments((prev) => {
          const existingIndex = prev.findIndex(
            (a) => a.userId === userData._id
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              userId: userData._id,
              allowedShifts: userData.allowedShifts,
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                userId: userData._id,
                allowedShifts: userData.allowedShifts,
              },
            ];
          }
        });
      }
    } catch (error) {
      console.error("Error fetching user availability:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.post<User[]>(`${url}user/fetch`, {
        id: user._id || user.id,
      });

      const fetchedUsers = response.data
        .filter((user) => user.role !== "admin") // Filter out admin users
        .map((user) => ({
          ...user,
          maxWorkDays: 0, // Default max work days
          unavailableDates: [], // Default empty unavailable dates
        }));
      setUsers(fetchedUsers);
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

  // Remove user availability
  const removeUserAvailability = async (userId: string) => {

    try {
      await axios.delete(`${url}schedule/availability/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAvailability();

      toast({
        title: "Success",
        description: "User availability removed successfully",
      });
    } catch (error) {
      console.error("Error removing user availability:", error);
      toast({
        title: "Error",
        description: "Failed to remove user availability",
        variant: "destructive",
      });
    }
  };

  // Update user's unavailable dates and max work days
  // Update user's unavailable dates and max work days
  const updateUserAvailability = () => {
    if (!selectedUser) return;

    // Get the user's shift assignments
    const userAssignment = userShiftAssignments.find(
      (a) => a.userId === selectedUser._id
    );

    // Get the allowed shifts for this user (or empty array if none)
    const allowedShifts = userAssignment?.allowedShifts || [];

   

    // Send data to API
    axios
      .post(
        `${url}schedule/availability/set`,
        {
          unavailableDates: selectedDates,
          maxWorkDays: selectedUser.maxWorkDays || 22,
          userId: selectedUser._id,
          allowedShifts: allowedShifts, // Add the allowed shifts to the API payload
          isFridayOff: selectedUser.isFridayOff || false, // Add Friday off setting
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        

        fetchAvailability(); // Refresh user availability after update

        // Reset selection
        setSelectedUser(null);
        setSelectedDates([]);

        toast({
          title: "Success",
          description: `Availability and shift assignments updated for ${
            selectedUser.name || selectedUser.userName
          }`,
        });
      })
      .catch((err) => {
        console.error("Error updating availability:", err);
        toast({
          title: "Error",
          description: "Failed to update availability and shifts",
          variant: "destructive",
        });
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
  // Generate a schedule for the current month
  const generateSchedule = () => {
    if (shifts.length === 0 || userAvailability.length === 0) {
      toast({
        title: "Error",
        description:
          "Please add users, shifts, and ensure employee availability data is loaded before generating schedule",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const scheduleData: ScheduleDay[] = [];

      // Track how many days each user has been assigned
      const userWorkDaysCount: { [userId: string]: number } = {};

      // Only use users from userAvailability list
      userAvailability.forEach((user) => {
        userWorkDaysCount[user._id] = 0;
      });

      // For each day in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const assignments: {
          userId: string;
          userName: string;
          shiftId: string;
        }[] = [];

        // Track which users are already assigned to this day to prevent multiple shifts per day
        const assignedUsersForDay = new Set<string>();

        // Sort shifts by start time to prioritize earlier shifts
        const sortedShifts = [...shifts].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

        // For each shift, assign required number of employees
        sortedShifts.forEach((shift) => {
          const requiredEmployees = shift.employeeCount;
          let assignedCount = 0;

          // Get available employees for this shift on this day
          let availableEmployees = userAvailability.filter((user) => {
            // Skip if user is already assigned to any shift on this day
            if (assignedUsersForDay.has(user._id)) return false;

            // Check if user has Fridays off and today is Friday
            if (user.isFridayOff && isFriday(date)) {
              return false;
            }

            // Check if user has marked this date as unavailable
            const isUnavailable = user.unavailableDates?.some(
              (unavailableDate) => {
                const unavailableDay = new Date(unavailableDate);
                return (
                  unavailableDay.getDate() === date.getDate() &&
                  unavailableDay.getMonth() === date.getMonth() &&
                  unavailableDay.getFullYear() === date.getFullYear()
                );
              }
            );
            if (isUnavailable) return false;

            // Check if user has reached their max work days
            if (userWorkDaysCount[user._id] >= (user.maxWorkDays || 22))
              return false;

            // Check if user is allowed to work this shift
            if (user.allowedShifts && user.allowedShifts.length > 0) {
              return user.allowedShifts.includes(shift._id);
            }

            // If no specific shift assignments are set, the user is not eligible
            return false;
          });

          // Sort available employees by workload (prioritize those with fewer assignments)
          availableEmployees.sort(
            (a, b) => userWorkDaysCount[a._id] - userWorkDaysCount[b._id]
          );

          // Assign employees to this shift
          while (
            assignedCount < requiredEmployees &&
            availableEmployees.length > 0
          ) {
            // Take the first available employee (with lowest current workload)
            const selectedEmployee = availableEmployees[0];

            assignments.push({
              userId: selectedEmployee._id,
              userName: selectedEmployee.userName,
              shiftId: shift._id,
            });

            // Mark this user as assigned for this day
            assignedUsersForDay.add(selectedEmployee._id);

            // Remove selected employee from available list
            availableEmployees.splice(0, 1);
            assignedCount++;
            userWorkDaysCount[selectedEmployee._id]++;
          }
        });

        scheduleData.push({
          date,
          assignments,
        });
      }

      axios
        .post(`${url}schedule/batch-create`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
       
        });

      setSchedule(scheduleData);
  

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

  // Get shift by ID
  const getShiftById = (shiftId: string) => {
    return shifts.find(
      (shift) => shift._id === shiftId || shift.id === shiftId
    );
  };

  // Export to CSV
  const exportToExcel = () => {
    if (schedule.length === 0) return;

    try {
      const headers = [
        "Date",
        ...shifts.map((s) => `${s.name} (${s.startTime}-${s.endTime})`),
      ].join(",");

      const rows = schedule
        .map((day) => {
          const date = format(day.date, "yyyy-MM-dd");
          const shiftData = shifts.map((shift) => {
            const shiftAssignments = day.assignments.filter(
              (a) => a.shiftId === shift._id
            );
            return shiftAssignments.length > 0
              ? `"${shiftAssignments.map((a) => a.userName).join(", ")}"`
              : "";
          });

          return [`"${date}"`, ...shiftData].join(",");
        })
        .join("\n");

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
                    min="0"
                    max="31"
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
                        <TableRow key={shift._id}>
                          <TableCell>{shift.name}</TableCell>
                          <TableCell>{shift.startTime}</TableCell>
                          <TableCell>{shift.endTime}</TableCell>
                          <TableCell>{shift.employeeCount}</TableCell>
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
              <CardTitle>Employee Availability & Shift Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="selectEmployee">Select Employee</Label>
                    <Select
                      onValueChange={(value) => {
                        fetchUserAvailabilityById(value);
                      }}
                      value={selectedUser?._id || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee">
                          {selectedUser
                            ? selectedUser.name || selectedUser.userName
                            : "Select an employee"}
                        </SelectValue>
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
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fridayOff"
                        checked={selectedUser.isFridayOff || false}
                        onChange={(e) => {
                          setSelectedUser({
                            ...selectedUser,
                            isFridayOff: e.target.checked,
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor="fridayOff"
                        className="text-sm font-medium"
                      >
                        Employee has Fridays off
                      </Label>
                    </div>
                  )}

                  {selectedUser && (
                    <div>
                      <Label htmlFor="maxWorkDays">
                        Maximum Work Days per Month
                      </Label>
                      <Input
                        id="maxWorkDays"
                        type="number"
                        min="1"
                        max="31"
                        value={selectedUser.maxWorkDays || 22}
                        onChange={(e) => {
                          const maxDays = parseInt(e.target.value) || 22;
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
                  <>
                    {/* Unavailable Dates Section */}
                    <div className="mt-6">
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
                          selected={selectedDates.map((date) => new Date(date))}
                          onSelect={setSelectedDates}
                          className="rounded-md border"
                          modifiers={{
                            unavailable: selectedDates.map(
                              (date) => new Date(date)
                            ),
                          }}
                          modifiersStyles={{
                            unavailable: {
                              color: "#ef4444",
                              fontWeight: "bold",
                              textDecoration: "line-through",
                            },
                          }}
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
                                  onClick={() => {
                                    setSelectedDates(
                                      selectedDates.filter(
                                        (_, i) => i !== index
                                      )
                                    );
                                  }}
                                />
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shift Assignment Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">
                        Assign Available Shifts
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select which shifts {selectedUser.name} can work
                      </p>

                      <div className="space-y-2">
                        {shifts.map((shift) => {
                          const assignment = userShiftAssignments.find(
                            (a) => a.userId === selectedUser._id
                          );
                          const isAssigned =
                            assignment?.allowedShifts.includes(shift._id) ||
                            false;

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
                                    const existingIndex = prev.findIndex(
                                      (a) => a.userId === selectedUser._id
                                    );

                                    if (existingIndex >= 0) {
                                      const updated = [...prev];
                                      if (isChecked) {
                                        updated[existingIndex] = {
                                          ...updated[existingIndex],
                                          allowedShifts: [
                                            ...updated[existingIndex]
                                              .allowedShifts,
                                            shift._id,
                                          ],
                                        };
                                      } else {
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
                                - Needs {shift.employeeCount} employees
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button className="mt-4" onClick={updateUserAvailability}>
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employee List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
            </CardHeader>
            <CardContent>
              {userAvailability.length === 0 ? (
                <p className="text-muted-foreground">
                  No employees loaded yet. Click "Load Employees" to get
                  started.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Max Work Days</TableHead>
                      <TableHead>Unavailable Days</TableHead>
                      <TableHead>Friday Off</TableHead>
                      <TableHead>Assigned Shifts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAvailability.map((user) => {
                      const assignedShifts = user.allowedShifts || [];

                      return (
                        <TableRow key={user._id}>
                          <TableCell>{user.userName}</TableCell>
                          <TableCell>{user.maxWorkDays || 22}</TableCell>
                          <TableCell>
                            {user.unavailableDates?.length || 0} days
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.isFridayOff ? "secondary" : "outline"
                              }
                            >
                              {user.isFridayOff ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignedShifts.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedShifts.map((shift) => (
                                  <Badge key={shift} variant="secondary">
                                    {shifts.map((s) => {
                                      if (s._id === shift) {
                                        return (
                                          s.name +
                                          " " +
                                          s.startTime +
                                          " - " +
                                          s.endTime
                                        );
                                      }
                                    })}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No shifts assigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                removeUserAvailability(user.userId)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                            onSelect={(date) => {
                              if (date) {
                                setCurrentMonth(date);
                                fetchSchedule(date);
                              }
                            }}
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
                    <li>Shift requirements (number of employees needed)</li>
                    <li>Employee-shift assignments</li>
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
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Schedule
                      </>
                    )}
                  </Button>

                  {schedule.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={generateSchedule}
                      disabled={loading}
                    >
                      Regenerate Schedule
                    </Button>
                  )}
                </div>

                {/* Generation Summary */}
                {schedule.length > 0 && (
                  <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Generation Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Days:</span>{" "}
                        {schedule.length}
                      </div>
                      <div>
                        <span className="font-medium">Total Assignments:</span>{" "}
                        {schedule.reduce(
                          (sum, day) => sum + day.assignments.length,
                          0
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Month:</span>{" "}
                        {format(currentMonth, "MMMM yyyy")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Schedule Tab */}
        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Schedule for {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(currentMonth, "MMMM yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={currentMonth}
                        onSelect={(date) => {
                          if (date) {
                            setCurrentMonth(date);
                            fetchSchedule(date);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {schedule.length > 0 && (
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <div className="text-center py-8">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Data Available for {format(currentMonth, "MMMM yyyy")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    There is no schedule data for the selected month. You can
                    generate a schedule or select a different month.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        // Switch to generate tab
                        const generateTab =
                          document.querySelector('[value="generate"]');
                        generateTab?.click();
                      }}
                    >
                      Generate Schedule
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchSchedule(currentMonth)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Schedule Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {shifts.map((shift) => {
                      const shiftAssignments = schedule.reduce(
                        (sum, day) =>
                          sum +
                          day.assignments.filter((a) => a.shiftId === shift._id)
                            .length,
                        0
                      );
                      return (
                        <Card key={shift._id}>
                          <CardContent className="p-4">
                            <h4 className="font-medium text-sm">
                              {shift.name}
                            </h4>
                            <p className="text-2xl font-bold">
                              {shiftAssignments}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total assignments
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Schedule Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="w-32">Date</TableHead>
                            <TableHead className="w-20">Day</TableHead>
                            {shifts.map((shift) => (
                              <TableHead key={shift._id} className="min-w-48">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {shift.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {shift.startTime} - {shift.endTime}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({shift.employeeCount} needed)
                                  </span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.map((day) => (
                            <TableRow key={day.date}>
                              <TableCell className="font-medium">
                                {format(day.date, "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    isFriday(day.date) ? "secondary" : "outline"
                                  }
                                >
                                  {format(day.date, "EEE")}
                                </Badge>
                              </TableCell>
                              {shifts.map((shift) => {
                                const shiftAssignments = day.assignments.filter(
                                  (a) => a.shiftId === shift._id
                                );
                                return (
                                  <TableCell key={shift._id}>
                                    {shiftAssignments.length === 0 ? (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Understaffed
                                      </Badge>
                                    ) : (
                                      <div className="space-y-1">
                                        {shiftAssignments.map(
                                          (assignment, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center gap-2"
                                            >
                                              <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">
                                                  {assignment.userName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-sm">
                                                {assignment.userName}
                                              </span>
                                            </div>
                                          )
                                        )}
                                        {shiftAssignments.length <
                                          shift.employeeCount && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Need{" "}
                                            {shift.employeeCount -
                                              shiftAssignments.length}{" "}
                                            more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>

                  {/* Employee Work Summary */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Employee Work Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Days Assigned</TableHead>
                            <TableHead>Max Days</TableHead>
                            <TableHead>Utilization</TableHead>
                            <TableHead>Shifts</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userAvailability
                            .map((user) => {
                              const userAssignments = schedule.reduce(
                                (sum, day) =>
                                  sum +
                                  day.assignments.filter(
                                    (a) => a.userId === user._id
                                  ).length,
                                0
                              );

                              // Only show users who have been assigned at least one day
                              if (userAssignments === 0) return null;

                              const maxDays = user.maxWorkDays || 22;
                              const utilization = Math.round(
                                (userAssignments / maxDays) * 100
                              );

                              const userShifts = schedule
                                .flatMap((day) =>
                                  day.assignments.filter(
                                    (a) => a.userId === user._id
                                  )
                                )
                                .reduce((acc, assignment) => {
                                  const shift = getShiftById(
                                    assignment.shiftId
                                  );
                                  if (shift) {
                                    acc[shift.name] =
                                      (acc[shift.name] || 0) + 1;
                                  }
                                  return acc;
                                }, {} as Record<string, number>);

                              return (
                                <TableRow key={user._id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                          {user.userName
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      {user.userName}
                                    </div>
                                  </TableCell>
                                  <TableCell>{userAssignments}</TableCell>
                                  <TableCell>{maxDays}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={`h-full transition-all ${
                                            utilization > 90
                                              ? "bg-red-500"
                                              : utilization > 70
                                              ? "bg-yellow-500"
                                              : "bg-green-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(
                                              utilization,
                                              100
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs">
                                        {utilization}%
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {Object.entries(userShifts).map(
                                        ([shiftName, count]) => (
                                          <Badge
                                            key={shiftName}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {shiftName}: {count}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                            .filter(Boolean)}{" "}
                          {/* Remove null entries */}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
