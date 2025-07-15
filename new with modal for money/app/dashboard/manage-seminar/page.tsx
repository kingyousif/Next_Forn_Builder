"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/context/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Building,
  Clock,
  Users,
  MapPin,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

const ManageSeminarPage = () => {
  const { user, token, role } = useAuth();
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSeminar, setEditingSeminar] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    location: "",
    maxAttendees: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingSeminar, setViewingSeminar] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Check if user has admin privileges
  const isAdmin = role === "admin" || role === "super admin";

  // Fetch seminars from API
  const fetchSeminars = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}seminar/fetch`,
        {
          username: user.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSeminars(response.data.seminars || response.data || []);
    } catch (error) {
      console.error("Error fetching seminars:", error);
      toast.error("Failed to fetch seminars");
      setSeminars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.name) {
      fetchSeminars();
    }
  }, [token, user]);

  // Filter seminars based on search and status
  const filteredSeminars = seminars.filter((seminar) => {
    const matchesSearch =
      seminar.seminarTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seminar.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seminar.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seminar.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seminar.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || seminar.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle view seminar details
  const handleView = (seminar) => {
    setViewingSeminar(seminar);
    setIsViewDialogOpen(true);
  };

  // Handle edit seminar
  const handleEdit = (seminar) => {
    setEditingSeminar(seminar);
    setEditForm({
      status: seminar.status || "pending",
      location: seminar.location || "",
      maxAttendees: seminar.maxAttendees || "5000",
    });
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}seminar/update/${editingSeminar._id}`,
        {
          status: editForm.status,
          location: editForm.location,
          maxAttendees: editForm.maxAttendees
            ? Number(editForm.maxAttendees)
            : 5000,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update local state
        setSeminars(
          seminars.map((seminar) =>
            seminar._id === editingSeminar._id
              ? {
                  ...seminar,
                  ...editForm,
                  maxAttendees: Number(editForm.maxAttendees),
                }
              : seminar
          )
        );
        setIsEditDialogOpen(false);
        toast.success("Seminar updated successfully!");
      }
    } catch (error) {
      console.error("Error updating seminar:", error);
      toast.error("Failed to update seminar");
    }
  };

  // Handle delete seminar
  const handleDelete = async (seminarId) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}seminar/delete/${seminarId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSeminars(seminars.filter((seminar) => seminar._id !== seminarId));
        toast.success("Seminar deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting seminar:", error);
      toast.error("Failed to delete seminar");
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const variants = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      completed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return variants[status] || variants.pending;
  };

  // Export seminars to CSV
  const exportToCSV = () => {
    const headers = [
      "Seminar Title",
      "Organizer",
      "Department",
      "Date",
      "Time",
      "Duration",
      "Status",
      "Attendees",
      "Location",
    ];

    const csvData = filteredSeminars.map((seminar) => [
      seminar.seminarTitle,
      seminar.fullName,
      seminar.department,
      format(new Date(seminar.date), "yyyy-MM-dd"),
      `${seminar.fromTime} - ${seminar.toTime}`,
      seminar.duration,
      seminar.status,
      seminar.attendees?.length || 0,
      seminar.location || "TBD",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seminars_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading seminars...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Seminars
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all seminars in the system
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search seminars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchSeminars}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seminars Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Seminars ({filteredSeminars.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSeminars.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No seminars found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No seminars have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seminar Details</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSeminars.map((seminar) => (
                    <TableRow key={seminar._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {seminar.seminarTitle}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {seminar.description?.substring(0, 60)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{seminar.fullName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            @{seminar.username}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {seminar.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(seminar.date), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Clock className="h-4 w-4" />
                          {seminar.fromTime} - {seminar.toTime}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {seminar.duration}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(seminar.status)}>
                          {seminar.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {seminar.attendees?.length || 0}/
                            {seminar.maxAttendees || 5000}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-4 w-4" />
                          {seminar.location || "TBD"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(seminar)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(seminar)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Seminar
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "
                                      {seminar.seminarTitle}"? This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(seminar._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Seminar Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Seminar Details
            </DialogTitle>
          </DialogHeader>
          {viewingSeminar && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Seminar Title
                  </Label>
                  <p className="text-lg font-semibold">
                    {viewingSeminar.seminarTitle}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </Label>
                  <Badge className={getStatusBadge(viewingSeminar.status)}>
                    {viewingSeminar.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Description
                </Label>
                <p className="mt-1">{viewingSeminar.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Organizer
                  </Label>
                  <p>
                    {viewingSeminar.fullName} (@{viewingSeminar.username})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Department
                  </Label>
                  <p>{viewingSeminar.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date
                  </Label>
                  <p>{format(new Date(viewingSeminar.date), "PPP")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Time
                  </Label>
                  <p>
                    {viewingSeminar.fromTime} - {viewingSeminar.toTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Duration
                  </Label>
                  <p>{viewingSeminar.duration}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Location
                  </Label>
                  <p>{viewingSeminar.location || "To be determined"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Max Attendees
                  </Label>
                  <p>{viewingSeminar.maxAttendees || 5000}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Registered Attendees ({viewingSeminar.attendees?.length || 0})
                </Label>
                {viewingSeminar.attendees &&
                viewingSeminar.attendees.length > 0 ? (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {viewingSeminar.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <User className="h-4 w-4" />
                        <span>
                          {attendee.fullName} (@{attendee.username})
                        </span>
                        <span className="text-sm text-gray-500">
                          -{" "}
                          {format(
                            new Date(attendee.registeredAt),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-1">
                    No attendees registered yet
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Seminar Dialog */}
      {isAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Seminar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Enter seminar location"
                />
              </div>
              <div>
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={editForm.maxAttendees}
                  onChange={(e) =>
                    setEditForm({ ...editForm, maxAttendees: e.target.value })
                  }
                  placeholder="Maximum number of attendees"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageSeminarPage;
