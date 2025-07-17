"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "../context/page";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface User {
  id: string;
  // Add other user properties as needed
}

export function LoginForm() {
  const { globalLoading, checkAuth, login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
        name: formData.name.toLowerCase(),
        password: formData.password,
      });

      if (success) {
        toast.success("Login successful");
        router.push("/dashboard");
      }
      if (!success) {
        toast.error("Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <>
      {globalLoading ? (
        <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex w-full items-center justify-center p-8"
        >
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="absolute inset-2 h-12 w-12 animate-pulse rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20"></div>
          </div>
        </div>
      ) : (
        <div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto"
        >
          <div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-700/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl"
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>

            <div className="relative p-8 space-y-6">
              <div variants={itemVariants} className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sign in to your account to continue
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                variants={itemVariants}
                className="space-y-5"
              >
                <div variants={itemVariants} className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <div className="relative group">
                    <Input
                      tabIndex={1}
                      id="name"
                      name="name"
                      placeholder="Enter your username"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="username"
                      autoCorrect="off"
                      disabled={isLoading}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12 pl-4 pr-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 group-hover:border-slate-300 dark:group-hover:border-slate-600"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Link
                      href="/reset-password"
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Input
                      tabIndex={2}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="current-password"
                      disabled={isLoading}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 pl-4 pr-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 group-hover:border-slate-300 dark:group-hover:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div variants={itemVariants}>
                  <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 dark:from-blue-500 dark:via-purple-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:via-purple-600 dark:hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    tabIndex={3}
                  >
                    {isLoading ? (
                      <div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2"
                      >
                        Sign In
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
