"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "../context/page";

interface User {
  id: string;
  // Add other user properties as needed
}

export function LoginForm() {
  const { globalLoading, checkAuth, login } = useAuth();
  const router = useRouter();

  const checkAuthanticate = async () => {
    // let check = await checkAuth();
    // if (check) {
    //   router.push("/dashboard");
    // }
  };

  checkAuthanticate();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    rememberMe: false,
  });

  const url = process.env.NEXT_PUBLIC_API_URL;

  const [authError, setAuthError] = useState<string | null>(null);
  // useEffect(() => {
  //   // Start with loading true
  //   setGlobalLoading(true);

  //   // Safely parse user from cookie with error handling
  //   let user: User | null = null;
  //   try {
  //     const userCookie = Cookies.get("user");
  //     if (userCookie) {
  //       user = JSON.parse(userCookie);
  //       // Validate that user has expected properties
  //       if (!user || typeof user !== "object" || !user.id) {
  //         console.error("Invalid user data in cookie");
  //         user = null;
  //         Cookies.remove("user"); // Remove invalid cookie
  //         Cookies.remove("token"); // Remove invalid cookie
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Try Your best");
  //     Cookies.remove("user"); // Remove invalid cookie
  //     Cookies.remove("token"); // Remove invalid cookie
  //   }

  //   // Get token from cookie
  //   const token = Cookies.get("token") || null;

  //   // If no user or token, immediately stop global loading
  //   if (!user || !token) {
  //     setGlobalLoading(false);
  //     setAuthError("Missing or invalid authentication data");
  //     return;
  //   }

  //   // Flag to prevent state updates after component unmount
  //   let isMounted = true;

  //   // Perform auth check
  //   const checkAuth = async () => {
  //     try {
  //       const res = await axios.post(
  //         `${url}/api/auth/check-auth`,
  //         {},
  //         {
  //           withCredentials: true,
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //           // Add timeout to prevent hanging requests
  //           timeout: 10000,
  //         }
  //       );

  //       // Only update state if component is still mounted
  //       if (isMounted) {
  //         // Validate response structure
  //         if (!res.data || !res.data.user) {
  //           setAuthError("Invalid response from server");
  //           setGlobalLoading(false);
  //           return;
  //         }

  //         // If authentication is successful and tokens match
  //         if (res.data.user.token === token && res.data.user._id === user.id) {
  //           setGlobalLoading(false);
  //           router.push("/dashboard");
  //         } else {
  //           // If tokens don't match, stop global loading and handle error
  //           setAuthError("Authentication failed: Invalid credentials");
  //           setGlobalLoading(false);

  //           // Clear invalid cookies
  //           Cookies.remove("user");
  //           Cookies.remove("token");
  //         }
  //       }
  //     } catch (err) {
  //       // Only update state if component is still mounted
  //       if (isMounted) {
  //         console.error("Authentication error:", err);

  //         // Check if it's an axios error with response
  //         if (axios.isAxiosError(err)) {
  //           if (err.response) {
  //             // Handle specific status codes
  //             if (err.response.status === 500) {
  //               setAuthError(
  //                 "Server error occurred. This might be due to invalid authentication data."
  //               );
  //             } else if (err.response.status === 401) {
  //               setAuthError("Authentication failed: Unauthorized");
  //             } else {
  //               setAuthError(`Authentication error: ${err.response.status}`);
  //             }
  //           } else if (err.request) {
  //             // Request was made but no response received (timeout, network issue)
  //             setAuthError("Authentication failed: No response from server");
  //           } else {
  //             // Error in setting up the request
  //             setAuthError("Authentication failed: Request setup error");
  //           }
  //         } else {
  //           // Generic error handling
  //           setAuthError(
  //             `Authentication failed: ${
  //               (err as Error).message || "Unknown error"
  //             }`
  //           );
  //         }

  //         // Stop global loading on error
  //         setGlobalLoading(false);

  //         // Clear invalid cookies on auth error
  //         Cookies.remove("user");
  //         Cookies.remove("token");
  //       }
  //     }
  //   };

  //   checkAuth();

  //   // Cleanup function to prevent state updates after unmount
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [router, url, setGlobalLoading]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.password) {
        toast.error("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      // Option 1: Use the login function from AuthContext
      const success = await login({
        name: formData.name,
        password: formData.password,
      });

      if (success) {
        toast.success("Login successful");
        router.push("/dashboard");
      }
      if (!success) {
        toast.error("Login failed");
      }

      /* 
      // Option 2: If you prefer to keep using your direct API call:
      const res = await axios.post(`${url}/api/auth/login`, {
        name: formData.name,
        password: formData.password,
      });

      toast.success(res?.data?.message || "Login successful");
      
      const user = {
        id: res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
      };
      
      const token = res.data.user.token;
      
      // Use the setUser function from AuthContext instead of directly setting cookies
      setUser(user);
      
      // Set cookies with expiration based on rememberMe
      const expirationDays = formData.rememberMe ? 7 : 1;
      
      Cookies.set("user", JSON.stringify(user), {
        expires: expirationDays,
      });
      
      Cookies.set("token", token, {
        expires: expirationDays,
      });
      
      router.push("/dashboard");
      */
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {globalLoading ? (
        <div className="flex  w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  tabIndex={1}
                  id="name"
                  name="name"
                  placeholder="name@example.com"
                  type="name"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/reset-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  tabIndex={2}
                  id="password"
                  name="password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
              <Button
                disabled={isLoading}
                type="submit"
                className="w-full"
                tabIndex={3}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" type="button" disabled={isLoading}>
              Google
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              GitHub
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              Twitter
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
