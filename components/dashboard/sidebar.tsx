"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  SeparatorVerticalIcon,
  User,
  Timer,
  TrainTrackIcon,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Forms",
    href: "/dashboard/form-builder",
    icon: FileText,
    submenu: [
      {
        title: "All Forms",
        href: "/dashboard/form-builder",
        icon: FileText,
      },
      {
        title: "Create New",
        href: "/dashboard/form-builder/new",
        icon: FileText,
      },
    ],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Department Analytics",
    href: "/dashboard/department-analytics",
    icon: BarChart2,
  },
  {
    title: "Departments",
    href: "/dashboard/department",
    icon: SeparatorVerticalIcon,
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    title: "Time-management",
    href: "/dashboard/time-management",
    icon: Timer,
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: User,
  },
  {
    title: "Attendance Tracking",
    href: "/dashboard/attendance-tracking",
    icon: TrainTrackIcon,
  },
  {
    title: "Attendance Stastistics",
    href: "/dashboard/attendance-statistics",
    icon: TrainTrackIcon,
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[6] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <nav
            className={`flex-1 space-y-1 px-3 ${isMobile ? "py-20" : "py-4"}`}
          >
            {navItems.map((item) => (
              <div key={item.title} className="mb-1">
                {item.submenu ? (
                  <Collapsible
                    open={openSubmenu === item.title}
                    onOpenChange={() => toggleSubmenu(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between",
                          pathname.startsWith(item.href) && "bg-muted"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openSubmenu === item.title && "rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-1 ">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.title}
                            href={subitem.href}
                            className={cn(
                              "flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted",
                              pathname === subitem.href &&
                                "bg-muted font-medium"
                            )}
                          >
                            <subitem.icon className="mr-2 h-4 w-4" />
                            {subitem.title}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href && "bg-muted"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-[4] bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
