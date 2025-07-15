"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  FileText,
  Users,
  ArrowUp,
  ArrowDown,
  Building,
  Shield,
  Database,
  Globe,
  TrendingUp,
  Activity,
} from "lucide-react";

interface StatsCardsProps {
  userRole: "super_admin" | "admin" | "user";
}

export function StatsCards({ userRole }: StatsCardsProps) {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Mock data based on role
    const getStatsForRole = () => {
      switch (userRole) {
        case "super_admin":
          return {
            totalOrganizations: 156,
            totalUsers: 12847,
            totalForms: 45623,
            systemUptime: 99.9,
            totalRevenue: 284750,
            activeSubscriptions: 1247,
          };
        case "admin":
          return {
            teamMembers: 24,
            totalForms: 89,
            totalSubmissions: 1247,
            teamActivity: 87.5,
            monthlyForms: 12,
            teamEfficiency: 94.2,
          };
        case "user":
          return {
            totalForms: 12,
            totalSubmissions: 248,
            totalViews: 1024,
            conversionRate: 24.2,
            averageCompletion: 78.5,
            responsesThisWeek: 45,
          };
        default:
          return {};
      }
    };

    setStats(getStatsForRole());
  }, [userRole]);

  const renderSuperAdminStats = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Organizations"
        value={stats.totalOrganizations}
        change="+8.2%"
        trend="up"
        icon={Building}
        gradient="from-blue-500 to-blue-600"
      />
      <StatCard
        title="Platform Users"
        value={stats.totalUsers?.toLocaleString()}
        change="+12.5%"
        trend="up"
        icon={Users}
        gradient="from-green-500 to-green-600"
      />
      <StatCard
        title="Total Forms"
        value={stats.totalForms?.toLocaleString()}
        change="+19.2%"
        trend="up"
        icon={FileText}
        gradient="from-purple-500 to-purple-600"
      />
      <StatCard
        title="System Uptime"
        value={`${stats.systemUptime}%`}
        change="99.9%"
        trend="up"
        icon={Shield}
        gradient="from-emerald-500 to-emerald-600"
      />
      <StatCard
        title="Monthly Revenue"
        value={`$${stats.totalRevenue?.toLocaleString()}`}
        change="+23.1%"
        trend="up"
        icon={TrendingUp}
        gradient="from-orange-500 to-orange-600"
      />
      <StatCard
        title="Active Subscriptions"
        value={stats.activeSubscriptions}
        change="+5.4%"
        trend="up"
        icon={Database}
        gradient="from-teal-500 to-teal-600"
      />
    </div>
  );

  const renderAdminStats = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Team Members"
        value={stats.teamMembers}
        change="+2 this month"
        trend="up"
        icon={Users}
        gradient="from-blue-500 to-blue-600"
      />
      <StatCard
        title="Team Forms"
        value={stats.totalForms}
        change="+12 this month"
        trend="up"
        icon={FileText}
        gradient="from-green-500 to-green-600"
      />
      <StatCard
        title="Total Submissions"
        value={stats.totalSubmissions}
        change="+18.5%"
        trend="up"
        icon={BarChart}
        gradient="from-purple-500 to-purple-600"
      />
      <StatCard
        title="Team Activity"
        value={`${stats.teamActivity}%`}
        change="+5.2%"
        trend="up"
        icon={Activity}
        gradient="from-orange-500 to-orange-600"
      />
      <StatCard
        title="Monthly Forms"
        value={stats.monthlyForms}
        change="+3 from last month"
        trend="up"
        icon={TrendingUp}
        gradient="from-teal-500 to-teal-600"
      />
      <StatCard
        title="Team Efficiency"
        value={`${stats.teamEfficiency}%`}
        change="+2.1%"
        trend="up"
        icon={Shield}
        gradient="from-pink-500 to-pink-600"
      />
    </div>
  );

  const renderUserStats = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Your Forms"
        value={stats.totalForms}
        change="+2 this month"
        trend="up"
        icon={FileText}
        gradient="from-blue-500 to-blue-600"
      />
      <StatCard
        title="Total Submissions"
        value={stats.totalSubmissions}
        change="+12.5%"
        trend="up"
        icon={Users}
        gradient="from-green-500 to-green-600"
      />
      <StatCard
        title="Form Views"
        value={stats.totalViews}
        change="+19.2%"
        trend="up"
        icon={BarChart}
        gradient="from-purple-500 to-purple-600"
      />
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        change="-2.5%"
        trend="down"
        icon={TrendingUp}
        gradient="from-orange-500 to-orange-600"
      />
      <StatCard
        title="Avg. Completion"
        value={`${stats.averageCompletion}%`}
        change="+4.1%"
        trend="up"
        icon={Activity}
        gradient="from-teal-500 to-teal-600"
      />
      <StatCard
        title="This Week"
        value={`${stats.responsesThisWeek} responses`}
        change="+8 from last week"
        trend="up"
        icon={Globe}
        gradient="from-pink-500 to-pink-600"
      />
    </div>
  );

  const renderStatsForRole = () => {
    switch (userRole) {
      case "super_admin":
        return renderSuperAdminStats();
      case "admin":
        return renderAdminStats();
      case "user":
        return renderUserStats();
      default:
        return renderUserStats();
    }
  };

  return renderStatsForRole();
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: any;
  gradient: string;
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <div
              className={`flex items-center mt-2 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-500"
              }`}
            >
              {trend === "up" ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          </div>
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
