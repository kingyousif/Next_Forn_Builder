"use client";

import { useContext, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Pencil, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { userContext } from "@/components/context/page";

const ProfilePage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, setUser } = useContext(userContext);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Add password change logic here
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Add profile update logic here
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = () => {
    localStorage.setItem("user", JSON.stringify({ ...user, name: user?.name }));
    toast.success("Username updated successfully", {});
  };
  const handleEmailChange = () => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (user?.email && emailRegex.test(user.email)) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, email: user?.email })
      );
      toast.success("Email updated successfully", {});
    } else {
      toast.error("Invalid email format", {});
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Profile Picture and Basic Info */}
        <div className="w-full md:w-3/3 space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileImage || "/default-profile.jpg"} />
                <AvatarFallback>JDS</AvatarFallback>
              </Avatar>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Change Photo
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="profileImageInput"
                      ref={fileInputRef}
                    />

                    {profileImage && (
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src={profileImage}
                          alt="Preview"
                          className="rounded-full w-48 h-48 object-cover"
                        />
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setProfileImage(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="w-full"
                            onClick={() =>
                              document
                                .getElementById("profileImageInput")
                                ?.click()
                            }
                          >
                            Choose Different
                          </Button>
                        </div>
                      </div>
                    )}

                    {!profileImage && (
                      <label
                        htmlFor="profileImageInput"
                        className="w-full py-8 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                      >
                        <span className="text-muted-foreground">
                          Click to select an image
                        </span>
                      </label>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Profile Information */}
      <div className="w-full md:w-3/3 space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={user.name}
                    onChange={(e) =>
                      setUser((prevUser: any) => ({
                        ...prevUser,
                        name: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-2"
                    onClick={handleNameChange}
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => {
                      setUser((prevUser: any) => ({
                        ...prevUser,
                        email: e.target.value,
                      }));
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-2"
                    onClick={handleEmailChange}
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Modal */}
        <Dialog>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Security
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
              </CardTitle>
            </CardHeader>
          </Card>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Change Password
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Additional Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections You Might Want to Add Later */}
      {/* 
      - Connected social accounts
      - Privacy settings
      - Notification preferences
      - Billing information
      - Session management
      - Delete account option
      */}
    </div>
  );
};

export default ProfilePage;
