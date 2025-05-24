"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Settings, User, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axios from "axios";
import { AuthContext } from "../context/page";

export function DashboardHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  // const [user, setUser] = useState<{ name: string; email: string } | null>(
  //   null
  // );
  const { user } = useContext(AuthContext);

  const handleLogout = () => {
    // Clear localStorage
    const user = Cookies.remove("user");
    const token = Cookies.remove("token");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message || "Logout successful");
      });

    // Redirect to login page
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center">
          <span className="font-bold text-xl">FormCraft</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/analytics">
                <div className="flex items-center">
                  <Avatar
                    className="h-8 w-8 overflow-hidden rounded-full"
                    // src={user?.name}
                  >
                    <AvatarFallback
                      delayMs={100}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-muted"
                    >
                      <span className="text-xs font-semibold text-accent-foreground">
                        {user?.name?.[0]}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <span className="text-sm font-semibold">{user?.name}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">
                        Submitting Qawsh Forms
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/analytics">
                <div className="flex items-center">
                  <Avatar
                    className="h-8 w-8 overflow-hidden rounded-full"
                    // src={user?.name}
                  >
                    <AvatarFallback
                      delayMs={100}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-muted"
                    >
                      <span className="text-xs font-semibold text-accent-foreground">
                        {user?.name?.[0]}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <span className="text-sm font-semibold">{user?.name}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">
                        Submitting Qawsh Forms
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/analytics">
                <div className="flex items-center">
                  <Avatar
                    className="h-8 w-8 overflow-hidden rounded-full"
                    // src={user?.name}
                  >
                    <AvatarFallback
                      delayMs={100}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-muted"
                    >
                      <span className="text-xs font-semibold text-accent-foreground">
                        {user?.name?.[0]}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <span className="text-sm font-semibold">{user?.name}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">
                        Submitting Qawsh Forms
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user && (
                  <>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.fullName}
                    </p>
                  </>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
