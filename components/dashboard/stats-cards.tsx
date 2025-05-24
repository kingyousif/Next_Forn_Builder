"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, FileText, Users, ArrowUp, ArrowDown } from "lucide-react"

export function StatsCards() {
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    totalViews: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For demo purposes, we'll use mock data
    const mockStats = {
      totalForms: 12,
      totalSubmissions: 248,
      totalViews: 1024,
      conversionRate: 24.2,
    }

    setStats(mockStats)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalForms}</div>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUp className="mr-1 h-3 w-3" />
            <span>+12.5%</span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Form Views</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalViews}</div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUp className="mr-1 h-3 w-3" />
            <span>+19.2%</span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          <div className="flex items-center text-xs text-red-500">
            <ArrowDown className="mr-1 h-3 w-3" />
            <span>-2.5%</span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

