"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  UserCheck,
  Search,
  Link,
  Unlink,
  Crown,
  Shield,
  User,
  Building2,
  UserPlus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronsLeft,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/context/page";
import { motion, AnimatePresence } from "framer-motion";

// Type definitions
type User = {
  id: number;
  name: string;
  fullName: string;
  UserName: string;
  role: "super admin" | "admin" | "user";
  department?: string;
  _id?: string;
  assignedEmployee?: Employee;
};

type Employee = {
  _id: string;
  userId: string;
  name: string;
  department?: string;
  assignedToUser?: string;
};

type Assignment = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    fullName: string;
    role: string;
    department?: string;
  };
  employeeId: {
    _id: string;
    name: string;
    userId: number;
  };
  userName: string;
  employeeName: string;
  userDepartment?: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
};

type UserSortConfig = {
  key: keyof User | "assignedEmployee";
  direction: "asc" | "desc";
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "super admin":
      return Crown;
    case "admin":
      return Shield;
    default:
      return User;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "super admin":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
};

const EmployeeManagementPage = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [unassigningEmployeeId, setUnassigningEmployeeId] = useState<
    string | null
  >(null);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  // Main table filters and pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterAssignment, setFilterAssignment] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<UserSortConfig>({
    key: "fullName",
    direction: "asc",
  });

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Alert dialog state
  const [isUnassignAlertOpen, setIsUnassignAlertOpen] =
    useState<boolean>(false);
  const [employeeToUnassign, setEmployeeToUnassign] = useState<{
    employeeId: string;
    employeeName: string;
    userName: string;
  } | null>(null);

  // Simple employee search in popover (no pagination/sorting)
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>("");

  const url = process.env.NEXT_PUBLIC_API_URL;
  const { user, token } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await axios.post<User[]>(`${url}user/fetch`, {
        id: user._id || user.id,
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.post(
        `${url}attendanceUser/fetch`,
        {
          reqUserId: user._id || user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    }
  };

  const fetchAssignments = async () => {
    try {
      const savedAssignments = await axios.post(`${url}userAssignment/fetch`, {
        userId: user._id || user.id,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (savedAssignments.data) {
        setAssignments(savedAssignments.data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchEmployees(), fetchAssignments()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAllData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedUser || !selectedEmployee) {
      toast.error("Please select both user and employee");
      return;
    }

    setIsAssigning(true);
    try {
      const employee = employees.find((emp) => emp._id === selectedEmployee);
      if (!employee) {
        toast.error("Employee not found");
        return;
      }

      // Log full user data to console

      const assignmentPayload = {
        userId: selectedUser._id || selectedUser.id.toString(),
        employeeId: selectedEmployee,
        userName: selectedUser.fullName,
        employeeName: employee.name,
        userRole: selectedUser.role,
        userDepartment: selectedUser.department,
      };

      await axios.post(`${url}userAssignment/create`, assignmentPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        `Successfully assigned ${employee.name} to ${selectedUser.fullName}`
      );

      // Refresh assignments after successful creation
      await fetchAssignments();
      setIsDialogOpen(false);
      setSelectedUser(null);
      setSelectedEmployee("");
      setEmployeeSearchTerm("");
    } catch (error) {
      console.error("Error assigning employee:", error);
      toast.error("Failed to assign employee");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignEmployee = async (employeeId: string) => {
    setUnassigningEmployeeId(employeeId);
    try {
      await axios.delete(`${url}userAssignment/delete/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh assignments after successful deletion
      await fetchAssignments();
      toast.success("Employee unassigned successfully");
    } catch (error) {
      console.error("Error unassigning employee:", error);
      toast.error("Failed to unassign employee");
    } finally {
      setUnassigningEmployeeId(null);
    }
  };

  const openUnassignAlert = (assignment: Assignment) => {
    setEmployeeToUnassign({
      employeeId: assignment.employeeId._id,
      employeeName: assignment.employeeName,
      userName: assignment.userName,
    });
    setIsUnassignAlertOpen(true);
  };

  const confirmUnassign = async () => {
    if (employeeToUnassign) {
      await handleUnassignEmployee(employeeToUnassign.employeeId);
      setIsUnassignAlertOpen(false);
      setEmployeeToUnassign(null);
    }
  };

  const getAssignedEmployee = (userId: string) => {
    const assignment = assignments.find((a) => a.userId._id === userId);
    if (assignment) {
      return employees.find((emp) => emp._id === assignment.employeeId._id);
    }
    return null;
  };

  // Get available employees for simple search in popover
  const availableEmployees = useMemo(() => {
    const assignedEmployeeIds = assignments.map((a) => a.employeeId._id || "");
    let filtered = employees.filter(
      (emp) => !assignedEmployeeIds.includes(emp._id || "")
    );

    // Simple search filter for popover
    if (employeeSearchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
          (emp.department &&
            emp.department
              .toLowerCase()
              .includes(employeeSearchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [employees, assignments, employeeSearchTerm]);

  // Filtered and sorted users for main table
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "All") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Assignment filter
    if (filterAssignment !== "All") {
      if (filterAssignment === "Assigned") {
        filtered = filtered.filter((user) =>
          getAssignedEmployee(user._id || user.id.toString())
        );
      } else if (filterAssignment === "Unassigned") {
        filtered = filtered.filter(
          (user) => !getAssignedEmployee(user._id || user.id.toString())
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === "assignedEmployee") {
        const aEmployee = getAssignedEmployee(a._id || a.id.toString());
        const bEmployee = getAssignedEmployee(b._id || b.id.toString());
        aValue = aEmployee ? aEmployee.name : "";
        bValue = bEmployee ? bEmployee.name : "";
      } else {
        aValue = a[sortConfig.key] || "";
        bValue = b[sortConfig.key] || "";
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [
    users,
    searchTerm,
    filterRole,
    filterAssignment,
    sortConfig,
    assignments,
  ]);

  // Pagination for main table
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Handle sorting for main table
  const handleSort = (key: keyof User | "assignedEmployee") => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Get sort icon for main table
  const getSortIcon = (key: keyof User | "assignedEmployee") => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  // Handle page changes for main table
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalEmployees = employees.length;
    const assignedEmployees = assignments.length;
    const unassignedEmployees = totalEmployees - assignedEmployees;
    const assignedUsers = new Set(assignments.map((a) => a.userId._id)).size;
    const unassignedUsers = totalUsers - assignedUsers;

    return {
      totalUsers,
      totalEmployees,
      assignedEmployees,
      unassignedEmployees,
      assignedUsers,
      unassignedUsers,
    };
  }, [users, employees, assignments]);

  // Initial data load
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Reset main table pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterAssignment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium">
            Loading employee management...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="relative p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Employee Assignment
                  </h1>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Assign employees to users and manage relationships
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                disabled={isRefreshing}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4"
        >
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalEmployees}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                Assigned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.assignedUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                Unassigned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.unassignedUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                Assigned Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.assignedEmployees}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                Available Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.unassignedEmployees}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Table Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
            />
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="super admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAssignment} onValueChange={setFilterAssignment}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <SelectValue placeholder="Filter by assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Users</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Main Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users Management
                <Badge variant="secondary" className="ml-auto">
                  {filteredAndSortedUsers.length} users
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200/50 dark:border-slate-700/50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => handleSort("fullName")}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {getSortIcon("fullName")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => handleSort("UserName")}
                      >
                        <div className="flex items-center gap-2">
                          UserName
                          {getSortIcon("UserName")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center gap-2">
                          Role
                          {getSortIcon("role")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => handleSort("department")}
                      >
                        <div className="flex items-center gap-2">
                          Department
                          {getSortIcon("department")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => handleSort("assignedEmployee")}
                      >
                        <div className="flex items-center gap-2">
                          Assigned Employee
                          {getSortIcon("assignedEmployee")}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {currentUsers.map((user, index) => {
                        const assignedEmployee = getAssignedEmployee(
                          user._id || user.id.toString()
                        );
                        const assignment = assignments.find(
                          (a) =>
                            a.userId._id === (user._id || user.id.toString())
                        );
                        const RoleIcon = getRoleIcon(user.role);

                        return (
                          <motion.tr
                            key={user._id || user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white text-sm font-medium">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <span>{user.fullName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">
                                {user.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getRoleBadgeVariant(user.role)}
                                className="flex items-center gap-1 w-fit"
                              >
                                <RoleIcon className="h-3 w-3" />
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.department ? (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span>{user.department}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {assignedEmployee ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">
                                    {assignedEmployee.name}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                  <span className="text-muted-foreground">
                                    Not assigned
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {assignedEmployee ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      assignment &&
                                      openUnassignAlert(assignment)
                                    }
                                    disabled={
                                      unassigningEmployeeId ===
                                      assignedEmployee._id
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                                  >
                                    {unassigningEmployeeId ===
                                    assignedEmployee._id ? (
                                      <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Unassigning...
                                      </>
                                    ) : (
                                      <>
                                        <Unlink className="mr-1 h-3 w-3" />
                                        Unassign
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Dialog
                                    open={
                                      isDialogOpen &&
                                      selectedUser?._id === user._id
                                    }
                                    onOpenChange={(open) => {
                                      setIsDialogOpen(open);
                                      if (!open) {
                                        setSelectedUser(null);
                                        setSelectedEmployee("");
                                        setEmployeeSearchTerm("");
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setIsDialogOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                      >
                                        <Link className="mr-1 h-3 w-3" />
                                        Assign
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <UserPlus className="h-5 w-5 text-blue-600" />
                                          Assign Employee to {user.fullName}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-6">
                                        <div className="space-y-3">
                                          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            Select Employee
                                          </label>

                                          {/* Custom Searchable Select */}
                                          <div className="relative">
                                            <div
                                              className="w-full min-h-[48px] p-3 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:shadow-md focus-within:shadow-lg focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-all duration-300 cursor-pointer"
                                              onClick={() =>
                                                setIsEmployeeDropdownOpen(
                                                  !isEmployeeDropdownOpen
                                                )
                                              }
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                  <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                                  {selectedEmployee ? (
                                                    <div className="flex items-center gap-3">
                                                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                        {availableEmployees
                                                          .find(
                                                            (emp) =>
                                                              emp._id ===
                                                              selectedEmployee
                                                          )
                                                          ?.name.charAt(0)
                                                          .toUpperCase()}
                                                      </div>
                                                      <div>
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                                          {
                                                            availableEmployees.find(
                                                              (emp) =>
                                                                emp._id ===
                                                                selectedEmployee
                                                            )?.name
                                                          }
                                                        </span>
                                                        {availableEmployees.find(
                                                          (emp) =>
                                                            emp._id ===
                                                            selectedEmployee
                                                        )?.department && (
                                                          <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {
                                                              availableEmployees.find(
                                                                (emp) =>
                                                                  emp._id ===
                                                                  selectedEmployee
                                                              )?.department
                                                            }
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                      Search and select an
                                                      employee...
                                                    </span>
                                                  )}
                                                </div>
                                                <ChevronDown
                                                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                                                    isEmployeeDropdownOpen
                                                      ? "rotate-180"
                                                      : ""
                                                  }`}
                                                />
                                              </div>
                                            </div>

                                            {/* Dropdown Content */}
                                            {isEmployeeDropdownOpen && (
                                              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
                                                {/* Search Input */}
                                                <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
                                                  <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                      type="text"
                                                      placeholder="Type to search employees..."
                                                      value={employeeSearchTerm}
                                                      onChange={(e) =>
                                                        setEmployeeSearchTerm(
                                                          e.target.value
                                                        )
                                                      }
                                                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                      autoFocus
                                                    />
                                                  </div>
                                                </div>

                                                {/* Employee List */}
                                                <div className="max-h-60 overflow-y-auto">
                                                  {availableEmployees.length ===
                                                  0 ? (
                                                    <div className="flex flex-col items-center justify-center py-12 px-6">
                                                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mb-4">
                                                        <Users className="h-8 w-8 text-slate-400" />
                                                      </div>
                                                      <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        {employeeSearchTerm
                                                          ? "No matching employees"
                                                          : "No available employees"}
                                                      </h3>
                                                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                                        {employeeSearchTerm
                                                          ? "Try adjusting your search terms or check spelling"
                                                          : "All employees are currently assigned to users"}
                                                      </p>
                                                    </div>
                                                  ) : (
                                                    <div className="p-2">
                                                      {availableEmployees.map(
                                                        (employee, index) => (
                                                          <div
                                                            key={employee._id}
                                                            onClick={() => {
                                                              setSelectedEmployee(
                                                                employee._id
                                                              );
                                                              setIsEmployeeDropdownOpen(
                                                                false
                                                              );
                                                              setEmployeeSearchTerm(
                                                                ""
                                                              );
                                                            }}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 ${
                                                              selectedEmployee ===
                                                              employee._id
                                                                ? "bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                                                                : "hover:shadow-sm"
                                                            }`}
                                                          >
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                                              {employee.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                              <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                                  {
                                                                    employee.name
                                                                  }
                                                                </span>
                                                                {selectedEmployee ===
                                                                  employee._id && (
                                                                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                                )}
                                                              </div>
                                                              <div className="flex items-center gap-2 text-xs">
                                                                {employee.userId && (
                                                                  <span className="text-slate-500 dark:text-slate-400">
                                                                    ID:{" "}
                                                                    {
                                                                      employee.userId
                                                                    }
                                                                  </span>
                                                                )}
                                                                {employee.department && (
                                                                  <Badge
                                                                    variant="outline"
                                                                    className="text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600"
                                                                  >
                                                                    <Building2 className="h-3 w-3 mr-1" />
                                                                    {
                                                                      employee.department
                                                                    }
                                                                  </Badge>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Selection Confirmation */}
                                          {selectedEmployee && (
                                            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-xl border border-green-200/60 dark:border-green-800/60">
                                              <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                                  <CheckCircle className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                  <p className="font-medium text-green-800 dark:text-green-200">
                                                    Employee Selected
                                                  </p>
                                                  <p className="text-sm text-green-600 dark:text-green-300">
                                                    {
                                                      availableEmployees.find(
                                                        (emp) =>
                                                          emp._id ===
                                                          selectedEmployee
                                                      )?.name
                                                    }{" "}
                                                    is ready to be assigned
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setIsDialogOpen(false);
                                              setSelectedUser(null);
                                              setSelectedEmployee("");
                                              setEmployeeSearchTerm("");
                                              setIsEmployeeDropdownOpen(false);
                                            }}
                                            disabled={isAssigning}
                                            className="w-full sm:w-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                                          >
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={handleAssignEmployee}
                                            disabled={
                                              !selectedEmployee || isAssigning
                                            }
                                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {isAssigning ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Assigning...
                                              </>
                                            ) : (
                                              <>
                                                <Link className="mr-2 h-4 w-4" />
                                                Assign Employee
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Main Table Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredAndSortedUsers.length)} of{" "}
                    {filteredAndSortedUsers.length} users
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Unassign Confirmation Alert Dialog */}
        <AlertDialog
          open={isUnassignAlertOpen}
          onOpenChange={setIsUnassignAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirm Unassignment
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unassign{" "}
                <span className="font-semibold">
                  {employeeToUnassign?.employeeName}
                </span>{" "}
                from{" "}
                <span className="font-semibold">
                  {employeeToUnassign?.userName}
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsUnassignAlertOpen(false);
                  setEmployeeToUnassign(null);
                }}
                disabled={unassigningEmployeeId !== null}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmUnassign}
                disabled={unassigningEmployeeId !== null}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {unassigningEmployeeId !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unassigning...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    Unassign
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
