"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/components/context/page";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  Loader2,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Define types
type UserData = {
  id: string;
  name: string;
  fullName: string;
  department: string;
  totalScore: number;
  formCount: number;
  lastSubmission: string;
  averageScore: number;
  percentageComplete: number;
  submissions: any[];
};

type DepartmentData = {
  name: string;
  userCount: number;
  totalSubmissions: number;
  averageScore: number;
  users: UserData[];
};

type FormData = {
  id: string;
  title: string;
  submissionCount: number;
  averageScore: number;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function DepartmentAnalyticsTable() {
  // State variables
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departmentForms, setDepartmentForms] = useState<FormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filteredData, setFilteredData] = useState<UserData[]>([]);
  const [showContent, setShowContent] = useState<boolean>(false);

  const { user } = useAuth();
  const url = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch forms
        const formsResponse = await axios.get(
          `${url}form/fetch/${user._id || user.id}`
        );
        const formsData = formsResponse.data;
        setForms(formsData);

        // Fetch all submissions for all forms
        const allSubmissionsData: any[] = [];
        const departmentsMap = new Map<string, DepartmentData>();
        const usersMap = new Map<string, UserData>();
        const formsByDepartment = new Map<string, Map<string, FormData>>();

        for (const form of formsData) {
          const submissionsResponse = await axios.get(
            `${url}formSubmission/form/${form._id}`
          );

          if (
            submissionsResponse.data.success &&
            Array.isArray(submissionsResponse.data.data)
          ) {
            // Add form information to each submission
            const submissionsWithFormInfo = submissionsResponse.data.data.map(
              (sub: any) => ({
                ...sub,
                formTitle: form.title,
                formId: form._id,
                elements: form.elements,
                highestScore: form.highestScore,
                percentage: form.percentage,
              })
            );

            allSubmissionsData.push(...submissionsWithFormInfo);

            // Process submissions to build department and user data
            for (const submission of submissionsResponse.data.data) {
              if (submission.createdFor && submission.department) {
                // Get or create department
                if (!departmentsMap.has(submission.department)) {
                  departmentsMap.set(submission.department, {
                    name: submission.department,
                    userCount: 0,
                    totalSubmissions: 0,
                    averageScore: 0,
                    users: [],
                    highestScore: form.highestScore,
                  });
                }

                // Track forms by department
                if (!formsByDepartment.has(submission.department)) {
                  formsByDepartment.set(
                    submission.department,
                    new Map<string, FormData>()
                  );
                }

                const deptForms = formsByDepartment.get(submission.department)!;
                if (!deptForms.has(form._id)) {
                  deptForms.set(form._id, {
                    id: form._id,
                    title: form.title,
                    submissionCount: 0,
                    averageScore: 0,
                    totalScore: 0,
                  });
                }

                const formData = deptForms.get(form._id)!;
                formData.submissionCount += 1;
                formData.totalScore =
                  (formData.totalScore || 0) + (submission.totalScore || 0);
                formData.averageScore =
                  formData.totalScore / formData.submissionCount;

                // Get or create user
                const userKey = `${submission.createdFor}-${submission.department}`;
                if (!usersMap.has(userKey)) {
                  usersMap.set(userKey, {
                    id: submission._id,
                    name: submission.createdFor,
                    fullName: submission.createdFor, // Will be updated if available
                    department: submission.department,
                    totalScore: 0,
                    formCount: 0,
                    lastSubmission: submission.submittedAt,
                    averageScore: 0,
                    percentageComplete: 0,
                    submissions: [],
                  });

                  // Increment department user count
                  const dept = departmentsMap.get(submission.department);
                  if (dept) {
                    dept.userCount += 1;
                  }
                }

                // Update user data
                const userData = usersMap.get(userKey);
                if (userData) {
                  userData.totalScore += submission.totalScore || 0;
                  userData.formCount += 1;
                  userData.submissions.push(submission);

                  // Update last submission date if newer
                  if (
                    new Date(submission.submittedAt) >
                    new Date(userData.lastSubmission)
                  ) {
                    userData.lastSubmission = submission.submittedAt;
                  }

                  // Calculate average score
                  userData.averageScore =
                    userData.totalScore / userData.formCount;

                  // Calculate percentage complete (mock calculation)
                  userData.percentageComplete = Math.min(
                    100,
                    (userData.formCount / formsData.length) * 100
                  );
                }

                // Update department stats
                const dept = departmentsMap.get(submission.department);
                if (dept) {
                  dept.totalSubmissions += 1;
                }
              }
            }
          }
        }

        // Finalize department data
        const departmentsArray: DepartmentData[] = [];
        departmentsMap.forEach((dept, deptName) => {
          // Add users to department
          const deptUsers: UserData[] = [];
          usersMap.forEach((user, userKey) => {
            if (user.department === deptName) {
              deptUsers.push(user);
            }
          });

          dept.users = deptUsers;

          const totalDeptScore = dept.highestScore;

          dept.averageScore = deptUsers.length > 0 ? totalDeptScore : 0;

          departmentsArray.push(dept);
        });

        // Update state
        setDepartments(departmentsArray);
        setAllSubmissions(allSubmissionsData);

        // Store forms by department for later use
        const formsByDeptMap = new Map<string, FormData[]>();
        formsByDepartment.forEach((formMap, deptName) => {
          const formArray: FormData[] = [];
          formMap.forEach((form) => {
            formArray.push(form);
          });
          formsByDeptMap.set(deptName, formArray);
        });

        // If there are departments, don't select by default - wait for user selection
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch analytics data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, user]);

  // Handle department selection
  useEffect(() => {
    if (selectedDepartment) {
      setIsLoading(true);

      // Reset form selection when department changes
      setSelectedForm("");

      // Find department data
      const dept = departments.find((d) => d.name === selectedDepartment);
      if (dept) {
        setUsers(dept.users);

        // Get forms for this department
        const departmentFormsList: FormData[] = [];
        const formCounts: Record<
          string,
          { count: number; id: string; totalScore: number; title: string }
        > = {};

        // Count submissions by form for this department
        dept.users.forEach((user) => {
          user.submissions.forEach((sub) => {
            if (!formCounts[sub.formId]) {
              formCounts[sub.formId] = {
                count: 0,
                id: sub.formId,
                totalScore: 0,
                title: sub.formTitle,
              };
            }
            formCounts[sub.formId].count += 1;
            formCounts[sub.formId].totalScore += sub.totalScore || 0;
          });
        });

        forms.forEach((form) => {
          const formCount = Object.entries(formCounts).find(
            ([formId]) => formId === form._id
          );

          if (formCount) {
            const [formId] = formCount;
            formCounts[formId] = {
              ...formCounts[formId],
              title: form.title,
            };
          }
        });
        // Convert to array
        Object.entries(formCounts).forEach(([formId, data]) => {
          departmentFormsList.push({
            id: formId,
            title: data.title,
            submissionCount: data.count,
            averageScore: data.count > 0 ? data.totalScore / data.count : 0,
          });
        });

        setDepartmentForms(departmentFormsList);

        // Don't filter data yet - wait for form selection or show all
        setFilteredData(dept.users);
        setShowContent(true);
      }

      setIsLoading(false);
    } else {
      // Reset when no department is selected
      setShowContent(false);
      setDepartmentForms([]);
      setSelectedForm("");
      setFilteredData([]);
    }
  }, [selectedDepartment, departments]);

  // Handle form selection
  useEffect(() => {
    if (!selectedDepartment) return;

    const dept = departments.find((d) => d.name === selectedDepartment);
    if (!dept) return;

    setIsLoading(true);

    if (!selectedForm) {
      // If no form is selected, show all users in the department
      setFilteredData(dept.users);
      setIsLoading(false);
      return;
    }

    // Filter users who have submitted the selected form
    const usersWithSelectedForm = dept.users
      .map((user) => {
        // Find submissions for the selected form
        const formSubmissions = user.submissions.filter(
          (sub) => sub.formId === selectedForm
        );

        if (formSubmissions.length === 0) {
          // User hasn't submitted this form
          return null;
        }

        // Calculate stats based only on this form's submissions
        const totalScore = formSubmissions.reduce(
          (sum, sub) => sum + (sub.totalScore || 0),
          0
        );

        const averageScore =
          formSubmissions.length > 0 ? totalScore / formSubmissions.length : 0;

        const lastSubmission = formSubmissions.reduce((latest, current) => {
          return new Date(current.submittedAt) > new Date(latest.submittedAt)
            ? current
            : latest;
        }, formSubmissions[0]).submittedAt;

        // Return user with filtered submissions and recalculated stats
        return {
          ...user,
          totalScore,
          formCount: formSubmissions.length,
          averageScore,
          lastSubmission,
          submissions: formSubmissions,
          percentageComplete: 100, // They've completed this form
        };
      })
      .filter(Boolean) as UserData[];

    setFilteredData(usersWithSelectedForm);
    setIsLoading(false);
  }, [selectedForm, selectedDepartment, departments]);

  // Apply date filter
  useEffect(() => {
    if (!selectedDepartment) return;

    const dept = departments.find((d) => d.name === selectedDepartment);
    if (!dept) return;

    setIsLoading(true);

    // Start with either all users or form-filtered users
    let baseUsers = dept.users;

    if (selectedForm) {
      // Filter to users who submitted the selected form
      baseUsers = baseUsers
        .map((user) => {
          const formSubmissions = user.submissions.filter(
            (sub) => sub.formId === selectedForm
          );

          if (formSubmissions.length === 0) return null;

          return {
            ...user,
            submissions: formSubmissions,
          };
        })
        .filter(Boolean) as UserData[];
    }

    if (!dateRange.from && !dateRange.to) {
      // No date filter
      if (selectedForm) {
        // Recalculate stats for form-filtered users
        const usersWithUpdatedStats = baseUsers.map((user) => {
          const totalScore = user.submissions.reduce(
            (sum, sub) => sum + (sub.totalScore || 0),
            0
          );

          return {
            ...user,
            totalScore,
            formCount: user.submissions.length,
            averageScore:
              user.submissions.length > 0
                ? totalScore / user.submissions.length
                : 0,
          };
        });

        setFilteredData(usersWithUpdatedStats);
      } else {
        setFilteredData(baseUsers);
      }

      setIsLoading(false);
      return;
    }

    const fromDate = dateRange.from ? new Date(dateRange.from) : new Date(0);
    const toDate = dateRange.to ? new Date(dateRange.to) : new Date();

    // Set time to end of day for the to date
    if (dateRange.to) {
      toDate.setHours(23, 59, 59, 999);
    }

    // Filter users based on their submissions within date range
    const filtered = baseUsers
      .map((user) => {
        // Filter submissions within date range
        const filteredSubmissions = user.submissions.filter((sub) => {
          const submissionDate = new Date(sub.submittedAt);
          return submissionDate >= fromDate && submissionDate <= toDate;
        });

        if (filteredSubmissions.length === 0) {
          // No submissions in date range, return null
          return null;
        }

        // Recalculate user stats based on filtered submissions
        const totalScore = filteredSubmissions.reduce(
          (sum, sub) => sum + (sub.totalScore || 0),
          0
        );
        const averageScore =
          filteredSubmissions.length > 0
            ? totalScore / filteredSubmissions.length
            : 0;
        const lastSubmission = filteredSubmissions.reduce((latest, current) => {
          return new Date(current.submittedAt) > new Date(latest.submittedAt)
            ? current
            : latest;
        }, filteredSubmissions[0]).submittedAt;

        return {
          ...user,
          totalScore,
          formCount: filteredSubmissions.length,
          averageScore,
          lastSubmission,
          submissions: filteredSubmissions,
        };
      })
      .filter(Boolean) as UserData[];

    setFilteredData(filtered);
    setIsLoading(false);
  }, [dateRange, selectedDepartment, selectedForm, departments]);

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(true);
    try {
      // Mock deletion - in a real app, you'd call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove user from state
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredData(filteredData.filter((user) => user.id !== userId));

      // Update department data
      const updatedDepartments = departments.map((dept) => {
        if (dept.name === selectedDepartment) {
          return {
            ...dept,
            users: updatedUsers,
            userCount: updatedUsers.length,
          };
        }
        return dept;
      });
      setDepartments(updatedDepartments);

      toast.success("User data deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user data");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle viewing user details
  const handleViewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  // Clear form selection
  const clearFormSelection = () => {
    setSelectedForm("");
  };

  // Table columns definition
  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => column.toggleSorting()}
        >
          User Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("fullName")}</div>
      ),
    },
    {
      accessorKey: "formCount",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => column.toggleSorting()}
        >
          Forms Submitted
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("formCount")}</div>
      ),
    },
    {
      accessorKey: "totalScore",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => column.toggleSorting()}
        >
          Total Score
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("totalScore")}</div>
      ),
    },
    {
      accessorKey: "averageScore",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => column.toggleSorting()}
        >
          Average Score
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {parseFloat(row.getValue("averageScore")).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "percentageComplete",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => column.toggleSorting()}
        >
          Completion %
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {parseFloat(row.getValue("percentageComplete")).toFixed(0)}%
        </div>
      ),
    },
    {
      accessorKey: "lastSubmission",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => column.toggleSorting()}
        >
          Last Submission
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {format(new Date(row.getValue("lastSubmission")), "yyyy-MM-dd HH:mm")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewUserDetails(row.original)}
          >
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all data for{" "}
                  {row.original.fullName}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-slate-300"
                  onClick={() => handleDeleteUser(row.original.id)}
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

  // React Table setup
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
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
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Department statistics
  const selectedDepartmentData = useMemo(() => {
    return departments.find((d) => d.name === selectedDepartment);
  }, [departments, selectedDepartment]);

  // Selected form data
  const selectedFormData = useMemo(() => {
    if (!selectedForm || !departmentForms.length) return null;
    return departmentForms.find((f) => f.id === selectedForm) || null;
  }, [selectedForm, departmentForms]);

  // Pie chart data for form distribution
  const formDistributionData = useMemo(() => {
    if (!selectedDepartmentData) return [];

    const formCounts: Record<string, number> = {};

    selectedDepartmentData.users.forEach((user) => {
      user.submissions.forEach((sub) => {
        formCounts[sub.formTitle] = (formCounts[sub.formTitle] || 0) + 1;
      });
    });

    return Object.entries(formCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [selectedDepartmentData]);

  // Return the component JSX

  return (
    <div className="space-y-6">
      {/* Department and Form selection */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="w-full md:w-1/3">
          <Label htmlFor="department">Select Department</Label>
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
            disabled={isLoading}
          >
            <SelectTrigger id="department" className="mt-1">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.name} value={dept.name}>
                  {dept.name} ({dept.userCount} users)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDepartment && (
          <div className="w-full md:w-1/3">
            <Label htmlFor="form">Select Form (Optional)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Select
                value={selectedForm}
                onValueChange={setSelectedForm}
                disabled={isLoading || departmentForms.length === 0}
              >
                <SelectTrigger id="form" className="flex-1">
                  <SelectValue placeholder="All forms" />
                </SelectTrigger>
                <SelectContent>
                  {departmentForms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.title} ({form.submissionCount} submissions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedForm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFormSelection}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {selectedDepartment && (
          <div className="w-full md:w-1/3">
            <Label>Date Range Filter</Label>
            <div className="flex items-center gap-2 mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP")} -{" "}
                          {format(dateRange.to, "PPP")}
                        </>
                      ) : (
                        format(dateRange.from, "PPP")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) =>
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearDateFilter}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search input - only show when department is selected */}
      {selectedDepartment && (
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Initial state - no department selected */}
      {!selectedDepartment && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Select a Department</h3>
          <p className="text-muted-foreground max-w-md">
            Please select a department from the dropdown above to view analytics
            data.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      )}

      {/* Department statistics cards - only show when department is selected and not loading */}
      {showContent && selectedDepartmentData && !isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedDepartmentData.userCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Users in {selectedDepartmentData.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Submissions
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10M7 12h10M7 17h10" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedForm
                  ? departmentForms.find((f) => f.id === selectedForm)
                      ?.submissionCount || 0
                  : selectedDepartmentData.totalSubmissions}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedForm
                  ? `Submissions for selected form`
                  : `Total form submissions`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedForm
                  ? (
                      departmentForms.find((f) => f.id === selectedForm)
                        ?.averageScore || 0
                    ).toFixed(2)
                  : selectedDepartmentData.averageScore.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedForm ? "Form average" : "Department average"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {selectedForm ? "Completion Rate" : "Forms Per User"}
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedForm
                  ? `${(
                      (filteredData.length / selectedDepartmentData.userCount) *
                      100
                    ).toFixed(0)}%`
                  : selectedDepartmentData.userCount > 0
                  ? (
                      selectedDepartmentData.totalSubmissions /
                      selectedDepartmentData.userCount
                    ).toFixed(1)
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedForm
                  ? `Users who completed this form`
                  : `Average submissions per user`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data table - only show when department is selected and not loading */}
      {showContent && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>User Analytics</CardTitle>
            <CardDescription>
              {selectedDepartment
                ? selectedForm
                  ? `Showing ${filteredData.length} users who submitted "${
                      departmentForms.find((f) => f.id === selectedForm)?.title
                    }"`
                  : `Showing data for ${filteredData.length} users in ${selectedDepartment}`
                : "Select a department to view user data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  {selectedForm
                    ? "No users have submitted this form in the selected date range"
                    : "No data available for the selected filters"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
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
                      {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of{" "}
                    {filteredData.length} users
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts section - only show when department is selected and not loading */}
      {showContent &&
        selectedDepartmentData &&
        !isLoading &&
        filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedForm ? "User Performance" : "Form Distribution"}
                </CardTitle>
                <CardDescription>
                  {selectedForm
                    ? `User scores for ${
                        departmentForms.find((f) => f.id === selectedForm)
                          ?.title
                      }`
                    : `Distribution of form submissions in ${selectedDepartment}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {selectedForm ? (
                    // Bar chart for user performance on selected form
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredData.map((user) => ({
                          name: user.fullName,
                          score: parseFloat(user.averageScore.toFixed(2)),
                        }))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    // Pie chart for form distribution
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={formDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {formDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value} submissions`,
                            "Count",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedForm ? "Submission Timeline" : "User Performance"}
                </CardTitle>
                <CardDescription>
                  {selectedForm
                    ? `Submission dates for ${
                        departmentForms.find((f) => f.id === selectedForm)
                          ?.title
                      }`
                    : `Average scores by user in ${selectedDepartment}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {selectedForm ? (
                    // Timeline chart for selected form submissions
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredData.map((user) => {
                          const submission = user.submissions.find(
                            (s) => s.formId === selectedForm
                          );
                          return {
                            name: user.fullName,
                            date: format(
                              new Date(submission?.submittedAt || Date.now()),
                              "MM/dd"
                            ),
                            score: submission?.totalScore || 0,
                          };
                        })}
                        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#82ca9d" name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    // Bar chart for user performance across all forms
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredData.map((user) => ({
                          name: user.fullName,
                          score: parseFloat(user.averageScore.toFixed(2)),
                          submissions: user.formCount,
                        }))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="score"
                          fill="#8884d8"
                          name="Average Score"
                        />
                        <Bar
                          dataKey="submissions"
                          fill="#82ca9d"
                          name="Submissions"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* User details modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser &&
                `Detailed analytics for ${selectedUser.fullName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedUser.totalScore}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedUser.averageScore.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedUser.percentageComplete.toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="submissions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="submissions" className="space-y-4">
                  <h3 className="text-lg font-medium">Form Submissions</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">
                            Form Name
                          </TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">
                            Submission Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.submissions.map((submission, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center">
                              {submission.formTitle}
                            </TableCell>
                            <TableCell className="text-center">
                              {submission.totalScore || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {format(
                                new Date(submission.submittedAt),
                                "yyyy-MM-dd HH:mm"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <h3 className="text-lg font-medium">Performance Analysis</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedUser.submissions.map((sub) => ({
                          name: sub.formTitle,
                          score: sub.totalScore || 0,
                          date: format(new Date(sub.submittedAt), "MM/dd"),
                        }))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => {
                toast.success("User data exported successfully");
              }}
            >
              <Download className="h-4 w-4" /> Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
