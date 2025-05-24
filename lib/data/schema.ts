export interface Task {
  id: number
  title: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  type: "bug" | "feature" | "enhancement"
  createdAt: string
  assignee?: string
}

