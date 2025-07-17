"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  UserPlus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  DollarSign,
  Building,
  Camera,
  FileImage,
  FileText,
  Download,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/components/context/page";
import * as XLSX from "xlsx";

type DatabaseUser = {
  id: number;
  name: string;
  fullName: string;
  UserName: string;
  role: "super admin" | "admin" | "user";
  department?: string;
  _id?: string;
};

type EmployeeProfile = {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  certificate: string;
  graduationYear: string;
  specialty: string; // پسپۆڕی
  workPosition: string;
  profession: string; // پیشە
  residence: string; // شوێنی نیشتەجێبوون
  maritalStatus: string; // باری خێزانداری
  numberOfChildren: string;
  bloodType: string;
  phoneNumber: string;
  email: string;
  workStartDate: string;
  establishmentType: string; // جۆری دامەزراندن
  salary: string;
  workLocation: string; // شوێنی کار لە کەرتی گشتی
  profileImage?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  passportFront?: string;
  passportBack?: string;
  assignedUserId?: string; // New field for user assignment
  assignedUserName?: string; // Store user name for display
  createdAt: string;
};

const EmployeeProfilePage = () => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [databaseUsers, setDatabaseUsers] = useState<DatabaseUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeProfile | null>(null);
  const [viewingEmployee, setViewingEmployee] =
    useState<EmployeeProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { user, token } = useAuth();
  const url = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState<Partial<EmployeeProfile>>({
    name: "",
    gender: "",
    dateOfBirth: "",
    certificate: "",
    graduationYear: "",
    specialty: "",
    workPosition: "",
    profession: "",
    residence: "",
    maritalStatus: "",
    numberOfChildren: "",
    bloodType: "",
    phoneNumber: "",
    email: "",
    workStartDate: "",
    establishmentType: "",
    salary: "",
    workLocation: "",
    assignedUserId: "",
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEmployees = localStorage.getItem("employeeProfiles");
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
    fetchDatabaseUsers();
  }, []);

  // Save to localStorage whenever employees change
  useEffect(() => {
    localStorage.setItem("employeeProfiles", JSON.stringify(employees));
  }, [employees]);

  // Fetch users from database
  const fetchDatabaseUsers = async () => {
    if (!user || !url) return;

    setLoadingUsers(true);
    try {
      const response = await axios.post<DatabaseUser[]>(`${url}user/fetch`, {
        id: user._id || user.id,
      });
      setDatabaseUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في جلب المستخدمين من قاعدة البيانات");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (employees.length === 0) {
      toast.error("هیچ زانیاریەک بۆ هەناردەکردن نییە");
      return;
    }

    const exportData = employees.map((emp) => ({
      "ناوی چوارەم": emp.name,
      ڕەگەز: emp.gender,
      "بەرواری لەدایکبوون": emp.dateOfBirth,
      بڕوانامە: emp.certificate,
      "ساڵی دەرچوون": emp.graduationYear,
      پسپۆڕی: emp.specialty,
      "پۆستی کار": emp.workPosition,
      پیشە: emp.profession,
      "شوێنی نیشتەجێبوون": emp.residence,
      "باری خێزانداری": emp.maritalStatus,
      "ژمارەی منداڵان": emp.numberOfChildren,
      "جۆری خوێن": emp.bloodType,
      "ژمارەی تەلەفۆن": emp.phoneNumber,
      ئیمەیڵ: emp.email,
      "بەرواری دەستپێکردنی کار": emp.workStartDate,
      "جۆری دامەزراندن": emp.establishmentType,
      مووچە: emp.salary,
      "شوێنی کار لە کەرتی گشتی": emp.workLocation,
      "بەکارهێنەری تەرخانکراو": emp.assignedUserName || "تەرخان نەکراوە",
      "بەرواری دروستکردن": new Date(emp.createdAt).toLocaleDateString("ku"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "زانیاری کارمەندان");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `employee-profiles-${currentDate}.xlsx`;

    XLSX.writeFile(wb, filename);
    toast.success("فایلی Excel بە سەرکەوتوویی هەناردەکرا");
  };

  const handleInputChange = (field: keyof EmployeeProfile, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // If assigning a user, also store the user name
      if (field === "assignedUserId" && value) {
        const selectedUser = databaseUsers.find(
          (u) => (u._id || u.id.toString()) === value
        );
        if (selectedUser) {
          updated.assignedUserName = selectedUser.fullName || selectedUser.name;
        }
      } else if (field === "assignedUserId" && !value) {
        updated.assignedUserName = "";
      }

      return updated;
    });
  };

  const handleImageUpload = (field: keyof EmployeeProfile, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.gender || !formData.dateOfBirth) {
      toast.error("تکایە خانە پێویستەکان پڕبکەرەوە");
      return;
    }

    const newEmployee: EmployeeProfile = {
      id: editingEmployee?.id || Date.now().toString(),
      ...(formData as EmployeeProfile),
      createdAt: editingEmployee?.createdAt || new Date().toISOString(),
    };

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editingEmployee.id ? newEmployee : emp))
      );
      toast.success("زانیاریەکان بە سەرکەوتوویی نوێکرانەوە");
    } else {
      setEmployees((prev) => [...prev, newEmployee]);
      toast.success("کارمەند بە سەرکەوتوویی زیادکرا");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      dateOfBirth: "",
      certificate: "",
      graduationYear: "",
      specialty: "",
      workPosition: "",
      profession: "",
      residence: "",
      maritalStatus: "",
      numberOfChildren: "",
      bloodType: "",
      phoneNumber: "",
      email: "",
      workStartDate: "",
      establishmentType: "",
      salary: "",
      workLocation: "",
      assignedUserId: "",
    });
    setEditingEmployee(null);
  };

  const handleEdit = (employee: EmployeeProfile) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    toast.success("کارمەند بە سەرکەوتوویی سڕایەوە");
  };

  const handleView = (employee: EmployeeProfile) => {
    setViewingEmployee(employee);
    setIsViewDialogOpen(true);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.workPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.assignedUserName &&
        employee.assignedUserName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const ImageUploadField = ({
    label,
    field,
    currentImage,
  }: {
    label: string;
    field: keyof EmployeeProfile;
    currentImage?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(field, file);
            }}
            className="hidden"
            id={field}
          />
          <label
            htmlFor={field}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-600 dark:text-blue-400">
              هەڵبژاردن
            </span>
          </label>
        </div>
        {(currentImage || formData[field]) && (
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={currentImage || (formData[field] as string)}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );

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
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    بەڕێوەبردنی پرۆفایلی کارمەندان
                  </h1>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    زانیاری تەواوی کارمەندان و بەڕێوەبردنی پرۆفایلەکانیان
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                <Download className="mr-2 h-4 w-4" />
                هەناردەکردنی Excel
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={resetForm}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    زیادکردنی کارمەندی نوێ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-right">
                      {editingEmployee
                        ? "دەستکاریکردنی زانیاری کارمەند"
                        : "زیادکردنی کارمەندی نوێ"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-right">
                        زانیاری گشتی
                      </h3>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          ناوی چوارەم *
                        </Label>
                        <Input
                          value={formData.name || ""}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="ناوی تەواو بنووسە"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">ڕەگەز *</Label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) =>
                            handleInputChange("gender", value)
                          }
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="ڕەگەز هەڵبژێرە" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="نێر">نێر</SelectItem>
                            <SelectItem value="مێ">مێ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          بەرواری لەدایکبوون *
                        </Label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth || ""}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">بڕوانامە</Label>
                        <Select
                          value={formData.certificate || ""}
                          onValueChange={(value) =>
                            handleInputChange("certificate", value)
                          }
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="بڕوانامە هەڵبژێرە" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="بەکالۆریۆس">
                              بەکالۆریۆس
                            </SelectItem>
                            <SelectItem value="ماستەر">ماستەر</SelectItem>
                            <SelectItem value="دکتۆرا">دکتۆرا</SelectItem>
                            <SelectItem value="دیپلۆم">دیپلۆم</SelectItem>
                            <SelectItem value="ئامادەیی">ئامادەیی</SelectItem>
                            <SelectItem value="ناوەندی">ناوەندی</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">ساڵی دەرچوون</Label>
                        <Input
                          value={formData.graduationYear || ""}
                          onChange={(e) =>
                            handleInputChange("graduationYear", e.target.value)
                          }
                          placeholder="ساڵی دەرچوون"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">پسپۆڕی</Label>
                        <Input
                          value={formData.specialty || ""}
                          onChange={(e) =>
                            handleInputChange("specialty", e.target.value)
                          }
                          placeholder="پسپۆڕی"
                          className="text-right"
                        />
                      </div>

                      {/* User Assignment Field */}
                      <div className="space-y-2">
                        <Label className="text-right block">
                          تەرخانکردن بۆ بەکارهێنەر
                        </Label>
                        <Select
                          value={formData.assignedUserId || ""}
                          onValueChange={(value) =>
                            handleInputChange("assignedUserId", value)
                          }
                          disabled={loadingUsers}
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue
                              placeholder={
                                loadingUsers
                                  ? "بارکردنی بەکارهێنەران..."
                                  : "بەکارهێنەر هەڵبژێرە"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              هیچ بەکارهێنەرێک
                            </SelectItem>
                            {databaseUsers.map((dbUser) => (
                              <SelectItem
                                key={dbUser._id || dbUser.id}
                                value={dbUser._id || dbUser.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <Link className="h-3 w-3" />
                                  <span>{dbUser.fullName || dbUser.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {dbUser.role}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Work Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-right">
                        زانیاری کار
                      </h3>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          پۆستی کار لە نەخۆشخانە
                        </Label>
                        <Input
                          value={formData.workPosition || ""}
                          onChange={(e) =>
                            handleInputChange("workPosition", e.target.value)
                          }
                          placeholder="پۆستی کار"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">پیشە</Label>
                        <Input
                          value={formData.profession || ""}
                          onChange={(e) =>
                            handleInputChange("profession", e.target.value)
                          }
                          placeholder="پیشە"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          بەرواری دەستپێکردنی کار
                        </Label>
                        <Input
                          type="date"
                          value={formData.workStartDate || ""}
                          onChange={(e) =>
                            handleInputChange("workStartDate", e.target.value)
                          }
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          جۆری دامەزراندن
                        </Label>
                        <Select
                          value={formData.establishmentType || ""}
                          onValueChange={(value) =>
                            handleInputChange("establishmentType", value)
                          }
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="جۆری دامەزراندن هەڵبژێرە" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="خۆبەخشی">خۆبەخشی</SelectItem>
                            <SelectItem value="ئەزموونی">ئەزموونی</SelectItem>
                            <SelectItem value="گرێبەست">گرێبەست</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">مووچە</Label>
                        <Input
                          value={formData.salary || ""}
                          onChange={(e) =>
                            handleInputChange("salary", e.target.value)
                          }
                          placeholder="مووچە"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          شوێنی کار لە کەرتی گشتی
                        </Label>
                        <Input
                          value={formData.workLocation || ""}
                          onChange={(e) =>
                            handleInputChange("workLocation", e.target.value)
                          }
                          placeholder="شوێنی کار"
                          className="text-right"
                        />
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-right">
                        زانیاری کەسی
                      </h3>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          شوێنی نیشتەجێبوون
                        </Label>
                        <Input
                          value={formData.residence || ""}
                          onChange={(e) =>
                            handleInputChange("residence", e.target.value)
                          }
                          placeholder="شوێنی نیشتەجێبوون"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          باری خێزانداری
                        </Label>
                        <Select
                          value={formData.maritalStatus || ""}
                          onValueChange={(value) =>
                            handleInputChange("maritalStatus", value)
                          }
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="باری خێزانداری هەڵبژێرە" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="سەڵت">سەڵت</SelectItem>
                            <SelectItem value="هاوسەرگیری کردووە">
                              هاوسەرگیری کردووە
                            </SelectItem>
                            <SelectItem value="جیابووەتەوە">
                              جیابووەتەوە
                            </SelectItem>
                            <SelectItem value="بێوەژن">بێوەژن</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">ژمارەی منداڵ</Label>
                        <Input
                          type="number"
                          value={formData.numberOfChildren || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "numberOfChildren",
                              e.target.value
                            )
                          }
                          placeholder="ژمارەی منداڵ"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">جۆری خوێن</Label>
                        <Select
                          value={formData.bloodType || ""}
                          onValueChange={(value) =>
                            handleInputChange("bloodType", value)
                          }
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="جۆری خوێن هەڵبژێرە" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">
                          ژمارەی تەلەفۆن
                        </Label>
                        <Input
                          value={formData.phoneNumber || ""}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          placeholder="ژمارەی تەلەفۆن"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-right block">ئیمەیڵ</Label>
                        <Input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="ئیمەیڵ"
                          className="text-right"
                        />
                      </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-right">
                        وێنەکان
                      </h3>

                      <ImageUploadField
                        label="وێنەی پرۆفایل"
                        field="profileImage"
                        currentImage={formData.profileImage}
                      />

                      <ImageUploadField
                        label="وێنەی پێناسەی نیشتمانی (ڕووی پێشەوە)"
                        field="nationalIdFront"
                        currentImage={formData.nationalIdFront}
                      />

                      <ImageUploadField
                        label="وێنەی پێناسەی نیشتمانی (ڕووی دواوە)"
                        field="nationalIdBack"
                        currentImage={formData.nationalIdBack}
                      />

                      <ImageUploadField
                        label="وێنەی پاسپۆرت (ڕووی پێشەوە)"
                        field="passportFront"
                        currentImage={formData.passportFront}
                      />

                      <ImageUploadField
                        label="وێنەی پاسپۆرت (ڕووی دواوە)"
                        field="passportBack"
                        currentImage={formData.passportBack}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      پاشگەزبوونەوە
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {editingEmployee ? "نوێکردنەوە" : "زیادکردن"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Search and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="md:col-span-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="relative">
                <Input
                  placeholder="گەڕان بە ناو، پۆست، یان پیشە..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-right pr-10"
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground text-right">
                کۆی کارمەندان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-right">
                {employees.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground text-right">
                ئەنجامی گەڕان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 text-right">
                {filteredEmployees.length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employee Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {currentEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-blue-200 dark:border-blue-700">
                        <AvatarImage
                          src={employee.profileImage}
                          alt={employee.name}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold">
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-right">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.workPosition}
                        </p>
                        <div className="flex justify-end mt-2">
                          <Badge variant="outline" className="text-xs">
                            {employee.profession}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-muted-foreground">
                          {employee.gender}
                        </span>
                        <User className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-muted-foreground">
                          {employee.bloodType}
                        </span>
                        <Heart className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-muted-foreground">
                          {employee.phoneNumber}
                        </span>
                        <Phone className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-muted-foreground">
                          {employee.certificate}
                        </span>
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `/employee-cv-print?id=${employee.id}`,
                              "_blank"
                            )
                          }
                          className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          چاپی CV
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleView(employee)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        بینین
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              پێشوو
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-purple-600"
                    : ""
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              دواتر
            </Button>
          </motion.div>
        )}

        {/* View Employee Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-right">
                زانیاری تەواوی کارمەند
              </DialogTitle>
            </DialogHeader>

            {viewingEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Profile Section */}
                <div className="md:col-span-2 flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={viewingEmployee.profileImage}
                      alt={viewingEmployee.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {viewingEmployee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {viewingEmployee.name}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-1">
                      {viewingEmployee.workPosition}
                    </p>
                    <div className="flex justify-end gap-2 mt-3">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {viewingEmployee.profession}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {viewingEmployee.certificate}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right border-b pb-2">
                    زانیاری کەسی
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.gender}
                      </span>
                      <span className="text-muted-foreground">ڕەگەز:</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.dateOfBirth}
                      </span>
                      <span className="text-muted-foreground">
                        بەرواری لەدایکبوون:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.residence}
                      </span>
                      <span className="text-muted-foreground">
                        شوێنی نیشتەجێبوون:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.maritalStatus}
                      </span>
                      <span className="text-muted-foreground">
                        باری خێزانداری:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.numberOfChildren}
                      </span>
                      <span className="text-muted-foreground">
                        ژمارەی منداڵ:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.bloodType}
                      </span>
                      <span className="text-muted-foreground">جۆری خوێن:</span>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right border-b pb-2">
                    زانیاری کار
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.specialty}
                      </span>
                      <span className="text-muted-foreground">پسپۆڕی:</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.graduationYear}
                      </span>
                      <span className="text-muted-foreground">
                        ساڵی دەرچوون:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.workStartDate}
                      </span>
                      <span className="text-muted-foreground">
                        بەرواری دەستپێکردنی کار:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.establishmentType}
                      </span>
                      <span className="text-muted-foreground">
                        جۆری دامەزراندن:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.salary}
                      </span>
                      <span className="text-muted-foreground">مووچە:</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.workLocation}
                      </span>
                      <span className="text-muted-foreground">شوێنی کار:</span>
                    </div>
                    {viewingEmployee.assignedUserName && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {viewingEmployee.assignedUserName}
                        </span>
                        <span className="text-muted-foreground">
                          بەکارهێنەری تەرخانکراو:
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right border-b pb-2">
                    زانیاری پەیوەندی
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.phoneNumber}
                      </span>
                      <span className="text-muted-foreground">
                        ژمارەی تەلەفۆن:
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {viewingEmployee.email}
                      </span>
                      <span className="text-muted-foreground">ئیمەیڵ:</span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right border-b pb-2">
                    بەڵگەنامەکان
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {viewingEmployee.nationalIdFront && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-right">
                          پێناسەی نیشتمانی (پێشەوە)
                        </p>
                        <img
                          src={viewingEmployee.nationalIdFront}
                          alt="National ID Front"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {viewingEmployee.nationalIdBack && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-right">
                          پێناسەی نیشتمانی (دواوە)
                        </p>
                        <img
                          src={viewingEmployee.nationalIdBack}
                          alt="National ID Back"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {viewingEmployee.passportFront && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-right">
                          پاسپۆرت (پێشەوە)
                        </p>
                        <img
                          src={viewingEmployee.passportFront}
                          alt="Passport Front"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {viewingEmployee.passportBack && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-right">
                          پاسپۆرت (دواوە)
                        </p>
                        <img
                          src={viewingEmployee.passportBack}
                          alt="Passport Back"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
