"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type:
    | "form_created"
    | "form_submitted"
    | "form_viewed"
    | "form_edited"
    | "user_invited"
    | "system_update"
    | "team_joined";
  formName?: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  metadata?: any;
}

interface RecentActivityProps {
  userRole: "super_admin" | "admin" | "user";
}

export function RecentActivity({ userRole }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const getActivitiesForRole = () => {
      switch (userRole) {
        case "super_admin":
          return [
            {
              id: "1",
              type: "system_update",
              timestamp: "2023-04-01T10:30:00Z",
              metadata: { version: "2.1.0" },
            },
            {
              id: "2",
              type: "user_invited",
              timestamp: "2023-03-29T14:20:00Z",
              user: { name: "Organization Admin", email: "admin@company.com" },
              metadata: { organization: "TechCorp Inc." },
            },
            {
              id: "3",
              type: "form_created",
              formName: "Enterprise Survey",
              timestamp: "2023-03-28T09:15:00Z",
              user: { name: "Sarah Wilson", email: "sarah@techcorp.com" },
            },
          ];
        case "admin":
          return [
            {
              id: "1",
              type: "team_joined",
              timestamp: "2023-04-01T10:30:00Z",
              user: { name: "Alex Chen", email: "alex@company.com" },
            },
            {
              id: "2",
              type: "form_submitted",
              formName: "Team Feedback",
              timestamp: "2023-03-29T14:20:00Z",
              user: { name: "Maria Garcia", email: "maria@company.com" },
            },
            {
              id: "3",
              type: "form_created",
              formName: "Project Requirements",
              timestamp: "2023-03-28T09:15:00Z",
              user: { name: "David Kim", email: "david@company.com" },
            },
          ];
        case "user":
          return [
            {
              id: "1",
              type: "form_submitted",
              formName: "Customer Feedback",
              timestamp: "2023-04-01T10:30:00Z",
              user: { name: "John Doe", email: "john@example.com" },
            },
            {
              id: "2",
              type: "form_created",
              formName: "Event Registration",
              timestamp: "2023-03-29T14:20:00Z",
            },
            {
              id: "3",
              type: "form_viewed",
              formName: "Job Application",
              timestamp: "2023-03-28T09:15:00Z",
              user: { name: "Jane Smith", email: "jane@example.com" },
            },
          ];
        default:
          return [];
      }
    };

    setActivities(getActivitiesForRole());
  }, [userRole]);

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "form_created":
        return `${activity.user?.name || "Someone"} created form "${
          activity.formName
        }"`;
      case "form_submitted":
        return `${activity.user?.name || "Someone"} submitted "${
          activity.formName
        }"`;
      case "form_viewed":
        return `${activity.user?.name || "Someone"} viewed "${
          activity.formName
        }"`;
      case "form_edited":
        return `Form "${activity.formName}" was edited`;
      case "user_invited":
        return `${activity.user?.name} was invited to ${
          activity.metadata?.organization || "the platform"
        }`;
      case "system_update":
        return `System updated to version ${activity.metadata?.version}`;
      case "team_joined":
        return `${activity.user?.name} joined the team`;
      default:
        return "";
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      form_created: { color: "bg-green-100 text-green-800", text: "Created" },
      form_submitted: { color: "bg-blue-100 text-blue-800", text: "Submitted" },
      form_viewed: { color: "bg-gray-100 text-gray-800", text: "Viewed" },
      form_edited: { color: "bg-yellow-100 text-yellow-800", text: "Edited" },
      user_invited: { color: "bg-purple-100 text-purple-800", text: "Invited" },
      system_update: { color: "bg-orange-100 text-orange-800", text: "System" },
      team_joined: { color: "bg-emerald-100 text-emerald-800", text: "Joined" },
    };
    return badges[type as keyof typeof badges] || badges.form_viewed;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Recent Activity
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {userRole === "super_admin" && "Platform-wide activity overview"}
          {userRole === "admin" && "Your team's recent activity"}
          {userRole === "user" && "Your form activity over the last 7 days"}
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {activities.map((activity) => {
            const badge = getActivityBadge(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-4 group">
                {activity.user ? (
                  <Avatar className="ring-2 ring-white dark:ring-gray-700 shadow-md">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {activity.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="ring-2 ring-white dark:ring-gray-700 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                      FC
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      {getActivityText(activity)}
                    </p>
                    <Badge className={`text-xs ${badge.color} border-0`}>
                      {badge.text}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
