import type { Task } from "./schema"

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: 1234,
    title: "Fix login button on mobile",
    status: "open",
    priority: "high",
    type: "bug",
    createdAt: "2023-09-15T10:30:00Z",
    assignee: "John Doe",
  },
  {
    id: 2345,
    title: "Add dark mode support",
    status: "in-progress",
    priority: "medium",
    type: "feature",
    createdAt: "2023-10-05T14:20:00Z",
    assignee: "Jane Smith",
  },
  {
    id: 3456,
    title: "Improve loading performance",
    status: "closed",
    priority: "high",
    type: "enhancement",
    createdAt: "2023-08-22T09:15:00Z",
    assignee: "Mike Johnson",
  },
  {
    id: 4567,
    title: "Update documentation",
    status: "open",
    priority: "low",
    type: "enhancement",
    createdAt: "2023-11-01T11:45:00Z",
    assignee: "Sarah Williams",
  },
  {
    id: 5678,
    title: "Fix broken links in footer",
    status: "closed",
    priority: "medium",
    type: "bug",
    createdAt: "2023-09-28T16:10:00Z",
    assignee: "David Brown",
  },
  {
    id: 6789,
    title: "Implement user profile page",
    status: "in-progress",
    priority: "high",
    type: "feature",
    createdAt: "2023-10-15T13:25:00Z",
    assignee: "Emily Davis",
  },
  {
    id: 7890,
    title: "Fix responsive layout issues",
    status: "open",
    priority: "medium",
    type: "bug",
    createdAt: "2023-11-10T10:00:00Z",
    assignee: "Alex Wilson",
  },
  {
    id: 8901,
    title: "Add export to CSV feature",
    status: "in-progress",
    priority: "low",
    type: "feature",
    createdAt: "2023-10-20T15:30:00Z",
    assignee: "Chris Martin",
  },
  {
    id: 9012,
    title: "Optimize database queries",
    status: "closed",
    priority: "high",
    type: "enhancement",
    createdAt: "2023-09-05T08:45:00Z",
    assignee: "Lisa Anderson",
  },
  {
    id: 1235,
    title: "Add multi-language support",
    status: "open",
    priority: "medium",
    type: "feature",
    createdAt: "2023-11-15T09:20:00Z",
    assignee: "Tom Jackson",
  },
  {
    id: 2346,
    title: "Fix security vulnerability",
    status: "in-progress",
    priority: "high",
    type: "bug",
    createdAt: "2023-11-05T14:10:00Z",
    assignee: "Rachel Green",
  },
  {
    id: 3457,
    title: "Improve accessibility",
    status: "open",
    priority: "medium",
    type: "enhancement",
    createdAt: "2023-10-25T11:30:00Z",
    assignee: "Daniel White",
  },
  {
    id: 4568,
    title: "Update dependencies",
    status: "closed",
    priority: "low",
    type: "enhancement",
    createdAt: "2023-09-10T10:15:00Z",
    assignee: "Olivia Taylor",
  },
  {
    id: 5679,
    title: "Add unit tests for auth module",
    status: "in-progress",
    priority: "medium",
    type: "enhancement",
    createdAt: "2023-10-30T13:45:00Z",
    assignee: "James Wilson",
  },
  {
    id: 6780,
    title: "Implement password reset feature",
    status: "open",
    priority: "high",
    type: "feature",
    createdAt: "2023-11-20T09:30:00Z",
    assignee: "Sophia Miller",
  },
  {
    id: 7891,
    title: "Fix image upload on Safari",
    status: "closed",
    priority: "medium",
    type: "bug",
    createdAt: "2023-09-20T15:20:00Z",
    assignee: "Ethan Clark",
  },
  {
    id: 8902,
    title: "Add pagination to search results",
    status: "in-progress",
    priority: "low",
    type: "enhancement",
    createdAt: "2023-10-10T11:00:00Z",
    assignee: "Ava Martinez",
  },
  {
    id: 9013,
    title: "Implement real-time notifications",
    status: "open",
    priority: "high",
    type: "feature",
    createdAt: "2023-11-25T14:15:00Z",
    assignee: "Noah Thompson",
  },
  {
    id: 1236,
    title: "Fix broken API endpoint",
    status: "closed",
    priority: "high",
    type: "bug",
    createdAt: "2023-09-25T08:30:00Z",
    assignee: "Emma Wilson",
  },
  {
    id: 2347,
    title: "Improve error handling",
    status: "in-progress",
    priority: "medium",
    type: "enhancement",
    createdAt: "2023-10-18T10:45:00Z",
    assignee: "Liam Johnson",
  },
]

// Simulate API call with delay
export async function getTasks(): Promise<Task[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if we have tasks in localStorage
  const storedTasks = localStorage.getItem("tasks")
  if (storedTasks) {
    return JSON.parse(storedTasks)
  }

  // If not, use mock data and store it
  localStorage.setItem("tasks", JSON.stringify(mockTasks))
  return mockTasks
}

// Create a new task
export async function createTask(task: Omit<Task, "id">): Promise<Task> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get existing tasks
  const storedTasks = localStorage.getItem("tasks")
  const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : mockTasks

  // Generate a new ID (simple implementation)
  const newId = Math.max(...tasks.map((t) => t.id)) + 1

  // Create the new task
  const newTask: Task = {
    id: newId,
    ...task,
  }

  // Add to tasks and save
  tasks.push(newTask)
  localStorage.setItem("tasks", JSON.stringify(tasks))

  return newTask
}

// Update an existing task
export async function updateTask(updatedTask: Task): Promise<Task> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get existing tasks
  const storedTasks = localStorage.getItem("tasks")
  const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : mockTasks

  // Find and update the task
  const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))

  // Save updated tasks
  localStorage.setItem("tasks", JSON.stringify(updatedTasks))

  return updatedTask
}

// Delete a task
export async function deleteTask(id: number): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get existing tasks
  const storedTasks = localStorage.getItem("tasks")
  const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : mockTasks

  // Filter out the deleted task
  const updatedTasks = tasks.filter((task) => task.id !== id)

  // Save updated tasks
  localStorage.setItem("tasks", JSON.stringify(updatedTasks))
}

