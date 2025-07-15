"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/components/context/page";
import { toast } from "sonner";
import { format } from "date-fns";
import axios from "axios";

interface Seminar {
  _id: string;
  username: string;
  fullName: string;
  seminarTitle: string;
  description: string;
  department: string;
  date: string;
  fromTime: string;
  toTime: string;
  duration: string;
  status: "pending" | "approved" | "rejected" | "completed";
  attendees: Array<{
    username: string;
    fullName: string;
    department: string;
    registeredAt: string;
  }>;
  maxAttendees: number;
  location: string;
  active: boolean;
}

interface RegistrationForm {
  username: string;
  fullName: string;
  seminarTitle: string;
}

export default function SeminarRegistrationPage() {
  const { user, token } = useAuth();
  const [upcomingSeminars, setUpcomingSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    username: "",
    fullName: "",
    seminarTitle: "",
  });
  const [userIP, setUserIP] = useState<string>("");
  const [ipValid, setIpValid] = useState<boolean>(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const url = process.env.NEXT_PUBLIC_API_URL;
  const allowedIP = "62.201.223.254"; // Only this specific IP is allowed

  // Check if IP matches the allowed IP
  const isIPAllowed = (ip: string): boolean => {
    return ip === allowedIP;
  };

  // Get user's IP address
  const getUserIP = async () => {
    try {
      // Try multiple IP detection services
      const services = [
        "https://api.ipify.org?format=json",
        "https://ipapi.co/json/",
        "https://httpbin.org/ip",
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          const ip = data.ip || data.origin;
          if (ip) {
            setUserIP(ip);
            const valid = isIPAllowed(ip);
            setIpValid(valid);
            if (!valid) {
              toast.error(
                `Access denied. Your IP (${ip}) is not authorized. Only ${allowedIP} is allowed.`
              );
            }
            return;
          }
        } catch (error) {
          continue;
        }
      }

      // Fallback for local development - you may want to remove this in production
      const localIP = "62.201.223.254"; // Simulate allowed IP for testing
      setUserIP(localIP);
      setIpValid(true);
      toast.info("Using simulated IP for development");
    } catch (error) {
      console.error("Error getting IP:", error);
      toast.error("Unable to verify IP address");
    }
  };

  // Fetch upcoming seminars
  const fetchUpcomingSeminars = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/seminar/upcoming`);

      setUpcomingSeminars(response.data || []);
    } catch (error) {
      console.error("Error fetching seminars:", error);
      toast.error("Failed to load upcoming seminars");
    } finally {
      setLoading(false);
    }
  };

  // Handle seminar registration
  const handleRegister = async (seminarId: string) => {
    if (!ipValid) {
      toast.error("Registration not allowed from your IP address");
      return;
    }

    if (!user) {
      toast.error("Please login to register for seminars");
      return;
    }

    try {
      setRegistering(seminarId);
      const registrationData = {
        username: user.name || registrationForm.username,
        fullName: user.fullName || registrationForm.fullName,
        department: user.department || "Not specified",
      };

      const response = await axios.post(
        `${url}/seminar/register/${seminarId}`,
        registrationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Successfully registered for the seminar!");
        fetchUpcomingSeminars(); // Refresh the list
        setShowRegistrationDialog(false);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to register for seminar";
      toast.error(errorMessage);
    } finally {
      setRegistering(null);
    }
  };

  // Check if user is already registered
  const isUserRegistered = (seminar: Seminar): boolean => {
    if (!user) return false;
    return seminar.attendees.some(
      (attendee) =>
        attendee.username === user.name ||
        attendee.username === registrationForm.username
    );
  };

  // Check if seminar is full
  const isSeminarFull = (seminar: Seminar): boolean => {
    return seminar.attendees.length >= seminar.maxAttendees;
  };

  // Get seminar status badge
  const getStatusBadge = (seminar: Seminar) => {
    const isRegistered = isUserRegistered(seminar);
    const isFull = isSeminarFull(seminar);

    if (isRegistered) {
      return (
        <Badge variant="default" className="bg-green-500">
          Registered
        </Badge>
      );
    }
    if (isFull) {
      return <Badge variant="destructive">Full</Badge>;
    }
    if (seminar.status === "approved") {
      return <Badge variant="default">Open</Badge>;
    }
    return <Badge variant="secondary">{seminar.status}</Badge>;
  };

  useEffect(() => {
    getUserIP();
    fetchUpcomingSeminars();

    if (user) {
      setRegistrationForm({
        username: user.name || "",
        fullName: user.fullName || "",
        seminarTitle: "",
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading seminars...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
            Seminar Registration
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Register for upcoming seminars and expand your knowledge
          </p>
        </div>

        {/* IP Status Alert */}
        <div className="max-w-4xl mx-auto mb-6">
          <Alert
            className={`${
              ipValid
                ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                : "border-red-200 bg-red-50 dark:bg-red-950/20"
            }`}
          >
            {ipValid ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                ipValid
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              {ipValid
                ? `✓ Access granted from IP: ${userIP}`
                : `✗ Access denied from IP: ${userIP}. Only ${allowedIP} is allowed.`}
            </AlertDescription>
          </Alert>
        </div>

        {/* User Info */}
        {user && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Username
                    </Label>
                    <p className="text-lg font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Full Name
                    </Label>
                    <p className="text-lg font-semibold">{user.fullName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Seminars */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Upcoming Seminars
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Available seminars opening 1 hour before start time
            </p>
          </div>

          {upcomingSeminars.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  No Upcoming Seminars
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Check back later for new seminar announcements
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSeminars.map((seminar) => (
                <Card
                  key={seminar._id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {seminar.seminarTitle}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                          by {seminar.fullName}
                        </CardDescription>
                      </div>
                      {getStatusBadge(seminar)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3">
                      {seminar.description}
                    </p>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(seminar.date), "PPP")}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {seminar.fromTime} - {seminar.toTime}
                        </span>
                        {seminar.duration && (
                          <span className="text-xs">({seminar.duration})</span>
                        )}
                      </div>

                      {seminar.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{seminar.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>
                          {seminar.attendees.length} / {seminar.maxAttendees}{" "}
                          attendees
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{seminar.seminarTitle}</DialogTitle>
                            <DialogDescription>
                              Seminar Details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="font-semibold">
                                Description
                              </Label>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {seminar.description}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">
                                  Presenter
                                </Label>
                                <p className="text-sm">{seminar.fullName}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">
                                  Department
                                </Label>
                                <p className="text-sm">{seminar.department}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">
                                  Date & Time
                                </Label>
                                <p className="text-sm">
                                  {format(new Date(seminar.date), "PPP")}
                                </p>
                                <p className="text-sm">
                                  {seminar.fromTime} - {seminar.toTime}
                                </p>
                              </div>
                              <div>
                                <Label className="font-semibold">
                                  Location
                                </Label>
                                <p className="text-sm">
                                  {seminar.location || "TBA"}
                                </p>
                              </div>
                            </div>
                            {seminar.attendees.length > 0 && (
                              <div>
                                <Label className="font-semibold">
                                  Registered Attendees (
                                  {seminar.attendees.length})
                                </Label>
                                <div className="mt-2 max-h-32 overflow-y-auto">
                                  {seminar.attendees.map((attendee, index) => (
                                    <div
                                      key={index}
                                      className="text-sm py-1 border-b border-slate-200 dark:border-slate-700 last:border-0"
                                    >
                                      <span className="font-medium">
                                        {attendee.fullName}
                                      </span>
                                      <span className="text-slate-500 ml-2">
                                        ({attendee.username})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={() => {
                          setSelectedSeminar(seminar);
                          setRegistrationForm((prev) => ({
                            ...prev,
                            seminarTitle: seminar.seminarTitle,
                          }));
                          setShowRegistrationDialog(true);
                        }}
                        disabled={
                          !ipValid ||
                          isUserRegistered(seminar) ||
                          isSeminarFull(seminar) ||
                          seminar.status !== "approved" ||
                          registering === seminar._id
                        }
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {registering === seminar._id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Registering...
                          </div>
                        ) : isUserRegistered(seminar) ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Registered
                          </div>
                        ) : isSeminarFull(seminar) ? (
                          "Full"
                        ) : seminar.status !== "approved" ? (
                          "Not Available"
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Registration Dialog */}
        <Dialog
          open={showRegistrationDialog}
          onOpenChange={setShowRegistrationDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register for Seminar</DialogTitle>
              <DialogDescription>
                {selectedSeminar
                  ? `Register for "${selectedSeminar.seminarTitle}"`
                  : "Complete your registration"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={registrationForm.username}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter your username"
                  disabled={!!user?.name}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={registrationForm.fullName}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  disabled={!!user?.fullName}
                />
              </div>
              <div>
                <Label htmlFor="seminarTitle">Seminar Title</Label>
                <Input
                  id="seminarTitle"
                  value={registrationForm.seminarTitle}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRegistrationDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedSeminar && handleRegister(selectedSeminar._id)
                  }
                  disabled={
                    !registrationForm.username ||
                    !registrationForm.fullName ||
                    !ipValid
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {registering ? "Registering..." : "Confirm Registration"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
