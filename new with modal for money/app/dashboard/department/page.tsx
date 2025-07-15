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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Crown,
  User,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate } from "date-fns";
import { useAuth } from "@/components/context/page";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// User type definition
type User = {
  id: number;
  name: string;
  fullName: string;
  role: "super admin" | "admin" | "user";
  department?: string;
  _id?: string;
  createdAt?: string;
};

// Departments based on role
const DEPARTMENTS = {
  admin: [
    "Pharmacy",
    "Security",
    "Reception and Scrter",
    "Emergency",
    "Radiology",
    "Physiotherapy",
    "Services",
    "GIT",
    "Ward",
    "Laboratory",
    "Dermatology",
    "Operation",
    "Psychiatry",
    "NICU",
    "Clinic Senior Doctors",
    "Emergency Doctors",
    "ward doctors",
    "HR",
    "ICU",
    "pediatric S.H.O Doctors",
    "ICU S.H.O Doctors",
    "Accounting",
    "Dental center",
    "Media",
  ],
  user: [
    "Pharmacy",
    "Security",
    "Reception and Scrter",
    "Emergency",
    "Radiology",
    "Physiotherapy",
    "Services",
    "GIT",
    "Ward",
    "Laboratory",
    "Dermatology",
    "Operation",
    "Psychiatry",
    "NICU",
    "Clinic Senior Doctors",
    "Emergency Doctors",
    "ward doctors",
    "HR",
    "ICU",
    "pediatric S.H.O Doctors",
    "ICU S.H.O Doctors",
    "Accounting",
    "Dental center",
    "Media",
  ],
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

const UserManagementPage = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form state
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const url = process.env.NEXT_PUBLIC_API_URL;

  // Fetch users
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>([]);

  const fetchUsers = async () => {
    setLoading(true);
    if (user) {
      try {
        const response = await axios
          .post<User[]>(`${url}user/fetch`, { id: user._id || user.id })
          .then((res) => {
            setUsers(res.data);
            let usersData = axios
              .post(`${url}user/fetchOneUser`, {
                names: user.name,
              })
              .then((res) => {
                setUserData(res.data);
              })
              .catch((err) => {
                toast.error(err.response.data.message);
                console.error("Error fetching forms:", err);
              });
          });
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    } else {
      return;
    }
  };

  // Create user
  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      currentUser.password = "12345678";
      currentUser.department =
        currentUser.role === "super admin" ? "None" : currentUser.department;
      currentUser.name = currentUser.name.toLowerCase();
      if (
        Object.values(currentUser).some((value) => value == null || value == "")
      ) {
        return toast.error("Please fill in all fields");
      }

      

      await axios.post<User>(`${url}user/create`, currentUser).then((res) => {
        fetchUsers();
        setUsers([...users, { ...res.data, ...currentUser } as User]);
        setIsDialogOpen(false);
        toast.success(res?.data?.message || "User created successfully", {});
      });
      setTimeout(() => {
        setCurrentUser({});
      }, 400);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setTimeout(() => {
        setIsCreating(false);
      }, 400);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    try {
      setIsUpdating(true);
      currentUser.department =
        currentUser.role === "super admin" ? "None" : currentUser.department;
      if (
        Object.values(currentUser).some(
          (value) => value == null || value === ""
        )
      ) {
        return toast.error("Please fill in all fields");
      }
      const response = await axios
        .put<User>(`${url}user/update/${currentUser._id}`, currentUser)
        .then((res) => {
          setIsDialogOpen(false);
          setUsers(
            users.map((user) =>
              user._id === currentUser._id
                ? ({ ...res.data, ...currentUser } as User)
                : user
            )
          );
          toast.success(res?.data?.message || "User updated successfully");
        });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
        setCurrentUser({});
      }, 400);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number) => {
    try {
      setIsDeleting(true);
      await axios.delete(`${url}user/delete/${id}`).then((res) => {
        setUsers(users.filter((user) => user._id !== id));
        toast.success(res?.data?.message || "User deleted successfully");
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open dialog for editing
  const openEditDialog = (user: User) => {

    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  // Table columns definition with sorting
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">{row.getValue("name")}</div>
        );
      },
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Full Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </div>
        );
      },
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("fullName")}</div>;
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Role
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </div>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const RoleIcon = getRoleIcon(role);
        return (
          <div className="flex justify-center">
            <Badge
              variant={getRoleBadgeVariant(role)}
              className="flex items-center gap-1 capitalize"
            >
              <RoleIcon className="h-3 w-3" />
              {role}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Department
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </div>
        );
      },
      cell: ({ row }) => {
        const department = row.original.department;
        return (
          <div className="flex justify-center">
            {department && department !== "None" ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {department}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">None</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Created At
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </div>
        );
      },
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date ? formatDate(date, "yyyy-MM-dd HH:mm") : ""}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => openEditDialog(row.original)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the user. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDeleteUser(row.original._id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Deleting
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // React Table setup with sorting
  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      if (
        sorting.length > 0 &&
        newSorting.length > 0 &&
        sorting[0].id === newSorting[0].id &&
        sorting[0].desc &&
        newSorting[0].desc
      ) {
        setSorting([]);
      } else {
        setSorting(newSorting);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Stats calculation
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const superAdminCount = users.filter(
      (u) => u.role === "super admin"
    ).length;
    const userCount = users.filter((u) => u.role === "user").length;
    const departments = [
      ...new Set(users.map((u) => u.department).filter(Boolean)),
    ];

    return {
      total: totalUsers,
      admins: adminCount,
      superAdmins: superAdminCount,
      users: userCount,
      departments: departments.length,
    };
  }, [users]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="relative p-6 space-y-6">
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
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <p className="text-muted-foreground">
                    Manage users, roles, and departments
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20"
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  {(userData[0]?.role === "super admin" ||
                    userData[0]?.department === "HR" ||
                    userData[0]?.role === "admin") && (
                    <Button
                      onClick={() => setCurrentUser({})}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-600/25 transition-all duration-300"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New User
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
                        {currentUser._id ? (
                          <Edit className="h-4 w-4 text-white" />
                        ) : (
                          <UserPlus className="h-4 w-4 text-white" />
                        )}
                      </div>
                      {currentUser._id ? "Edit User" : "Create User"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        placeholder="Enter username"
                        value={currentUser.name || ""}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            name: e.target.value,
                          })
                        }
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        placeholder="Enter full name"
                        value={currentUser.fullName || ""}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            fullName: e.target.value,
                          })
                        }
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role</label>
                      <Select
                        value={currentUser.role || ""}
                        onValueChange={(value) => {
                          setCurrentUser({
                            ...currentUser,
                            role: value as User["role"],
                            department:
                              value === "super admin"
                                ? undefined
                                : currentUser.department,
                          });
                        }}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {userData[0]?.role === "super admin" ? (
                            <>
                              <SelectItem
                                value="super admin"
                                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Crown className="h-4 w-4" />
                                Super Admin
                              </SelectItem>
                              <SelectItem
                                value="admin"
                                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Shield className="h-4 w-4" />
                                Admin
                              </SelectItem>
                              <SelectItem
                                value="user"
                                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <User className="h-4 w-4" />
                                User
                              </SelectItem>
                            </>
                          ) : userData[0]?.role === "admin" ? (
                            <SelectItem
                              value="user"
                              className="hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <User className="h-4 w-4" />
                              User
                            </SelectItem>
                          ) : (
                            ""
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentUser.role && currentUser.role !== "super admin" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Department
                        </label>
                        <Select
                          value={currentUser.department || ""}
                          onValueChange={(value) =>
                            setCurrentUser({
                              ...currentUser,
                              department: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            {(currentUser.role === "admin"
                              ? DEPARTMENTS.admin
                              : DEPARTMENTS.user
                            ).map((dept) => (
                              <SelectItem
                                key={dept}
                                value={dept}
                                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                      {currentUser._id ? (
                        <Button
                          onClick={handleUpdateUser}
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating
                            </>
                          ) : (
                            "Update"
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleCreateUser}
                          disabled={isCreating}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating
                            </>
                          ) : (
                            "Create"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-600/20 dark:to-blue-700/20 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-600/20 dark:to-purple-700/20 border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.superAdmins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-600/20 dark:to-green-700/20 border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.admins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-600/20 dark:to-orange-700/20 border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.users}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500/10 to-teal-600/10 dark:from-teal-600/20 dark:to-teal-700/20 border-teal-200/50 dark:border-teal-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {stats.departments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center animate-pulse">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="text-muted-foreground">
                        Loading users...
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow
                            key={headerGroup.id}
                            className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50"
                          >
                            {headerGroup.headers.map((header) => (
                              <TableHead
                                key={header.id}
                                className="text-center font-semibold"
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {table.getRowModel().rows.map((row, index) => (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-slate-200/30 dark:border-slate-700/30 hover:bg-gradient-to-r hover:from-slate-50/30 hover:to-slate-100/30 dark:hover:from-slate-800/30 dark:hover:to-slate-700/30 transition-all duration-200"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  className="text-center py-4"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/30">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                          table.setPageSize(Number(value));
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px] bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                          <SelectValue
                            placeholder={table.getState().pagination.pageSize}
                          />
                        </SelectTrigger>
                        <SelectContent
                          side="top"
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        >
                          {[10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem
                              key={pageSize}
                              value={`${pageSize}`}
                              className="hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="h-8 w-8 p-0 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="h-8 w-8 p-0 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UserManagementPage;
