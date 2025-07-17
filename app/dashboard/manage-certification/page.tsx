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
  Award,
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
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

const ManageCertificationPage = () => {
  const { user, token, role } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    score: "",
    reason: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Check if user has admin privileges
  const isAdmin = role === "admin" || role === "super admin";

  // Fetch certificates from API
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}certificate/fetch`,
        {
          userName: user.name,
        }
      );
      setCertificates(response.data.certificates || response.data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCertificates();
    }
  }, [token]);

  // Filter certificates based on search and status
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificationName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cert.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle edit certificate
  const handleEdit = (cert) => {
    setEditingCert(cert);
    setEditForm({
      status: cert.status || "pending",
      score: cert.score || "",
      reason: cert.reason || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/certificate/updateStatus/${editingCert._id}`,
        {
          status: editForm.status,
          score: editForm.score ? Number(editForm.score) : null,
          reason: editForm.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update local state
        setCertificates((prev) =>
          prev.map((cert) =>
            cert._id === editingCert._id
              ? {
                  ...cert,
                  status: editForm.status,
                  score: editForm.score ? Number(editForm.score) : null,
                  reason: editForm.reason,
                }
              : cert
          )
        );
        setIsEditDialogOpen(false);
        setEditingCert(null);
      }
    } catch (error) {
      console.error("Error updating certificate:", error);
      alert("Failed to update certificate. Please try again.");
    }
  };

  // Handle delete certificate
  const handleDelete = async (certId) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/certificate/delete/${certId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setCertificates((prev) => prev.filter((cert) => cert._id !== certId));
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete certificate. Please try again.");
    }
  };

  // Handle image view
  const handleViewImage = (imageUrl, certName) => {
    setSelectedImage({ url: imageUrl, name: certName });
    setIsImageDialogOpen(true);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading certificates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Award className="h-8 w-8 text-blue-600" />
          Manage Certifications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage all certification submissions
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, username, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchCertificates}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Certificates ({filteredCertificates.length})</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Info</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Submitted</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 8 : 7}
                      className="text-center py-8 text-gray-500"
                    >
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCertificates.map((cert) => (
                    <TableRow key={cert._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{cert.fullName}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            @{cert.username}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Building className="h-3 w-3" />
                            {cert.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {cert.certificationName}
                          </div>
                          {cert.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {cert.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(cert.fromDate), "MMM dd, yyyy")}
                          </div>
                          <div className="text-sm text-gray-500">to</div>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(cert.toDate), "MMM dd, yyyy")}
                          </div>
                          {cert.duration && (
                            <div className="text-xs text-gray-500">
                              ({cert.duration})
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(cert.status)}>
                          {cert.status?.charAt(0).toUpperCase() +
                            cert.status?.slice(1)}
                        </Badge>
                        {cert.reason && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {cert.reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cert.score ? (
                          <span className="font-medium">{cert.score}/10</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cert.certificationImage ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewImage(
                                `${process.env.NEXT_PUBLIC_API_URL}/uploads/${cert.certificationImage}`,
                                cert.certificationName
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(cert.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(cert.createdAt), "HH:mm")}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(cert)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Certificate
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    certificate? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(cert._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Score (0-10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={editForm.score}
                onChange={(e) =>
                  setEditForm({ ...editForm, score: e.target.value })
                }
                placeholder="Enter score"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason/Comments</Label>
              <Textarea
                value={editForm.reason}
                onChange={(e) =>
                  setEditForm({ ...editForm, reason: e.target.value })
                }
                placeholder="Enter reason or comments"
                rows={3}
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

      {/* Image View Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCertificationPage;
