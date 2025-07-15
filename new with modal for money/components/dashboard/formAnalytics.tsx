"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  DownloadCloudIcon,
  CalendarIcon,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { useAuth } from "../context/page";
import axios from "axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React from "react";

export function FormAnalytics() {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [submissionStats, setSubmissionStats] = useState({
    total: 0,
    views: 1024, // Mock data
    conversionRate: 0,
    avgCompletionTime: "2m 18s", // Mock data
  });
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();

  // User-related states
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [userFormCount, setUserFormCount] = useState(0);
  const [userStats, setUserStats] = useState<any>({
    totalSubmissions: 0,
    formDistribution: [],
    responseFields: [],
    lastSubmission: null,
  });
  const [formScores, setFormScores] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filteredUserSubmissions, setFilteredUserSubmissions] = useState<any[]>(
    []
  );
  const [totalScoreUser, setTotalScoreUser] = useState<any>([]);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [totalFormsScore, setTotalFormsScore] = useState(0); // Total score across all forms

  // New states for All Users Analytics tab
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [departmentForms, setDepartmentForms] = useState<any[]>([]);
  const [selectedDepartmentForm, setSelectedDepartmentForm] =
    useState<string>("all");
  const [allUsersDateRange, setAllUsersDateRange] = useState({
    from: "",
    to: "",
  });
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [isAllUsersDataLoaded, setIsAllUsersDataLoaded] = useState(false);
  const [isAllUsersLoading, setIsAllUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  }>({
    key: "department",
    direction: "ascending",
  });
  const [columns, setColumns] = useState([
    { id: "fullName", title: "User", isVisible: true },
    { id: "department", title: "Department", isVisible: true },
    { id: "totalSubmissions", title: "Total Submissions", isVisible: true },
    { id: "totalPercentage", title: "Total Percentage", isVisible: true },
    { id: "lastSubmission", title: "Last Submission", isVisible: true },
    { id: "formDetails", title: "Forms", isVisible: true },
  ]);

  const url = process.env.NEXT_PUBLIC_API_URL;
  const { user, role } = useAuth();

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Fetch all forms
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (user) {
      let id = user._id || user.id;
      axios
        .get(`${url}form/fetch/${id}`)
        .then((res) => {
          if (isMounted) {
            setForms(res.data);
            fetchAllSubmissions(res.data);

            res.data.map((form: any) => {
              if (form.percentage) {
                setFormScores((prev: any) => {
                  // Check if form already exists in scores
                  const existingFormIndex = prev.findIndex(
                    (score: any) => score.formName === form.title
                  );

                  if (existingFormIndex >= 0) {
                    // Update existing form's percentage
                    const updatedScores = [...prev];
                    updatedScores[existingFormIndex].percentage =
                      form.percentage;
                    return updatedScores;
                  } else {
                    // Add new form score
                    return [
                      ...prev,
                      {
                        formName: form.title,
                        percentage: form.percentage,
                        highestScore: form.highestScore,
                      },
                    ];
                  }
                });
              }
            });
          }
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Error fetching forms");
          console.error("Error fetching forms:", err);
          setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [url, user]);

  // Fetch all departments
  useEffect(() => {
    if (allSubmissions.length > 0) {
      // Extract unique departments from submissions
      const deptSet = new Set<string>();

      uniqueUsers.forEach((userData: any) => {
        if (userData[1] && userData[1] !== "No Department") {
          deptSet.add(userData[1]);
        }
      });

      setDepartments(Array.from(deptSet));
    }
  }, [allSubmissions, uniqueUsers]);

  // Update forms when department changes
  useEffect(() => {
    if (selectedDepartment && allSubmissions.length > 0) {
      // Get forms for the selected department
      const formSet = new Set<string>();
      const formMap = new Map<string, any>();

      allSubmissions.forEach((sub) => {
        if (
          selectedDepartment === "all" ||
          uniqueUsers.find(
            (u: any) => u[0] === sub.createdFor && u[1] === selectedDepartment
          )
        ) {
          formSet.add(sub.formId);
          formMap.set(sub.formId, {
            id: sub.formId,
            title: sub.formTitle,
            department: sub.department,
          });
        }
      });

      setDepartmentForms(Array.from(formMap.values()));
    }
  }, [selectedDepartment, allSubmissions, uniqueUsers]);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    setColumns(
      columns.map((col) => (col.id === columnId ? { ...col, isVisible } : col))
    );
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  // Get sorted and filtered data
  const sortedAndFilteredData = React.useMemo(() => {
    // First filter the data
    const filteredData = allUsersData.filter((user) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();

      // Search in user name and department
      if (
        user.fullName.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      // Search in form titles
      if (
        user.formDetails.some((form: any) =>
          form.formTitle.toLowerCase().includes(searchLower)
        )
      ) {
        return true;
      }

      return false;
    });

    // Then sort the filtered data
    return [...filteredData].sort((a, b) => {
      if (
        sortConfig.key === "totalSubmissions" ||
        sortConfig.key === "totalPercentage"
      ) {
        // Numeric sort
        const aValue = parseFloat(a[sortConfig.key]);
        const bValue = parseFloat(b[sortConfig.key]);

        return sortConfig.direction === "ascending"
          ? aValue - bValue
          : bValue - aValue;
      } else if (sortConfig.key === "lastSubmission") {
        // Date sort
        const aDate = a.lastSubmission
          ? new Date(a.lastSubmission).getTime()
          : 0;
        const bDate = b.lastSubmission
          ? new Date(b.lastSubmission).getTime()
          : 0;

        return sortConfig.direction === "ascending"
          ? aDate - bDate
          : bDate - aDate;
      } else {
        // String sort
        const aValue = String(a[sortConfig.key]).toLowerCase();
        const bValue = String(b[sortConfig.key]).toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      }
    });
  }, [allUsersData, searchQuery, sortConfig]);

  // Load all users data
  const loadAllUsersData = () => {
    setIsAllUsersLoading(true);

    // Filter submissions based on department, form, and date range
    let filteredSubmissions = [...allSubmissions];

    // Filter by department
    if (selectedDepartment !== "all") {
      filteredSubmissions = filteredSubmissions.filter((sub) => {
        const userInfo = uniqueUsers.find((u: any) => u[0] === sub.createdFor);
        return userInfo && userInfo[1] === selectedDepartment;
      });
    }

    // Filter by form
    if (selectedDepartmentForm !== "all") {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) => sub.formId === selectedDepartmentForm
      );
    }

    // Filter by date range
    if (allUsersDateRange.from || allUsersDateRange.to) {
      const fromDate = allUsersDateRange.from
        ? new Date(allUsersDateRange.from)
        : new Date(0);
      const toDate = allUsersDateRange.to
        ? new Date(allUsersDateRange.to)
        : new Date();

      // Set time to end of day for the to date
      if (allUsersDateRange.to) {
        toDate.setHours(23, 59, 59, 999);
      }

      filteredSubmissions = filteredSubmissions.filter((sub) => {
        const submissionDate = new Date(sub.submittedAt);
        return submissionDate >= fromDate && submissionDate <= toDate;
      });
    }

    // Group submissions by user
    const userSubmissionsMap = new Map<string, any[]>();

    filteredSubmissions.forEach((sub) => {
      if (sub.createdFor) {
        if (!userSubmissionsMap.has(sub.createdFor)) {
          userSubmissionsMap.set(sub.createdFor, []);
        }
        userSubmissionsMap.get(sub.createdFor)?.push(sub);
      }
    });

    // Calculate statistics for each user
    const usersData: any[] = [];

    userSubmissionsMap.forEach((userSubs, userName) => {
      // Get user info
      const userInfo = uniqueUsers.find((u: any) => u[0] === userName);
      const department = userInfo ? userInfo[1] : "Unknown";
      const fullName = userInfo && userInfo.length > 2 ? userInfo[2] : userName;

      // Count submissions per form and calculate scores
      const formCounts: { [key: string]: number } = {};
      const formScoresSum: { [key: string]: number } = {};
      const formPercentages: { [key: string]: number } = {};

      userSubs.forEach((sub) => {
        formCounts[sub.formTitle] = (formCounts[sub.formTitle] || 0) + 1;

        // Add scores by form
        if (sub.totalScore) {
          formScoresSum[sub.formTitle] =
            (formScoresSum[sub.formTitle] || 0) + sub.totalScore;
        }
      });

      // Calculate average scores and percentages for each form
      let totalPercentage = 0;
      const formDetails: any[] = [];

      Object.keys(formCounts).forEach((formTitle) => {
        const count = formCounts[formTitle];
        const totalScore = formScoresSum[formTitle] || 0;
        const avgScore = count > 0 ? totalScore / count : 0;

        // Find form percentage from formScores
        const matchingForm = formScores.find((f) => f.formName === formTitle);
        const formPercentage = matchingForm ? matchingForm.percentage || 0 : 0;
        const highestScore = matchingForm
          ? matchingForm.highestScore || 100
          : 100;

        // Calculate percentage score (convert raw score to percentage)
        const percentageScore =
          highestScore > 0 ? (avgScore / highestScore) * formPercentage : 0;
        totalPercentage += percentageScore;

        formDetails.push({
          formTitle,
          submissionCount: count,
          totalScore,
          averageScore: avgScore,
          formPercentage,
          percentageScore,
          highestScore,
        });
      });

      // Add user data
      usersData.push({
        userName,
        fullName,
        department,
        totalSubmissions: userSubs.length,
        formDetails,
        totalPercentage: totalPercentage.toFixed(1),
        lastSubmission: userSubs.reduce((latest, current) => {
          if (!latest) return current;
          return new Date(current.submittedAt) > new Date(latest.submittedAt)
            ? current
            : latest;
        }, null)?.submittedAt,
      });
    });

    // Sort by department and then by user name
    usersData.sort((a, b) => {
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department);
      }
      return a.fullName.localeCompare(b.fullName);
    });

    setAllUsersData(usersData);
    setIsAllUsersDataLoaded(true);
    setIsAllUsersLoading(false);
  };

  // Export all users data to Excel
  const exportAllUsersData = () => {
    try {
      // Create workbook with BOM for Arabic/Kurdish support
      let csvContent = "data:text/csv;charset=utf-8,\ufeff";

      // Add header row
      csvContent +=
        [
          "User Name",
          "Full Name",
          "Department",
          "Total Submissions",
          "Total Percentage",
          "Last Submission",
          "Forms Details",
        ].join(",") + "\r\n";

      // Add data rows
      allUsersData.forEach((userData) => {
        const formDetailsText = userData.formDetails
          .map(
            (fd: any) =>
              `${fd.formTitle}(${
                fd.submissionCount
              } submissions, ${fd.averageScore.toFixed(
                2
              )} avg score, ${fd.percentageScore.toFixed(2)}%)`
          )
          .join("; ");

        const rowData = [
          `"${userData.userName}"`,
          `"${userData.fullName}"`,
          `"${userData.department}"`,
          userData.totalSubmissions,
          `${userData.totalPercentage}%`,
          `"${formatDate(userData.lastSubmission)}"`,
          `"${formDetailsText}"`,
        ];

        csvContent += rowData.join(",") + "\r\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `all_users_analytics_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  // Fetch all submissions for all forms
  const fetchAllSubmissions = async (formsList: any[]) => {
    try {
      setIsLoading(true);
      const allSubmissionsData: any[] = [];
      const userMap = new Map(); // Use a Map instead of a Set

      // Fetch submissions for each form
      for (const form of formsList) {
        const response = await axios.get(
          `${url}formSubmission/form/${form._id}`
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          // Get current user role
          let userRole = await axios.post(`${url}user/fetchById`, {
            id: user._id || user.id,
          });

          // Filter submissions based on user role
          let relevantSubmissions = response.data.data;
          if (userRole.data.role === "user") {
            // For normal users, only show their own submissions
            relevantSubmissions = response.data.data.filter(
              (sub: any) => sub.createdFor === userRole.data.name
            );
          }

          // Add form information to each submission
          const submissionsWithFormInfo = relevantSubmissions.map(
            (sub: any) => ({
              ...sub,
              formTitle: form.title,
              formId: form._id,
              elements: form.elements,
            })
          );

          allSubmissionsData.push(...submissionsWithFormInfo);

          // Collect unique user names
          // Use Promise.all to handle async operations properly
          await Promise.all(
            relevantSubmissions.map(async (submission: any) => {
              if (submission.createdFor && submission.createdFor !== "None") {
                try {
                  let realDepartment;

                  if (userRole.data.role === "user") {
                    // For normal users, fetch only their own department
                    realDepartment = await axios.post(
                      `${url}user/fetchOneUser`,
                      {
                        names: userRole.data.name,
                      }
                    );
                  } else {
                    // For admin/other roles, fetch department for each submission
                    realDepartment = await axios.post(
                      `${url}user/fetchOneUser`,
                      {
                        names: submission.createdFor,
                      }
                    );
                  }

                  // Use the user name as the key to avoid duplicates
                  userMap.set(submission.createdFor, [
                    submission.createdFor,
                    realDepartment.data[0].department ||
                      submission.department ||
                      "No Department",
                    realDepartment.data[0].fullName,
                  ]);
                } catch (error) {
                  console.error("Error fetching user department:", error);
                  // Fallback to existing department or "No Department"
                  userMap.set(submission.createdFor, [
                    submission.createdFor,
                    submission.department || "No Department",
                  ]);
                }
              }
            })
          );
        }
      }

      // Update state with all submissions and unique users
      setAllSubmissions(allSubmissionsData);
      setUniqueUsers(Array.from(userMap.values()));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching all submissions:", error);
      toast.error("Failed to fetch submissions data");
      setIsLoading(false);
    }
  };

  // Handle form selection
  useEffect(() => {
    if (selectedFormId) {
      // Find the complete form object
      const formObj = forms.find((form) => form._id === selectedFormId);
      setSelectedForm(formObj);

      // Filter submissions for selected form from allSubmissions
      const formSubmissions = allSubmissions.filter(
        (sub) => sub.formId === selectedFormId
      );

      setSubmissions(formSubmissions);
      setSubmissionCount(formSubmissions.length);

      // Update stats
      const total = formSubmissions.length;
      setSubmissionStats({
        total,
        views: 1024, // Mock data
        conversionRate: total > 0 ? ((total / 1024) * 100).toFixed(1) : 0,
        avgCompletionTime: "2m 18s", // Mock data
      });
    }

    // Calculate and update total forms score
    if (
      userStats.formDistribution &&
      Array.isArray(userStats.formDistribution)
    ) {
      const totalScore = calculateTotalFormsScore(
        userStats.formDistribution,
        formScores
      );
      setTotalFormsScore(totalScore);
    }
  }, [
    selectedFormId,
    allSubmissions,
    forms,
    formScores,
    userStats.formDistribution,
  ]);

  // Handle user selection
  useEffect(() => {
    if (selectedUser) {
      // Filter submissions for selected user
      const userSubs = allSubmissions.filter(
        (sub) => sub.createdFor === selectedUser
      );

      setUserSubmissions(userSubs);
      setFilteredUserSubmissions(userSubs);
      setIsDateFiltered(false);
      setDateRange({ from: "", to: "" });

      // Count unique forms the user has submitted
      const uniqueFormIds = new Set(userSubs.map((sub) => sub.formId));
      setUserFormCount(uniqueFormIds.size);

      // Generate statistics for the user
      generateUserStats(userSubs);
    } else {
      setUserSubmissions([]);
      setFilteredUserSubmissions([]);
      setUserFormCount(0);
      setUserStats({
        totalSubmissions: 0,
        formDistribution: [],
        responseFields: [],
        lastSubmission: null,
        totalScore: 0,
      });
    }
  }, [selectedUser, allSubmissions]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Apply date filter to user submissions
  const applyDateFilter = () => {
    if (!dateRange.from && !dateRange.to) {
      clearDateFilter();
      return;
    }

    const fromDate = dateRange.from ? new Date(dateRange.from) : new Date(0);
    const toDate = dateRange.to ? new Date(dateRange.to) : new Date();

    // Set time to end of day for the to date
    if (dateRange.to) {
      toDate.setHours(23, 59, 59, 999);
    }

    const filtered = userSubmissions.filter((sub) => {
      const submissionDate = new Date(sub.submittedAt);
      return submissionDate >= fromDate && submissionDate <= toDate;
    });

    setFilteredUserSubmissions(filtered);
    setIsDateFiltered(true);

    // If no data found for the date range, reset stats to zero
    if (filtered.length === 0) {
      setTotalFormsScore(0);
      setUserStats({
        totalSubmissions: 0,
        formDistribution: [],
        responseFields: [],
        lastSubmission: null,
        totalScore: 0,
        formScores: {},
      });
    } else {
      // Otherwise, generate stats as usual
      generateUserStats(filtered);
    }
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateRange({ from: "", to: "" });
    setFilteredUserSubmissions(userSubmissions);
    setIsDateFiltered(false);

    // If there are no user submissions at all, reset stats to zero
    if (!userSubmissions.length) {
      setTotalFormsScore(0);
      setUserStats({
        totalSubmissions: 0,
        formDistribution: [],
        responseFields: [],
        lastSubmission: null,
        totalScore: 0,
        formScores: {},
      });
    } else {
      // Otherwise, generate stats as usual
      generateUserStats(userSubmissions);
    }
  };

  // Calculate total score from all forms
  const calculateTotalFormsScore = (
    formDistribution: any[],
    formScoresArray: any[]
  ) => {
    let totalScore = 0;

    // If formDistribution is empty, return 0
    if (!formDistribution || formDistribution.length === 0) {
      return 0;
    }

    formDistribution.forEach((formData) => {
      // Get the matching form from formScores state array
      const matchingForm = Array.isArray(formScoresArray)
        ? formScoresArray.find((form) => form.formName === formData.name)
        : null;

      if (matchingForm) {
        const percentage = matchingForm.percentage || 0;
        const highestScore = matchingForm.highestScore || 0;

        // Calculate individual form score using the formula
        if (highestScore > 0 && formData.value > 0) {
          const formScore =
            (formData.score / formData.value / highestScore) * percentage;
          totalScore += formScore;
        }
      }
    });

    return totalScore;
  };

  // Generate statistics for the selected user
  const generateUserStats = (userSubmissions: any[]) => {
    if (!userSubmissions.length) {
      // Reset all stats to zero/empty when no submissions
      setTotalFormsScore(0);
      setUserStats({
        totalSubmissions: 0,
        formDistribution: [],
        responseFields: [],
        lastSubmission: null,
        totalScore: 0,
        formScores: {},
      });
      return;
    }

    // Count submissions per form
    const formCounts: { [key: string]: number } = {};
    const formScores: { [key: string]: number } = {};

    userSubmissions.forEach((sub) => {
      formCounts[sub.formTitle] = (formCounts[sub.formTitle] || 0) + 1;

      // Add scores by form
      if (sub.totalScore) {
        formScores[sub.formTitle] =
          (formScores[sub.formTitle] || 0) + sub.totalScore;
      }
    });

    // Format for chart
    const formDistribution = Object.keys(formCounts).map((formTitle) => ({
      name: formTitle,
      value: formCounts[formTitle],
      score: formScores[formTitle] || 0,
    }));

    // Collect all response fields
    const allResponseFields: any[] = [];
    userSubmissions.forEach((sub) => {
      if (sub.responses) {
        Object.entries(sub.responses).forEach(([field, value]) => {
          allResponseFields.push({
            field,
            value,
            formTitle: sub.formTitle,
            submittedAt: sub.submittedAt,
          });
        });
      }
    });

    // Find the most recent submission
    const lastSubmission = userSubmissions.reduce((latest, current) => {
      if (!latest) return current;
      return new Date(current.submittedAt) > new Date(latest.submittedAt)
        ? current
        : latest;
    }, null);

    // Calculate total score
    const totalScore = userSubmissions.reduce((total, sub) => {
      if (sub.totalScore) {
        return total + sub.totalScore;
      }
      return total;
    }, 0);

    // Calculate total forms score using the formScores array from state
    const totalFormsScoreValue = calculateTotalFormsScore(
      formDistribution,
      formScores
    );

    // Update the total forms score state
    setTotalFormsScore(totalFormsScoreValue);

    // Update user stats
    setUserStats({
      totalSubmissions: userSubmissions.length,
      formDistribution,
      responseFields: allResponseFields,
      lastSubmission,
      totalScore: totalScore,
      formScores: formScores,
    });
  };

  // Get score for a specific form
  const getFormScore = (formTitle: string) => {
    return filteredUserSubmissions
      .filter((sub) => sub.formTitle === formTitle)
      .reduce((total, sub) => {
        return total + (sub.totalScore || 0);
      }, 0);
  };

  // Group response fields by form
  const getResponsesByForm = () => {
    const responsesByForm: { [key: string]: any[] } = {};

    // Use filtered submissions instead of all user submissions
    filteredUserSubmissions.forEach((sub) => {
      if (!responsesByForm[sub.formTitle]) {
        responsesByForm[sub.formTitle] = [];
      }

      if (sub.responses) {
        const formattedResponses = Object.entries(sub.responses).map(
          ([field, value]) => ({
            field,
            value,
            submittedAt: sub.submittedAt,
          })
        );

        responsesByForm[sub.formTitle].push({
          submissionId: sub._id,
          submittedAt: sub.submittedAt,
          responses: formattedResponses,
        });
      }
    });

    return responsesByForm;
  };

  // Generate field statistics for visualization
  const generateFieldStats = (formTitle: string) => {
    // Use filtered submissions instead of all user submissions
    const formSubs = filteredUserSubmissions.filter(
      (sub) => sub.formTitle === formTitle
    );
    const fieldCounts: { [key: string]: { [key: string]: number } } = {};

    formSubs.forEach((sub) => {
      if (sub.responses) {
        Object.entries(sub.responses).forEach(([field, value]) => {
          if (!fieldCounts[field]) {
            fieldCounts[field] = {};
          }

          const strValue = String(value);
          fieldCounts[field][strValue] =
            (fieldCounts[field][strValue] || 0) + 1;
        });
      }
    });

    // Format for charts
    const result: any[] = [];
    Object.entries(fieldCounts).forEach(([field, values]) => {
      const data = Object.entries(values).map(([value, count]) => ({
        name: value,
        value: count,
      }));

      result.push({
        field,
        data,
      });
    });

    return result;
  };

  // // Handle export functions
  // const handleExportCSV = () => {
  //   if (selectedUser && userSubmissions.length > 0) {
  //     toast.success(`Exporting CSV for ${selectedUser}`);
  //     // Implementation for CSV export would go here
  //   } else {
  //     toast.error("No data to export");
  //   }
  // };

  // const handleExportPDF = () => {
  //   if (selectedUser && userSubmissions.length > 0) {
  //     toast.success(`Exporting PDF for ${selectedUser}`);
  //     // Implementation for PDF export would go here
  //   } else {
  //     toast.error("No data to export");
  //   }
  // };

  // Render submission data in a formatted way
  const renderSubmissionData = (submission: any) => {
    if (!submission || !submission.responses) return null;

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Submitted: {new Date(submission.submittedAt).toLocaleString()}
        </p>
        <div className="grid gap-2">
          {Object.entries(submission.responses).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-2">
              <div className="font-medium">{key}:</div>
              <div>{String(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get all unique fields for a form
  const getFieldsForForm = (formTitle: string) => {
    const formSubs = userSubmissions.filter(
      (sub) => sub.formTitle === formTitle
    );
    const fields = new Set<string>();

    formSubs.forEach((sub) => {
      if (sub.responses) {
        Object.keys(sub.responses).forEach((field) => {
          fields.add(field);
        });
      }
    });

    return Array.from(fields);
  };

  // Format submissions for time series chart
  const generateTimeSeriesData = (formTitle: string, submissions: any[]) => {
    // Get all unique dates
    const dateMap = new Map<string, any>();
    const fields = getFieldsForForm(formTitle);

    // Process all submissions
    submissions.forEach((sub) => {
      const date = new Date(sub.submittedAt).toLocaleDateString();

      if (!dateMap.has(date)) {
        const dataPoint: any = { date };
        fields.forEach((field) => {
          dataPoint[field] = 0;
        });
        dateMap.set(date, dataPoint);
      }

      // Add values for each field
      sub.responses.forEach((resp: any) => {
        const value = resp.value;
        // Only add numeric values to the chart
        if (!isNaN(Number(value))) {
          dateMap.get(date)[resp.field] = Number(value);
        }
      });
    });

    // Convert map to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  // Format submissions for data table
  const formatSubmissionsForTable = (formTitle: string, submissions: any[]) => {
    return submissions
      .map((sub) => {
        const row: any = {
          date: new Date(sub.submittedAt).toLocaleString(),
          submissionId: sub.submissionId,
        };

        sub.responses.forEach((resp: any) => {
          row[resp.field] = resp.value;
        });

        return row;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Export table data to Excel
  const exportTableData = (formTitle: string, submissions: any[]) => {
    try {
      const fields = getFieldsForForm(formTitle);
      const tableData = formatSubmissionsForTable(formTitle, submissions);

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add header row
      csvContent += ["Date", ...fields].join(",") + "\r\n";

      // Add data rows
      tableData.forEach((row) => {
        const rowData = [
          `"${row.date}"`,
          ...fields.map((field) => `"${row[field] || ""}"`),
        ];
        csvContent += rowData.join(",") + "\r\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `${formTitle}_submissions_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Exported ${tableData.length} submissions for ${formTitle}`
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  // Generate unique date headers for the XY grid
  const generateDateHeaders = (formTitle: string, submissions: any[]) => {
    const uniqueDates = new Set<string>();

    submissions.forEach((sub) => {
      const date = new Date(sub.submittedAt).toLocaleDateString();
      uniqueDates.add(date);
    });

    // Convert to array and sort chronologically
    return Array.from(uniqueDates).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
  };

  // Get value for a specific field and date
  const getValueForFieldAndDate = (
    field: string,
    date: string,
    formTitle: string,
    submissions: any[]
  ) => {
    // Find submissions for this date
    const submissionsOnDate = submissions.filter((sub) => {
      const subDate = new Date(sub.submittedAt).toLocaleDateString();
      return subDate === date;
    });

    // Look for the field value in these submissions
    for (const sub of submissionsOnDate) {
      const response = sub.responses.find((resp: any) => resp.field === field);
      if (response) {
        // If it's a number, return it directly
        const value = response.value;
        if (!isNaN(Number(value))) {
          return Number(value);
        }
        // Otherwise return as string
        return value;
      }
    }

    return "-"; // No value found
  };

  // Export time series data to Excel
  const exportTimeSeriesData = (formTitle: string, submissions: any[]) => {
    try {
      const timeSeriesData = generateTimeSeriesData(formTitle, submissions);
      const fields = getFieldsForForm(formTitle);

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add header row
      csvContent += ["Date", ...fields].join(",") + "\r\n";

      // Add data rows
      timeSeriesData.forEach((row) => {
        const rowData = [
          `"${row.date}"`,
          ...fields.map((field) => `"${row[field] || 0}"`),
        ];
        csvContent += rowData.join(",") + "\r\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `${formTitle}_time_series_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported time series data for ${formTitle}`);
    } catch (error) {
      console.error("Error exporting time series data:", error);
      toast.error("Failed to export time series data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Form Analytics</h2>
          <p className="text-muted-foreground">
            View submission analytics and user data
          </p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList
          className={`grid w-full ${
            role === "admin" || role === "super admin"
              ? "grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {(role === "admin" || role === "super admin") && (
            <TabsTrigger value="forms" className="w-full">
              Form Analytics
            </TabsTrigger>
          )}
          <TabsTrigger value="users" className="w-full">
            User Analytics
          </TabsTrigger>
          {(role === "admin" || role === "super admin") && (
            <TabsTrigger value="allusers" className="w-full">
              All Users Analytics
            </TabsTrigger>
          )}
        </TabsList>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Selection</CardTitle>
              <CardDescription>
                Select a user to view their form submission analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="user-select">Select User</Label>
                  <Select
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                    disabled={isLoading || uniqueUsers.length === 0}
                  >
                    <SelectTrigger id="user-select">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueUsers.map((userName) => (
                        <SelectItem
                          key={userName[0]}
                          value={userName[0]}
                          className="relative"
                        >
                          <span>{userName[2]}</span>
                          <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-md absolute right-1 top-1">
                            {userName[1] || "No Department"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                {selectedUser && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date-from">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              format(new Date(dateRange.from), "yyyy-MM-dd")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              dateRange.from
                                ? new Date(dateRange.from)
                                : undefined
                            }
                            onSelect={(date) =>
                              setDateRange((prev) => ({
                                ...prev,
                                from: date ? format(date, "yyyy-MM-dd") : "",
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date-to">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.to && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.to ? (
                              format(new Date(dateRange.to), "yyyy-MM-dd")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              dateRange.to ? new Date(dateRange.to) : undefined
                            }
                            onSelect={(date) =>
                              setDateRange((prev) => ({
                                ...prev,
                                to: date ? format(date, "yyyy-MM-dd") : "",
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="col-span-2">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={applyDateFilter}
                      >
                        Apply Filter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedUser && (
            <>
              {/* Display active filters if any */}
              {isDateFiltered && (
                <div className="bg-muted rounded-md p-2 flex items-center justify-between">
                  <span className="text-sm">
                    Showing data from {formatDate(dateRange.from)} to{" "}
                    {formatDate(dateRange.to)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                    Clear Filter
                  </Button>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Raw Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userStats.totalScore || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Score for all forms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalFormsScore.toFixed(2) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Combined score from all forms
                    </p>
                  </CardContent>
                </Card>

                {/* Form-specific score cards */}
                {userStats.formDistribution &&
                  userStats.formDistribution.map((formData, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle
                          className="text-sm font-medium truncate"
                          title={formData.name}
                        >
                          {formData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col">
                          <div className="text-2xl font-bold">
                            {(() => {
                              const score = getFormScore(formData.name);
                              const matchingForm = formScores.find(
                                (form) => form.formName === formData.name
                              );
                              const percentage = matchingForm?.percentage || 0;
                              const highestScore =
                                matchingForm?.highestScore || 0;

                              return (
                                (
                                  (score / formData.value / highestScore) *
                                  percentage
                                ).toFixed(2) || 0
                              );
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formData.value} submission
                            {formData.value !== 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Percentage :{" "}
                            {(() => {
                              const matchingForm = formScores.find(
                                (form) => form.formName === formData.name
                              );
                              return matchingForm?.percentage || 0;
                            })()}
                            %
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Form-specific data for the selected user */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Submissions</CardTitle>
                  <CardDescription>
                    Detailed view of all submissions by {selectedUser}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue={
                      userSubmissions.length > 0
                        ? userSubmissions[0].formTitle
                        : ""
                    }
                  >
                    <TabsList className="mb-4 w-full overflow-auto">
                      {Object.keys(getResponsesByForm()).map((formTitle) => (
                        <TabsTrigger key={formTitle} value={formTitle}>
                          {formTitle}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(getResponsesByForm()).map(
                      ([formTitle, submissions]) => (
                        <TabsContent
                          key={formTitle}
                          value={formTitle}
                          className="space-y-4"
                        >
                          {/* XY Grid Table Visualization */}
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle>Time Series Data Grid</CardTitle>
                                <CardDescription>
                                  Field values by date
                                </CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  exportTimeSeriesData(formTitle, submissions)
                                }
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="bg-muted">
                                          Highest Score ({" "}
                                          {formScores.find(
                                            (form) =>
                                              form.formName === formTitle
                                          )?.highestScore || 0}{" "}
                                          )
                                        </TableHead>
                                        {generateDateHeaders(
                                          formTitle,
                                          submissions
                                        ).map((date, index) => (
                                          <TableHead
                                            key={index}
                                            className="bg-muted text-center min-w-[100px]"
                                          >
                                            {date}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {getFieldsForForm(formTitle)
                                        .filter(
                                          (field) =>
                                            !field
                                              .toLowerCase()
                                              .includes("name") &&
                                            !field.toLowerCase().includes("ناو")
                                        )
                                        .map((field, rowIndex) => (
                                          <TableRow key={rowIndex}>
                                            <TableCell className="font-medium bg-muted">
                                              {field}
                                            </TableCell>
                                            {generateDateHeaders(
                                              formTitle,
                                              submissions
                                            ).map((date, colIndex) => (
                                              <TableCell
                                                key={colIndex}
                                                className="text-center"
                                              >
                                                {getValueForFieldAndDate(
                                                  field,
                                                  date,
                                                  formTitle,
                                                  submissions
                                                )}
                                              </TableCell>
                                            ))}
                                          </TableRow>
                                        ))}

                                      {/* Total Row */}
                                      <TableRow>
                                        <TableCell className="font-bold bg-muted">
                                          Total
                                        </TableCell>
                                        {generateDateHeaders(
                                          formTitle,
                                          submissions
                                        ).map((date, colIndex) => {
                                          const total = getFieldsForForm(
                                            formTitle
                                          )
                                            .filter(
                                              (field) =>
                                                !field
                                                  .toLowerCase()
                                                  .includes("name") &&
                                                !field
                                                  .toLowerCase()
                                                  .includes("ناو")
                                            )
                                            .reduce((sum, field) => {
                                              const value =
                                                getValueForFieldAndDate(
                                                  field,
                                                  date,
                                                  formTitle,
                                                  submissions
                                                );
                                              return (
                                                sum +
                                                (typeof value === "number"
                                                  ? value
                                                  : 0)
                                              );
                                            }, 0);

                                          return (
                                            <TableCell
                                              key={colIndex}
                                              className="text-center font-bold"
                                            >
                                              {total}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* Field statistics charts */}
                            {generateFieldStats(formTitle).map((fieldStat) => {
                              // Check if any value in fieldStat.data is a number
                              const hasNumericValues = fieldStat.data.some(
                                (item) => !isNaN(Number(item.name))
                              );

                              // Only render chart if field contains numeric values
                              if (!hasNumericValues) return null;

                              return (
                                <Card key={fieldStat.field}>
                                  <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                      {fieldStat.field}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-60">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <PieChart>
                                          <Pie
                                            data={fieldStat.data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) =>
                                              `${name}: ${(
                                                percent * 100
                                              ).toFixed(0)}%`
                                            }
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                          >
                                            {fieldStat.data.map(
                                              (entry: any, index: number) => (
                                                <Cell
                                                  key={`cell-${index}`}
                                                  fill={
                                                    COLORS[
                                                      index % COLORS.length
                                                    ]
                                                  }
                                                />
                                              )
                                            )}
                                          </Pie>
                                          <Tooltip />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>

                          {/* DataTable with Excel Export */}
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle>Submission Details</CardTitle>
                                <CardDescription>
                                  Detailed view of all submissions
                                </CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  exportTableData(formTitle, submissions)
                                }
                              >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export Excel
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      {getFieldsForForm(formTitle).map(
                                        (field) => (
                                          <TableHead key={field}>
                                            {field}
                                          </TableHead>
                                        )
                                      )}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {formatSubmissionsForTable(
                                      formTitle,
                                      submissions
                                    ).map((row, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{row.date}</TableCell>
                                        {getFieldsForForm(formTitle).map(
                                          (field) => (
                                            <TableCell key={field}>
                                              {row[field] || "-"}
                                            </TableCell>
                                          )
                                        )}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )
                    )}
                  </Tabs>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Form Distribution</CardTitle>
                  <CardDescription>
                    Forms submitted by {selectedUser}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {userStats.formDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userStats.formDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {userStats.formDistribution.map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          No data available
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Form Analytics Tab */}
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Selection</CardTitle>
              <CardDescription>
                Select a form to view its submission analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="form-select">Select Form</Label>
                  <Select
                    value={selectedFormId}
                    onValueChange={setSelectedFormId}
                    disabled={isLoading || forms.length === 0}
                  >
                    <SelectTrigger id="form-select">
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem
                          className="relative"
                          key={form._id}
                          value={form._id}
                        >
                          {form.title}
                          <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-md absolute right-1 top-1">
                            {form.createdBy || "No Admin"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedForm && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {submissionStats.total}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Form Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {submissionStats.views}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Conversion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {submissionStats.conversionRate}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Completion Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {submissionStats.avgCompletionTime}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Submissions</CardTitle>
                  <CardDescription>
                    Recent submissions for {selectedForm.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submissions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.slice(0, 5).map((submission) => (
                          <TableRow key={submission._id}>
                            <TableCell>
                              {submission.createdFor || "Anonymous"}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                submission.submittedAt
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {renderSubmissionData(submission)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-muted-foreground">
                        No submissions yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* All Users Analytics Tab */}
        <TabsContent value="allusers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users Analytics</CardTitle>
              <CardDescription>
                View analytics for all users across departments and forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Department Selection */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                    disabled={isAllUsersLoading}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Form Selection */}
                <div className="space-y-2">
                  <Label htmlFor="form">Form</Label>
                  <Select
                    value={selectedDepartmentForm}
                    onValueChange={setSelectedDepartmentForm}
                    disabled={isAllUsersLoading}
                  >
                    <SelectTrigger id="form">
                      <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      {departmentForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.title}
                          <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-md absolute right-1 top-1">
                            {form.department || "No Department"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !allUsersDateRange.from && "text-muted-foreground"
                        )}
                        disabled={isAllUsersLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {allUsersDateRange.from ? (
                          format(new Date(allUsersDateRange.from), "yyyy-MM-dd")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          allUsersDateRange.from
                            ? new Date(allUsersDateRange.from)
                            : undefined
                        }
                        onSelect={(date) =>
                          setAllUsersDateRange({
                            ...allUsersDateRange,
                            from: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        disabled={isAllUsersLoading}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !allUsersDateRange.to && "text-muted-foreground"
                        )}
                        disabled={isAllUsersLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {allUsersDateRange.to ? (
                          format(new Date(allUsersDateRange.to), "yyyy-MM-dd")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          allUsersDateRange.to
                            ? new Date(allUsersDateRange.to)
                            : undefined
                        }
                        onSelect={(date) =>
                          setAllUsersDateRange({
                            ...allUsersDateRange,
                            to: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={loadAllUsersData} disabled={isAllUsersLoading}>
                  {isAllUsersLoading ? "Loading..." : "Show Data"}
                </Button>

                {isAllUsersDataLoaded && allUsersData.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={exportAllUsersData}
                    disabled={isAllUsersLoading}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to Excel
                  </Button>
                )}
              </div>

              {/* Results Table */}
              {isAllUsersDataLoaded && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search users, departments, forms..."
                      className="max-w-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {columns.map((column) => (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            checked={column.isVisible}
                            onCheckedChange={(value) =>
                              toggleColumnVisibility(column.id, !!value)
                            }
                          >
                            {column.title}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map(
                            (column) =>
                              column.isVisible && (
                                <TableHead
                                  key={column.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => handleSort(column.id)}
                                >
                                  <div className="flex items-center gap-1">
                                    {column.title}
                                    {sortConfig.key === column.id &&
                                      (sortConfig.direction === "ascending" ? (
                                        <ArrowUpIcon className="h-4 w-4" />
                                      ) : (
                                        <ArrowDownIcon className="h-4 w-4" />
                                      ))}
                                  </div>
                                </TableHead>
                              )
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAndFilteredData.length > 0 ? (
                          sortedAndFilteredData.map((userData, index) => (
                            <TableRow key={index} className="group">
                              {columns[0].isVisible && (
                                <TableCell className="font-medium">
                                  {userData.fullName}
                                </TableCell>
                              )}
                              {columns[1].isVisible && (
                                <TableCell>{userData.department}</TableCell>
                              )}
                              {columns[2].isVisible && (
                                <TableCell>
                                  {userData.totalSubmissions}
                                </TableCell>
                              )}
                              {columns[3].isVisible && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full max-w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                      <div
                                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${userData.totalPercentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span>{userData.totalPercentage}%</span>
                                  </div>
                                </TableCell>
                              )}
                              {columns[4].isVisible && (
                                <TableCell>
                                  {formatDate(userData.lastSubmission)}
                                </TableCell>
                              )}
                              {columns[5].isVisible && (
                                <TableCell>
                                  <Collapsible>
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-0"
                                      >
                                        <ChevronDown className="h-4 w-4 mr-1" />
                                        View Forms
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-2 mt-2">
                                      {userData.formDetails.map(
                                        (formDetail: any, fdIndex: number) => (
                                          <div
                                            key={fdIndex}
                                            className="text-xs border rounded-md p-2 bg-muted/30"
                                          >
                                            <div className="font-medium">
                                              {formDetail.formTitle} (
                                              {formDetail.formPercentage}%)
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className="w-full max-w-32 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                                <div
                                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                                  style={{
                                                    width: `${formDetail.percentageScore}%`,
                                                  }}
                                                ></div>
                                              </div>
                                              <span>
                                                {formDetail.percentageScore.toFixed(
                                                  1
                                                )}
                                                %
                                              </span>
                                            </div>
                                            <div className="text-muted-foreground mt-1">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                                {formDetail.submissionCount}
                                              </span>
                                              submissions. Highest Score :
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                                {formDetail.highestScore}
                                              </span>
                                              . Avg:{" "}
                                              <span className="font-medium">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                                  {formDetail.averageScore.toFixed(
                                                    1
                                                  )}
                                                </span>
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </CollapsibleContent>
                                  </Collapsible>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={
                                columns.filter((c) => c.isVisible).length
                              }
                              className="h-24 text-center"
                            >
                              No results found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
