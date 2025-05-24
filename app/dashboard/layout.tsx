"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import Cookies from "js-cookie";
import axios from "axios";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const url = process.env.NEXT_PUBLIC_API_URL;

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const token = Cookies.get("token") || null;
  useEffect(() => {
    setIsLoading(true);
    if (!user || !token) {
      router.push("/login");
      return;
    }
    axios
      .post(
        `${url}api/auth/check-auth`,
        {}, // No need to send the token in the body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in the header
          },
        }
      )
      .then((res) => {
        if (res.data.user.token !== token || res.data.user._id !== user.id) {
          router.push("/login");
        }
      })
      .catch((err) => {
        router.push("/login");
      });

    setIsLoading(false);
  }, [router, user, token]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
