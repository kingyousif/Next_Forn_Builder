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
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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

// User type definition
type User = {
  id: number;
  name: string;
  fullName: string;
  role: "super admin" | "admin" | "user";
  department?: string;
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
        // Simulated data with roles and departments
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
      if (
        Object.values(currentUser).some((value) => value == null || value == "")
      ) {
        return toast.error("Please fill in all fields");
      }

      console.log(currentUser);

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
    console.log(user);
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
            className="flex justify-center items-center cursor-pointer"
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
        return <div className="text-center">{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer"
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
            className="flex justify-center items-center cursor-pointer"
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
        return <div className="text-center">{row.getValue("role")}</div>;
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer"
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
          <div className="text-center">{department ? department : "None"}</div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center items-center cursor-pointer"
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
          <div className="text-center">
            {date ? formatDate(date, "yyyy-MM-dd HH:mm") : ""}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row.original)}
          >
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the user.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-slate-300"
                  onClick={() => handleDeleteUser(row.original._id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      // If we're already sorting by this column in desc order, remove sorting
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

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex space-x-4">
          <Input
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              {(userData[0]?.role === "super admin" ||
                userData[0]?.department === "HR" ||
                userData[0]?.role === "admin") && (
                <Button onClick={() => setCurrentUser({})}>Add New User</Button>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentUser._id ? "Edit User" : "Create User"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Name"
                  value={currentUser.name || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Full Name"
                  value={currentUser.fullName || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, fullName: e.target.value })
                  }
                />
                <Select
                  value={currentUser.role || ""}
                  onValueChange={(value) => {
                    setCurrentUser({
                      ...currentUser,
                      role: value as User["role"],
                      // Reset department if role changes
                      department:
                        value === "super admin"
                          ? undefined
                          : currentUser.department,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userData[0]?.role === "super admin" ? (
                      <>
                        <SelectItem value="super admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </>
                    ) : userData[0]?.role === "admin" ? (
                      <>
                        {/* <SelectItem value="super admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem> */}
                        <SelectItem value="user">User</SelectItem>
                      </>
                    ) : (
                      ""
                    )}
                  </SelectContent>
                </Select>
                {currentUser.role && currentUser.role !== "super admin" && (
                  <Select
                    value={currentUser.department || ""}
                    onValueChange={(value) =>
                      setCurrentUser({ ...currentUser, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentUser.role === "admin"
                        ? DEPARTMENTS.admin
                        : DEPARTMENTS.user
                      ).map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex justify-end space-x-2">
                  {currentUser._id ? (
                    <Button onClick={handleUpdateUser} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Updating
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleCreateUser} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
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
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagementPage;
