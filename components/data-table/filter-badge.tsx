"use client"

import { Badge } from "@/components/ui/badge"

interface FilterBadgeProps {
  count: number
  onClick?: () => void
}

export function FilterBadge({ count, onClick }: FilterBadgeProps) {
  if (count === 0) return null

  return (
    <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground cursor-pointer" onClick={onClick}>
      {count}
    </Badge>
  )
}

