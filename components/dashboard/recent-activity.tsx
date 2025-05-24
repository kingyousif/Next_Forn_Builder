"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  id: string
  type: "form_created" | "form_submitted" | "form_viewed" | "form_edited"
  formName: string
  timestamp: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For demo purposes, we'll use mock data
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "form_submitted",
        formName: "Customer Feedback",
        timestamp: "2023-04-01T10:30:00Z",
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
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
        user: {
          name: "Jane Smith",
          email: "jane@example.com",
        },
      },
      {
        id: "4",
        type: "form_edited",
        formName: "Product Survey",
        timestamp: "2023-03-27T16:45:00Z",
      },
      {
        id: "5",
        type: "form_submitted",
        formName: "Contact Form",
        timestamp: "2023-03-26T11:10:00Z",
        user: {
          name: "Mike Johnson",
          email: "mike@example.com",
        },
      },
    ]

    setActivities(mockActivities)
  }, [])

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "form_created":
        return `Form "${activity.formName}" was created`
      case "form_submitted":
        return `${activity.user?.name || "Someone"} submitted "${activity.formName}"`
      case "form_viewed":
        return `${activity.user?.name || "Someone"} viewed "${activity.formName}"`
      case "form_edited":
        return `Form "${activity.formName}" was edited`
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your form activity over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              {activity.user ? (
                <Avatar>
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>FC</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{getActivityText(activity)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

