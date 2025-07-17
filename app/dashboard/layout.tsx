"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import Cookies from "js-cookie";
import axios from "axios";
import {
  FileText,
  Activity,
  Stethoscope,
  ClipboardCheck,
  Heart,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const url = process.env.NEXT_PUBLIC_API_URL;

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const token = Cookies.get("token") || null;
  useEffect(() => {
    setIsLoading(true);

    if (!user || !token) {
      router.push("/login");
      return;
    }
    axios
      .post(
        `${url}api/auth/check-auth`,
        {}, // No need to send the token in the body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in the header
          },
        }
      )
      .then((res) => {
        if (res.data.user.token !== token || res.data.user._id !== user.id) {
          router.push("/login");
        }
      })
      .catch((err) => {
        router.push("/login");
      });

    setIsLoading(false);
  }, [router]);

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      icon: FileText,
      text: "Initializing form structure",
      color: "text-blue-500",
    },
    {
      icon: Stethoscope,
      text: "Loading medical components",
      color: "text-green-500",
    },
    {
      icon: Activity,
      text: "Validating health protocols",
      color: "text-red-500",
    },
    {
      icon: ClipboardCheck,
      text: "Preparing form fields",
      color: "text-purple-500",
    },
    { icon: Heart, text: "Finalizing medical form", color: "text-pink-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1600);

    return () => clearInterval(stepInterval);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 max-w-md w-full">
          {/* Main Loading Circle */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-200">
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-green-500 animate-spin"
                style={{ animationDuration: "2s" }}
              />
            </div>

            {/* Progress ring */}
            <svg className="absolute inset-2 w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="rgb(226, 232, 240)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="url(#gradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`${steps[currentStep].color} transform transition-all duration-500 hover:scale-110`}
              >
                <CurrentIcon size={32} className="animate-pulse" />
              </div>
            </div>

            {/* Floating medical symbols */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Progress percentage */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {Math.round(progress)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current step text */}
          <div className="text-center">
            <p className="text-gray-600 font-medium mb-2 transition-all duration-500">
              {steps[currentStep].text}
            </p>

            {/* Step indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "bg-blue-500 scale-125"
                      : index < currentStep
                      ? "bg-green-400"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Subtle animation elements */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse" />
          <div
            className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
