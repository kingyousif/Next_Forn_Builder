import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BarChart, Download, Share2 } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you can perform right away</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href="/dashboard/form-builder/new">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span>Create Form</span>
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <BarChart className="h-5 w-5" />
              <span>View Analytics</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </Button>
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
            <Share2 className="h-5 w-5" />
            <span>Share Form</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

