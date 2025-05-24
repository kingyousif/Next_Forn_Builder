"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function ResetPasswordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!email) {
        throw new Error("Please enter your email address")
      }

      // Simulate password reset email
      // In a real app, you would call an API here
      setTimeout(() => {
        toast({
          title: "Reset email sent",
          description: "Check your email for a link to reset your password",
        })

        // Redirect to login page
        router.push("/login")
      }, 1000)
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button disabled={isLoading} type="submit" className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            <span className="ml-2">Sending reset link...</span>
          </div>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  )
}

