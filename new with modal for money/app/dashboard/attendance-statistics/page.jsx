"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  ChevronDown,
  BarChart3,
  PieChart,
  Download,
  Check,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  addDays,
  isWeekend,
  subHours,
  differenceInMinutes,
  parse,
} from "date-fns";

// Import recharts for visualizations
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function AttendanceStatistics() {
  // States for filters and data
  const [employees, setEmployees] = useState([]);
  const [timeProfiles, setTimeProfiles] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalCheckins: 0,
    onTime: 0,
    late: 0,
    early: 0,
    absent: 0,
    complianceRate: 0,
  });
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // Chart data
  const [dailyAttendanceData, setDailyAttendanceData] = useState([]);
  const [statusDistributionData, setStatusDistributionData] = useState([]);
  const [employeeComplianceData, setEmployeeComplianceData] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Colors for charts
  const COLORS = ["#4ade80", "#f43f5e", "#facc15", "#94a3b8"];

  // Filters
  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    fromDate: "",
    toDate: "",
    attendance: "", // on-time, late, early, absent
  });

  useEffect(() => {
    // Fetch initial data
    fetchTimeProfiles();
    fetchEmployees();
    fetchAttendanceStats();
  }, []);

  // Effect to update data when filters change
  useEffect(() => {
    fetchAttendanceStats();
  }, [selectedEmployee, dateRange]);

  // API calls
  const url = process.env.NEXT_PUBLIC_API_URL || "";

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
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch employees");
      setIsLoading(false);
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

      // Modify timestamps to adjust for timezone offset and calculate attendance status
      const modifiedData = sortedData.map((record) => {
        const modifiedTimestamp = subHours(new Date(record.timestamp), 3);

        // Find matching time profile for the user
        const userTimeProfile = timeProfiles.find((profile) =>
          profile.userId.includes(
            employees.find((emp) => emp.name === record.user_name)?.userId
          )
        );

        // Calculate attendance status based on time profile
        const attendanceStatus =
          record.status === "Check-in"
            ? calculateAttendanceStatus(modifiedTimestamp, userTimeProfile)
            : "checkout";

        return {
          ...record,
          timestamp: modifiedTimestamp,
          attendance_status: attendanceStatus,
          expected_time: userTimeProfile
            ? new Date(modifiedTimestamp).setHours(
                ...userTimeProfile.startTime.split(":").map(Number),
                0,
                0
              )
            : null,
          minutes_diff: userTimeProfile
            ? differenceInMinutes(
                modifiedTimestamp,
                new Date(modifiedTimestamp).setHours(
                  ...userTimeProfile.startTime.split(":").map(Number),
                  0,
                  0
                )
              )
            : null,
        };
      });

      setAttendanceRecords(modifiedData);
      return modifiedData;
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data");
      setIsLoading(false);
      throw err;
    }
  };

  const calculateAttendanceStatus = (checkInTime, timeProfile) => {
    if (!timeProfile) return "unassigned";

    const checkInDate = new Date(checkInTime);
    const [startHour, startMinute] = timeProfile.startTime
      .split(":")
      .map(Number);

    const expectedTime = new Date(checkInDate);
    expectedTime.setHours(startHour, startMinute, 0, 0);

    const earlyLimit = new Date(expectedTime);
    earlyLimit.setMinutes(
      earlyLimit.getMinutes() - timeProfile.graceMinutesEarly
    );

    const lateLimit = new Date(expectedTime);
    lateLimit.setMinutes(lateLimit.getMinutes() + timeProfile.graceMinutesLate);

    if (checkInDate <= lateLimit && checkInDate >= earlyLimit) {
      return "on-time";
    } else if (checkInDate < earlyLimit) {
      return "early";
    } else {
      return "late";
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      setIsLoading(true);
      const attendanceData = await fetchAttendanceData();
      attendanceData;

      // Filter data based on date range
      const filteredData = attendanceData.filter((record) => {
        const recordDate = new Date(record.timestamp);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return recordDate >= startDate && recordDate <= endDate;
      });

      // Filter by selected employee if any
      const employeeData = filters.employee
        ? filteredData.filter((record) => {
            // Find the selected employee
            const selectedEmp = employees.find(
              (emp) =>
                emp._id === filters.employee || emp.userId === filters.employee
            );
            // Match records by employee name
            return selectedEmp && record.user_name === selectedEmp.name;
          })
        : filteredData;

      // Calculate statistics
      const checkIns = employeeData.filter(
        (record) => record.status === "Check-in"
      );

      const onTimeCount = checkIns.filter(
        (record) =>
          record.attendanceStatus === "on-time" ||
          record.attendance_status === "on-time"
      ).length;

      const lateCount = checkIns.filter(
        (record) =>
          record.attendanceStatus === "late" ||
          record.attendance_status === "late"
      ).length;
      const earlyCount = checkIns.filter(
        (record) =>
          record.attendanceStatus === "early" ||
          record.attendance_status === "early"
      ).length;
      const unassignedCount = checkIns.filter(
        (record) =>
          record.attendanceStatus === "unassigned" ||
          record.attendance_status === "unassigned"
      ).length;

      const totalCheckins = checkIns.length;
      const complianceRate =
        totalCheckins > 0 ? Math.round((onTimeCount / totalCheckins) * 100) : 0;

      // Set attendance stats
      setAttendanceStats({
        totalCheckins: totalCheckins,
        onTime: onTimeCount,
        late: lateCount,
        early: earlyCount,
        absent: 0,
        unassigned: unassignedCount,
        complianceRate: complianceRate,
      });

      // Prepare data for charts
      prepareDailyAttendanceData(employeeData);
      prepareStatusDistributionData(checkIns);
      prepareEmployeeComplianceData(filteredData);

      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch attendance statistics");
      setIsLoading(false);
      console.error("Error fetching attendance stats:", err);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchInput) return employees.slice(0, 10); // Limit to 10 if no search
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, employees]);

  // Prepare data for daily attendance chart
  const prepareDailyAttendanceData = (attendanceData) => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const days = eachDayOfInterval({ start, end });

    const dailyData = days.map((day) => {
      const dayString = format(day, "yyyy-MM-dd");
      const dayRecords = attendanceData.filter(
        (record) =>
          format(new Date(record.timestamp), "yyyy-MM-dd") === dayString
      );

      const onTime = dayRecords.filter(
        (record) =>
          record.status === "Check-in" &&
          (record.attendanceStatus === "on-time" ||
            record.attendance_status === "on-time")
      ).length;

      const late = dayRecords.filter(
        (record) =>
          record.status === "Check-in" &&
          (record.attendanceStatus === "late" ||
            record.attendance_status === "late")
      ).length;

      const early = dayRecords.filter(
        (record) =>
          record.status === "Check-in" &&
          (record.attendanceStatus === "early" ||
            record.attendance_status === "early")
      ).length;

      const unassigned = dayRecords.filter(
        (record) =>
          record.status === "Check-in" &&
          (record.attendanceStatus === "unassigned" ||
            record.attendance_status === "unassigned")
      ).length;

      return {
        date: format(day, "MMM dd"),
        onTime,
        late,
        early,
        unassigned,
      };
    });

    setDailyAttendanceData(dailyData);
  };

  // Prepare data for status distribution pie chart
  const prepareStatusDistributionData = (checkIns) => {
    const data = [
      {
        name: "On Time",
        value: checkIns.filter(
          (r) =>
            r.attendanceStatus === "on-time" ||
            r.attendance_status === "on-time"
        ).length,
      },
      {
        name: "Late",
        value: checkIns.filter(
          (r) => r.attendanceStatus === "late" || r.attendance_status === "late"
        ).length,
      },
      {
        name: "Early",
        value: checkIns.filter(
          (r) =>
            r.attendanceStatus === "early" || r.attendance_status === "early"
        ).length,
      },
      {
        name: "Unassigned",
        value: checkIns.filter(
          (r) =>
            r.attendanceStatus === "unassigned" ||
            r.attendance_status === "unassigned"
        ).length,
      },
    ];

    setStatusDistributionData(data);
  };

  // Prepare data for employee compliance chart
  const prepareEmployeeComplianceData = (attendanceData) => {
    // If we're filtering for a specific employee, skip this chart data
    if (selectedEmployee) {
      setEmployeeComplianceData([]);
      return;
    }

    const employeeStats = employees.map((employee) => {
      const employeeRecords = attendanceData.filter((record) => {
        const recordEmployee = employees.find(
          (emp) => emp.name === record.user_name
        );
        return (
          recordEmployee &&
          (recordEmployee._id === employee._id ||
            recordEmployee.userId === employee.userId)
        );
      });

      const checkIns = employeeRecords.filter(
        (record) => record.status === "Check-in"
      );

      const onTime = checkIns.filter(
        (record) =>
          record.attendanceStatus === "on-time" ||
          record.attendance_status === "on-time"
      ).length;

      const totalAttendances = checkIns.length;
      const complianceRate =
        totalAttendances > 0
          ? Math.round((onTime / totalAttendances) * 100)
          : 0;

      return {
        name: employee.name,
        complianceRate,
      };
    });

    setEmployeeComplianceData(employeeStats);
  };

  // Handle filter changes
  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
    setFilters((prev) => ({ ...prev, employee: value }));
    fetchAttendanceStats(); // Immediately fetch updated stats when employee changes
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value,
    });
  };

  // Generate CSV data for export
  const exportToCSV = () => {
    // Create column headers
    let csv =
      "Employee,Date,Status,Expected Time,Actual Time,Difference (min)\n";

    // Add data rows
    attendanceRecords.forEach((record) => {
      const date = format(new Date(record.timestamp), "yyyy-MM-dd");
      const expectedTime = record.expected_time
        ? format(new Date(record.expected_time), "HH:mm")
        : "N/A";
      const actualTime = format(new Date(record.timestamp), "HH:mm");
      const difference = record.minutes_diff || "N/A";

      csv += `${record.user_name},${date},${record.status} (${
        record.attendanceStatus || record.attendance_status || "N/A"
      }),${expectedTime},${actualTime},${difference}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `attendance_report_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Attendance Statistics
          </CardTitle>
          <CardDescription>
            Track and analyze employee attendance patterns, compliance, and
            trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="employee">Employee</Label>
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
                            const employeeId = employee._id || employee.userId;
                            setFilters({
                              ...filters,
                              employee: employeeId,
                            });
                            setSelectedEmployee(employeeId); // Update selectedEmployee state
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
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange("startDate", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange("endDate", e.target.value)
                }
              />
            </div>
          </div>

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
                    fetchAttendanceStats();
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <UserCheck className="h-8 w-8 text-green-500 mb-2" />
                      <div className="text-2xl font-bold">
                        {attendanceStats.onTime}
                      </div>
                      <p className="text-sm text-gray-500">On Time</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                      <div className="text-2xl font-bold">
                        {attendanceStats.late}
                      </div>
                      <p className="text-sm text-gray-500">Late Arrivals</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">
                        {attendanceStats.early}
                      </div>
                      <p className="text-sm text-gray-500">Early Arrivals</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <UserX className="h-8 w-8 text-red-500 mb-2" />
                      <div className="text-2xl font-bold">
                        {attendanceStats.absent}
                      </div>
                      <p className="text-sm text-gray-500">Absences</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-8 w-8 text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">
                        {attendanceStats.complianceRate}%
                      </div>
                      <p className="text-sm text-gray-500">Compliance Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Tabs defaultValue="daily">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger
                      value="daily"
                      className="flex items-center gap-2"
                    >
                      <BarChart3 size={16} />
                      Daily Attendance
                    </TabsTrigger>
                    <TabsTrigger
                      value="distribution"
                      className="flex items-center gap-2"
                    >
                      <PieChart size={16} />
                      Status Distribution
                    </TabsTrigger>
                    {!selectedEmployee && (
                      <TabsTrigger
                        value="compliance"
                        className="flex items-center gap-2"
                      >
                        <BarChart3 size={16} />
                        Employee Compliance
                      </TabsTrigger>
                    )}
                  </TabsList>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={exportToCSV}
                  >
                    <Download size={16} />
                    Export Data
                  </Button>
                </div>

                <TabsContent value="daily" className="p-4 border rounded-md">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyAttendanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="onTime"
                          name="On Time"
                          stackId="a"
                          fill="#4ade80"
                        />
                        <Bar
                          dataKey="early"
                          name="Early"
                          stackId="a"
                          fill="#22d3ee"
                        />
                        <Bar
                          dataKey="gracePeriod"
                          name="Grace Period"
                          stackId="a"
                          fill="#facc15"
                        />
                        <Bar
                          dataKey="late"
                          name="Late"
                          stackId="a"
                          fill="#f43f5e"
                        />
                        <Bar
                          dataKey="absent"
                          name="Absent"
                          stackId="a"
                          fill="#94a3b8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent
                  value="distribution"
                  className="p-4 border rounded-md"
                >
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={statusDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} records`, "Count"]}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {!selectedEmployee && (
                  <TabsContent
                    value="compliance"
                    className="p-4 border rounded-md"
                  >
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={employeeComplianceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip
                            formatter={(value) => [
                              `${value}%`,
                              "Compliance Rate",
                            ]}
                          />
                          <Legend />
                          <Bar
                            dataKey="complianceRate"
                            name="Compliance Rate"
                            fill="#4ade80"
                            background={{ fill: "#eee" }}
                            label={{
                              position: "right",
                              formatter: (value) => `${value}%`,
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Showing data from{" "}
            {format(new Date(dateRange.startDate), "MMM dd, yyyy")} to{" "}
            {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding the Attendance Statistics Dashboard
          </CardDescription>
        </CardHeader>
        <>
          <div className="space-y-4">
            <div className="flex gap-3">
              <UserCheck className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Compliance Tracking</h4>
                <p className="text-sm text-gray-500">
                  The system automatically checks if employees are arriving on
                  time, within grace periods, or late based on their assigned
                  time schedules.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Time Variance Analysis</h4>
                <p className="text-sm text-gray-500">
                  Track early arrivals, late check-ins, and early departures
                  against the assigned time profiles.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Attendance Patterns</h4>
                <p className="text-sm text-gray-500">
                  Identify patterns in employee attendance through visual charts
                  and reports.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium">Reporting Tools</h4>
                <p className="text-sm text-gray-500">
                  Export detailed reports of attendance data for further
                  analysis or record-keeping.
                </p>
              </div>
            </div>
          </div>
        </>
      </Card>
    </div>
  );
}
