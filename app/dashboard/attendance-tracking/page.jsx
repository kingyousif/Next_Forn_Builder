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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  format,
  parseISO,
  differenceInMinutes,
  subHours,
  isWithinInterval,
  parse,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function AttendanceTracking() {
  // State for attendance data and time management profiles
  const [attendanceData, setAttendanceData] = useState([]);
  const [timeProfiles, setTimeProfiles] = useState([]);
  const [rawAttendanceData, setRawAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const url = process.env.NEXT_PUBLIC_API_URL || "";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    fromDate: "",
    toDate: "",
    attendance: "", // on-time, late, early, absent
  });

  // Fetch data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [profilesData, employeesData] = await Promise.all([
          fetchTimeProfiles(),
          fetchEmployees(),
        ]);

        // Set the first employee as the default filter if available
        if (employeesData && employeesData.length > 0) {
          setFilters((prev) => ({
            ...prev,
            employee: employeesData[0]._id || employeesData[0].userId,
          }));
        }

        await fetchAttendanceData();
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Effect to process data when filters change
  useEffect(() => {
    if (rawAttendanceData.length > 0) {
      processAttendanceData();
    }
  }, [filters, currentPage, recordsPerPage]);

  // API calls
  const fetchTimeProfiles = async () => {
    try {
      const response = await axios.post(`${url}timeManagement/fetch`);
      setTimeProfiles(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching time profiles:", err);
      throw err;
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${url}attendanceUser/fetch`);
      setEmployees(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching employees:", err);
      throw err;
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}attendance/fetch`);

      // Sort data by timestamp in descending order (newest first)
      const sortedData = [...response.data].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // Modify timestamps to adjust for timezone offset
      const modifiedData = sortedData.map((record) => {
        const modifiedTimestamp = subHours(new Date(record.timestamp), 3);
        return { ...record, timestamp: modifiedTimestamp };
      });

      setRawAttendanceData(modifiedData);
      processAttendanceData(modifiedData);
      return modifiedData;
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data");
      setIsLoading(false);
      throw err;
    }
  };

  // Process attendance data with filters and time profiles
  const processAttendanceData = (data = rawAttendanceData) => {
    try {
      // Apply filters
      let filteredData = [...data];

      // Filter by employee
      if (filters.employee && filters.employee !== "All") {
        filteredData = filteredData.filter((record) => {
          const employee = employees.find(
            (emp) => emp.name === record.user_name
          );
          return (
            employee &&
            (employee._id === filters.employee ||
              employee.userId === filters.employee)
          );
        });
      }

      // Filter by status
      if (filters.status && filters.status !== "All") {
        filteredData = filteredData.filter(
          (record) => record.status === filters.status
        );
      }

      // Filter by date range if both from and to dates are provided
      if (filters.fromDate && filters.toDate) {
        const fromDate = new Date(filters.fromDate);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);

        filteredData = filteredData.filter((record) => {
          const recordDate = new Date(record.timestamp);
          return recordDate >= fromDate && recordDate <= toDate;
        });
      }
      // Filter by from date only
      else if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        fromDate.setHours(0, 0, 0, 0);

        filteredData = filteredData.filter((record) => {
          const recordDate = new Date(record.timestamp);
          return recordDate >= fromDate;
        });
      }
      // Filter by to date only
      else if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);

        filteredData = filteredData.filter((record) => {
          const recordDate = new Date(record.timestamp);
          return recordDate <= toDate;
        });
      }

      // Process attendance status before applying attendance filter
      filteredData = filteredData.map((record) => {
        // Find employee by name
        const employee = employees.find((emp) => emp.name === record.user_name);

        // Find the time profile for this user based on userId
        const profile = employee
          ? findTimeProfileForUser(employee.userId || employee._id)
          : null;

        let attendanceStatus = "unknown";
        let statusMessage = "";

        if (profile) {
          // Parse profile start and end times
          const [startHour, startMinute] = profile.startTime
            .split(":")
            .map(Number);
          const [endHour, endMinute] = profile.endTime.split(":").map(Number);

          // Create date objects for comparison
          const recordDate = new Date(record.timestamp);
          const recordDay = new Date(record.timestamp);
          recordDay.setHours(0, 0, 0, 0);
          recordDay.setHours(recordDay.getHours() + 6); // Convert UTC to Baghdad time

          const profileStartTime = new Date(recordDay);
          profileStartTime.setHours(startHour, startMinute, 0);

          const profileEndTime = new Date(recordDay);
          profileEndTime.setHours(endHour, endMinute, 0);

          // Check if check-in is late or early
          if (record.status === "Check-in") {
            const minutesDifference = differenceInMinutes(
              recordDate,
              profileStartTime
            );

            if (minutesDifference <= 0) {
              // Early or on time
              if (Math.abs(minutesDifference) > profile.graceMinutesEarly) {
                attendanceStatus = "early";
                statusMessage = `${Math.abs(minutesDifference)} min early`;
              } else {
                attendanceStatus = "on-time";
                statusMessage = "On time";
              }
            } else {
              // Late
              if (minutesDifference > profile.graceMinutesLate) {
                attendanceStatus = "late";
                statusMessage = `${minutesDifference} min late`;
              } else {
                attendanceStatus = "on-time";
                statusMessage = "Within grace period";
              }
            }
          }

          // Check if check-out is early or late
          if (record.status === "Check-out") {
            const minutesDifference = differenceInMinutes(
              recordDate,
              profileEndTime
            );

            if (minutesDifference >= 0) {
              // Late check-out or on time
              attendanceStatus = "on-time";
              statusMessage =
                minutesDifference > 0
                  ? `${minutesDifference} min overtime`
                  : "On time";
            } else {
              // Early check-out
              if (Math.abs(minutesDifference) > profile.graceMinutesEarly) {
                attendanceStatus = "early";
                statusMessage = `${Math.abs(minutesDifference)} min early`;
              } else {
                attendanceStatus = "on-time";
                statusMessage = "Within grace period";
              }
            }
          }
        } else {
          // No profile assigned
          attendanceStatus = "unassigned";
          statusMessage = "No time profile";
        }

        return {
          ...record,
          attendanceStatus,
          statusMessage,
          profile: profile || {
            name: "Unassigned",
            workHoursPerDay: "-",
            workDaysPerWeek: "-",
            startTime: "-",
            endTime: "-",
            graceMinutesLate: "-",
            graceMinutesEarly: "-",
          },
        };
      });

      // Apply attendance status filter after processing
      if (filters.attendance && filters.attendance !== "All") {
        filteredData = filteredData.filter(
          (record) => record.attendanceStatus === filters.attendance
        );
      }

      // Set total records count for pagination
      setTotalRecords(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / recordsPerPage));

      // Apply pagination to the filtered data
      const startIndex = (currentPage - 1) * recordsPerPage;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + recordsPerPage
      );

      setAttendanceData(paginatedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing attendance data:", err);
      setError("Failed to process attendance data");
      setIsLoading(false);
    }
  };

  // Helper to find the time profile for a user - memoized to improve performance
  const findTimeProfileForUser = useMemo(() => {
    // Create a mapping of userId to profile for faster lookups
    const profileMap = {};

    return (userId) => {
      if (!userId) return null;

      // Check if we've already cached this lookup
      if (profileMap[userId]) return profileMap[userId];

      // Find the profile for this user
      for (const profile of timeProfiles) {
        // Check if userId is in the userId array (convert to string for comparison)
        const userIdStr = String(userId);
        if (profile.userId && profile.userId.includes(userIdStr)) {
          // Cache the result
          profileMap[userId] = profile;
          return profile;
        }
      }

      // Cache the negative result
      profileMap[userId] = null;
      return null;
    };
  }, [timeProfiles]);

  // Reset filters
  const handleResetFilters = () => {
    // Only reset non-employee filters to keep showing the same employee
    setFilters((prev) => ({
      ...prev,
      status: "",
      fromDate: "",
      toDate: "",
      attendance: "",
    }));
    setCurrentPage(1);
  };

  // Get the status badge variant based on attendance status
  const getAttendanceStatusBadge = (status) => {
    switch (status) {
      case "on-time":
        return (
          <Badge variant="success" className="bg-green-500">
            On Time
          </Badge>
        );
      case "late":
        return <Badge variant="destructive">Late</Badge>;
      case "early":
        return (
          <Badge variant="warning" className="bg-yellow-500">
            Early
          </Badge>
        );
      case "unassigned":
        return <Badge variant="outline">Unassigned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get the status icon based on attendance status
  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case "on-time":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "late":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "early":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "unassigned":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Memoized filtered list: only 10 shown unless search input matches
  const filteredEmployees = useMemo(() => {
    if (!searchInput) return employees.slice(0, 10); // Limit to 10 if no search
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, employees]);

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; // Show max 5 page numbers at once

    // Calculate range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }

    return items;
  };

  // Active employee name for display
  const activeEmployeeName = useMemo(() => {
    if (filters.employee) {
      const employee = employees.find(
        (emp) => emp._id === filters.employee || emp.userId === filters.employee
      );
      return employee ? employee.name : "All Employees";
    }
    return "All Employees";
  }, [filters.employee, employees]);

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                Employee Attendance Tracking
              </CardTitle>
              <CardDescription className="mt-1">
                Monitor employee check-ins, check-outs, and compliance with time
                schedules
              </CardDescription>
            </div>
            <div className="mt-2 md:mt-0">
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 font-medium"
              >
                Viewing: {activeEmployeeName}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 border rounded-md p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Filter size={18} />
              Filter Attendance Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="employee-filter" className="mb-2 block">
                  Employee
                </Label>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {filters.employee
                        ? employees.find(
                            (emp) =>
                              emp._id === filters.employee ||
                              emp.userId === filters.employee
                          )?.name
                        : "Select employee"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search employees..."
                        value={searchInput}
                        onValueChange={setSearchInput}
                      />
                      <CommandGroup>
                        {filteredEmployees.map((employee) => (
                          <CommandItem
                            key={employee._id || employee.userId}
                            value={employee.name}
                            onSelect={() => {
                              setFilters({
                                ...filters,
                                employee: employee._id || employee.userId,
                              });
                              setCurrentPage(1);
                              setOpen(false);
                              setSearchInput(""); // Clear search on select
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.employee ===
                                  (employee._id || employee.userId)
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
              </div>

              {/* <div>
                <Label htmlFor="status-filter" className="mb-2 block">
                  Status
                </Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => {
                    setFilters({ ...filters, status: value });
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    <SelectItem value="Check-in">Check-in</SelectItem>
                    <SelectItem value="Check-out">Check-out</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div>
                <Label htmlFor="attendance-filter" className="mb-2 block">
                  Attendance
                </Label>
                <Select
                  value={filters.attendance}
                  onValueChange={(value) => {
                    setFilters({ ...filters, attendance: value });
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="attendance-filter">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="on-time">On Time</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="early">Early</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <div>
                  <Label htmlFor="from-date" className="mb-2 block">
                    From
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => {
                      setFilters({ ...filters, fromDate: e.target.value });
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="to-date" className="mb-2 block">
                    To
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => {
                      setFilters({ ...filters, toDate: e.target.value });
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mr-2"
              >
                Reset Filters
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  fetchAttendanceData();
                  setCurrentPage(1);
                }}
              >
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Attendance Data Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading attendance data...</p>
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
                    fetchAttendanceData();
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableCaption>
                  Employee attendance records for {activeEmployeeName}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Time Profile</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.user_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "Check-in"
                                ? "default"
                                : record.status === "Check-out"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(record.timestamp),
                            "yyyy-MM-dd HH:mm:ss"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAttendanceStatusIcon(record.attendanceStatus)}
                            {getAttendanceStatusBadge(record.attendanceStatus)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted">
                                  {record.profile.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p>
                                    Hours: {record.profile.workHoursPerDay}h /{" "}
                                    {record.profile.workDaysPerWeek} days
                                  </p>
                                  <p>
                                    Time: {record.profile.startTime} -{" "}
                                    {record.profile.endTime}
                                  </p>
                                  <p>
                                    Grace: {record.profile.graceMinutesLate}min
                                    late / {record.profile.graceMinutesEarly}min
                                    early
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {record.statusMessage}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No attendance records found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex-1 text-sm text-gray-500">
                    Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                    {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                    {totalRecords} records
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex h-8 w-8 p-0"
                      >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center">
                        {getPaginationItems()}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="hidden sm:flex h-8 w-8 p-0"
                      >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <Select
                      value={String(recordsPerPage)}
                      onValueChange={(value) => {
                        setRecordsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={recordsPerPage} />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 20, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={String(pageSize)}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {attendanceData.length} record(s) found on this page
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAttendanceData()}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh Data
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Guidelines</CardTitle>
          <CardDescription>
            Understanding attendance tracking and compliance with schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h4 className="font-medium">On Time</h4>
                  <p className="text-sm text-gray-500">
                    Arrival and departure that comply with the scheduled time or
                    are within the configured grace period.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <h4 className="font-medium">Late Arrival</h4>
                  <p className="text-sm text-gray-500">
                    Check-in after the scheduled start time that exceeds the
                    configured grace period.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <div>
                  <h4 className="font-medium">Early Departure</h4>
                  <p className="text-sm text-gray-500">
                    Check-out before the scheduled end time that exceeds the
                    configured early departure grace period.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-medium">Time Profiles</h4>
                  <p className="text-sm text-gray-500">
                    Employees are tracked based on their assigned time
                    management profiles, which define work hours and grace
                    periods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
