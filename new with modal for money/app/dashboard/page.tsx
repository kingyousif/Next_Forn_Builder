"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RoleBasedLayout } from "./role-based-layout";
import axios from "axios";
import { useAuth } from "@/components/context/page";

// Mock user role - in real app, get from auth context
const mockUser = {
  role: "user" as "super_admin" | "admin" | "user",
  name: "John Doe",
  email: "john@formcraft.com",
};

export default function DashboardPage() {
  const { token } = useAuth();
  axios
    .get(`${process.env.NEXT_PUBLIC_API_URL}dashboard/get`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      
    });
  return (
    <RoleBasedLayout user={mockUser}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-900 dark:to-black">
        {/* Header Section with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 pb-32">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 dark:from-blue-800/80 dark:to-purple-800/80"></div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20 blur-3xl"></div>
          <div className="absolute top-20 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-indigo-300/30 rounded-full blur-xl"></div>

          <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                  Welcome back, {mockUser.name}
                </h1>
                <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl">
                  {mockUser.role === "super_admin" &&
                    "Manage your entire FormCraft ecosystem"}
                  {mockUser.role === "admin" &&
                    "Oversee forms and monitor team performance"}
                  {mockUser.role === "user" &&
                    "Create beautiful forms and track responses"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative -mt-24 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Quick Actions - Elevated Cards */}
            <div className="transform -translate-y-4">
              <QuickActions userRole={mockUser.role} />
            </div>

            {/* Stats Grid */}
            <StatsCards userRole={mockUser.role} />

            {/* Bottom Grid - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentActivity userRole={mockUser.role} />
              </div>
              <div className="space-y-6">
                {/* Performance Insights Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Performance Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Response Rate
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        ↗ 12.5%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Completion Rate
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        ↗ 8.2%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
