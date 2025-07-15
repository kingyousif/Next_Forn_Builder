"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Users,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Download,
  Upload,
  Search,
  Filter,
  Loader2,
  UserPlus,
  Check,
} from "lucide-react";

import { createTeamColumns } from "@/components/team/team-columns";
import axios from "axios";
import { TeamDataTable } from "@/components/team/team-data-table";

interface Employee {
  id: string;
  userId: string;
  name: string;
  email?: string;
  department?: string;
  position?: string;
  privilege: number;
  cardNumber?: string;
  password?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deviceSync: boolean;
  apiSync: boolean;
}

interface NewEmployee {
  userId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  privilege: number;
  cardNumber: string;
  password: string;
}

const API_BASE_URL = "http://172.18.1.31:8000";

export default function TeamPage() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingDevice, setSyncingDevice] = useState(false);
  const [syncingApi, setSyncingApi] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Form states
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    userId: "",
    name: "",
    email: "",
    department: "",
    position: "",
    privilege: 0,
    cardNumber: "",
    password: "",
  });

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch employees from API
  const fetchEmployeesFromApi = useCallback(async () => {
    try {
      setSyncingApi(true);
      const response = await axios.get(`${API_BASE_URL}/attendanceUser/fetch`);
      return [];
    } catch (error) {
      console.error("Error fetching employees from API:", error);
      toast.error("Failed to fetch employees from API");
      return [];
    } finally {
      setSyncingApi(false);
    }
  }, [toast]);

  // Fetch employees from ZKTeco device
  const fetchEmployeesFromDevice = useCallback(async () => {
    try {
      setSyncingDevice(true);
      const response = await axios.post(
        "http://172.18.1.31:5000/api/zkteco/get-users"
      );
      
      return response.data.users || [];
    } catch (error) {
      console.error("Error fetching employees from device:", error);
      toast.error("Failed to fetch employees from ZKTeco device");
      return [];
    } finally {
      setSyncingDevice(false);
    }
  }, [toast]);

  // Sync data from both sources
  const syncAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [deviceUsers, apiEmployees] = await Promise.all([
        fetchEmployeesFromDevice(),
        fetchEmployeesFromApi(),
      ]);

     

      // Merge data from both sources
      const mergedData: Employee[] = [];
      const processedIds = new Set();

      // Process device users
      deviceUsers.forEach((deviceUser: any) => {
        const apiEmployee = apiEmployees.find(
          (emp: any) => emp.userId === deviceUser.userId
        );

        mergedData.push({
          id: apiEmployee?.id || deviceUser.userId,
          userId: deviceUser.userId,
          name: deviceUser.name || apiEmployee?.name || "",
          email: apiEmployee?.email || "",
          department: apiEmployee?.department || "",
          position: apiEmployee?.position || "",
          privilege: deviceUser.privilege || 0,
          cardNumber: deviceUser.cardNumber || apiEmployee?.cardNumber || "",
          password: deviceUser.password || "",
          isActive: apiEmployee?.isActive ?? true,
          createdAt: apiEmployee?.createdAt,
          updatedAt: apiEmployee?.updatedAt,
          deviceSync: true,
          apiSync: !!apiEmployee,
        });

        processedIds.add(deviceUser.userId);
      });

      // Process API employees not in device
      apiEmployees.forEach((apiEmployee: any) => {
        if (!processedIds.has(apiEmployee.userId)) {
          mergedData.push({
            id: apiEmployee.id,
            userId: apiEmployee.userId,
            name: apiEmployee.name || "",
            email: apiEmployee.email || "",
            department: apiEmployee.department || "",
            position: apiEmployee.position || "",
            privilege: apiEmployee.privilege || 0,
            cardNumber: apiEmployee.cardNumber || "",
            password: "",
            isActive: apiEmployee.isActive ?? true,
            createdAt: apiEmployee.createdAt,
            updatedAt: apiEmployee.updatedAt,
            deviceSync: false,
            apiSync: true,
          });
        }
      });

      setEmployees(mergedData);
      toast.success(`Synced ${mergedData.length} employees successfully`);
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Failed to sync employee data");
    } finally {
      setLoading(false);
    }
  }, [fetchEmployeesFromDevice, fetchEmployeesFromApi, toast]);

  // Create employee
  const handleCreateEmployee = async () => {
    if (!newEmployee.userId || !newEmployee.name) {
      toast.error("User ID and Name are required");
      return;
    }

    try {
      setLoading(true);

     

      // Create in device
      const deviceResponse = await axios.post(
        "http://172.18.1.31:5000/api/zkteco/create-user",
        {
          userId: newEmployee.userId,
          userName: newEmployee.name,
          password: newEmployee.password,
          privilege: newEmployee.privilege,
          cardNumber: newEmployee.cardNumber,
        }
      );
    

      // Create in API
      // const apiResponse = await axios.post(`${API_BASE_URL}/employees`, {
      //   userId: newEmployee.userId,
      //   name: newEmployee.name,
      //   email: newEmployee.email,
      //   department: newEmployee.department,
      //   position: newEmployee.position,
      //   privilege: newEmployee.privilege,
      //   cardNumber: newEmployee.cardNumber,
      //   isActive: true,
      // });

      if (deviceResponse.data.success) {
        toast.success("Employee created successfully in both device and API");
        setCreateDialogOpen(false);
        setNewEmployee({
          userId: "",
          name: "",
          email: "",
          department: "",
          position: "",
          privilege: 0,
          cardNumber: "",
          password: "",
        });
        await syncAllData();
      } else {
        throw new Error("Failed to create employee");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  // Update employee
  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      setLoading(true);

      // Update in device
      const deviceResponse = await axios.post(
        "http://172.18.1.31:5000/api/zkteco/update-user",
        {
          userId: editingEmployee.userId,
          userName: editingEmployee.name,
          password: editingEmployee.password,
          privilege: editingEmployee.privilege,
          cardNumber: editingEmployee.cardNumber,
        }
      );
     

      // Update in API
      // const apiResponse = await axios.put(
      //   `${API_BASE_URL}/employees/${editingEmployee.id}`,
      //   {
      //     name: editingEmployee.name,
      //     email: editingEmployee.email,
      //     department: editingEmployee.department,
      //     position: editingEmployee.position,
      //     privilege: editingEmployee.privilege,
      //     cardNumber: editingEmployee.cardNumber,
      //     isActive: editingEmployee.isActive,
      //   }
      // );

      if (deviceResponse.data.success) {
        toast.success("Employee updated successfully");
        setEditDialogOpen(false);
        setEditingEmployee(null);
        await syncAllData();
      } else {
        throw new Error("Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  // Delete single employee
  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      setLoading(true);

      // Delete from device
      const deviceResponse = await axios.post(
        "http://172.18.1.31:5000/api/zkteco/delete-user",
        {
          userId: employee.userId,
        }
      );
  

      // Delete from API
      // const apiResponse = await axios.delete(
      //   `${API_BASE_URL}/employees/${employee.id}`
      // );

      if (deviceResponse.data.success) {
        toast.success("Employee deleted successfully");
      } else {
        throw new Error("Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    } finally {
      setDeleteDialogOpen(false);
      await syncAllData();
      setLoading(false);
    }
  };

  // Bulk delete employees
  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) return;

    try {
      setLoading(true);

      const selectedEmployeeData = employees.filter((emp) =>
        selectedEmployees.includes(emp.id)
      );

      const userIds = selectedEmployeeData.map((emp) => emp.userId);
      const employeeIds = selectedEmployeeData.map((emp) => emp.id);

      // Bulk delete from device
      const deviceResponse = await axios.post(
        "http://172.18.1.31:5000/api/zkteco/bulk-delete-users",
        {
          userIds,
        }
      );

      // Bulk delete from API
      // const apiResponse = await axios.post(
      //   `${API_BASE_URL}/employees/bulk-delete`,
      //   {
      //     ids: employeeIds,
      //   }
      // );

      if (deviceResponse.data.success) {
        toast.success(
          `${selectedEmployees.length} employees deleted successfully`
        );
      } else {
        throw new Error("Failed to delete employees");
      }
    } catch (error) {
      console.error("Error bulk deleting employees:", error);
      toast.error("Failed to delete selected employees");
    } finally {
      setBulkDeleteDialogOpen(false);
      setSelectedEmployees([]);
      await syncAllData();
      setLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.email &&
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment =
        departmentFilter === "all" || employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.isActive) ||
        (statusFilter === "inactive" && !employee.isActive) ||
        (statusFilter === "synced" &&
          employee.deviceSync &&
          employee.apiSync) ||
        (statusFilter === "device-only" &&
          employee.deviceSync &&
          !employee.apiSync) ||
        (statusFilter === "api-only" &&
          !employee.deviceSync &&
          employee.apiSync);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = employees
      .map((emp) => emp.department)
      .filter((dept) => dept && dept.trim() !== "")
      .filter((dept, index, arr) => arr.indexOf(dept) === index);
    return depts;
  }, [employees]);

  // Load data on component mount
  useEffect(() => {
    syncAllData();
  }, [syncAllData]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage employees across ZKTeco device and API
          </p>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            onClick={syncAllData}
            disabled={loading || syncingDevice || syncingApi}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {syncingDevice || syncingApi ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Data
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Create a new employee in both ZKTeco device and API
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID *</Label>
                  <Input
                    id="userId"
                    value={newEmployee.userId}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        userId: e.target.value,
                      }))
                    }
                    placeholder="Enter user ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    placeholder="Enter department"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    placeholder="Enter position"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privilege">Privilege Level</Label>
                  <Select
                    value={newEmployee.privilege.toString()}
                    onValueChange={(value) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        privilege: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select privilege" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal User</SelectItem>
                      <SelectItem value="14">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={newEmployee.cardNumber}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        cardNumber: e.target.value,
                      }))
                    }
                    placeholder="Enter card number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) =>
                      setNewEmployee((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEmployee}
                  disabled={loading || !newEmployee.userId || !newEmployee.name}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {employees.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Device Synced
            </CardTitle>
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {employees.filter((emp) => emp.deviceSync).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              API Synced
            </CardTitle>
            <Upload className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {employees.filter((emp) => emp.apiSync).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Active
            </CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {employees.filter((emp) => emp.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-filter">Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept || ""}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="synced">Fully Synced</SelectItem>
                  <SelectItem value="device-only">Device Only</SelectItem>
                  <SelectItem value="api-only">API Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                {selectedEmployees.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedEmployees.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees ({filteredEmployees.length})
            </span>
            {(syncingDevice || syncingApi) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {syncingDevice && "Syncing device..."}
                {syncingApi && "Syncing API..."}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading employees...</span>
            </div>
          ) : (
            <TeamDataTable
              columns={createTeamColumns({
                onEdit: (employee) => {
                  setEditingEmployee(employee);
                  setEditDialogOpen(true);
                },
                onDelete: (employee) => {
                  setEditingEmployee(employee);
                  setDeleteDialogOpen(true);
                },
              })}
              data={filteredEmployees}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              departments={departments as string[]}
              selectedEmployees={selectedEmployees}
              onSelectionChange={setSelectedEmployees}
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setEditDialogOpen(true);
              }}
              onDelete={(employee) => {
                setEditingEmployee(employee);
                setDeleteDialogOpen(true);
              }}
              onBulkDelete={() => setBulkDeleteDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information in both device and API
            </DialogDescription>
          </DialogHeader>

          {editingEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-userId">User ID</Label>
                <Input
                  id="edit-userId"
                  value={editingEmployee.userId}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editingEmployee.name}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingEmployee.email || ""}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, email: e.target.value } : null
                    )
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={editingEmployee.department || ""}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, department: e.target.value } : null
                    )
                  }
                  placeholder="Enter department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={editingEmployee.position || ""}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, position: e.target.value } : null
                    )
                  }
                  placeholder="Enter position"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-privilege">Privilege Level</Label>
                <Select
                  value={editingEmployee.privilege.toString()}
                  onValueChange={(value) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, privilege: parseInt(value) } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privilege" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal User</SelectItem>
                    <SelectItem value="14">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cardNumber">Card Number</Label>
                <Input
                  id="edit-cardNumber"
                  value={editingEmployee.cardNumber || ""}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, cardNumber: e.target.value } : null
                    )
                  }
                  placeholder="Enter card number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editingEmployee.password || ""}
                  onChange={(e) =>
                    setEditingEmployee((prev) =>
                      prev ? { ...prev, password: e.target.value } : null
                    )
                  }
                  placeholder="Enter new password (leave blank to keep current)"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingEmployee(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEmployee}
              disabled={loading || !editingEmployee?.name}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {editingEmployee?.name}? This
              action will remove the employee from both the ZKTeco device and
              API. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                editingEmployee && handleDeleteEmployee(editingEmployee)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Employees</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedEmployees.length}{" "}
              selected employees? This action will remove them from both the
              ZKTeco device and API. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete {selectedEmployees.length} Employees
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
