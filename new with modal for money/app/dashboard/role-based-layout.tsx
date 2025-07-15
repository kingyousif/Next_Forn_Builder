"use client";

import { ReactNode } from "react";

interface User {
  role: "super_admin" | "admin" | "user";
  name: string;
  email: string;
}

interface RoleBasedLayoutProps {
  user: User;
  children: ReactNode;
}

export function RoleBasedLayout({ user, children }: RoleBasedLayoutProps) {
  return <div className="min-h-screen">{children}</div>;
}
