"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Building2,
  Clock,
  UserCheck,
  GraduationCap,
  Calendar,
  Settings,
  ChevronDown,
  User,
  Timer,
  BarChart2,
  FileArchive,
  Logs,
  ViewIcon,
  Menu,
  X,
  Sparkles,
  UserCog,
  ClipboardList,
  FileUser,
  Printer,
  CalendarDays,
  Award,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/page";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: NavItem[];
  roles?: string[];
  badge?: string;
  isNew?: boolean;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { role } = useAuth();

  // Main navigation structure with grouped items
  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["user", "admin", "super admin"],
    },
    {
      title: "Analytics & Reports",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["user", "admin", "super admin"],
      submenu: [
        {
          title: "General Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          roles: ["user", "admin", "super admin"],
        },
        {
          title: "Department Analytics",
          href: "/dashboard/department-analytics",
          icon: BarChart2,
          roles: ["super admin"],
          badge: "Pro",
        },
        {
          title: "Attendance Statistics",
          href: "/dashboard/attendance-statistics",
          icon: UserCheck,
          roles: ["super admin"],
        },
      ],
    },
    {
      title: "Worker Management",
      href: "/dashboard/workers",
      icon: Users,
      roles: ["user", "admin", "super admin"],
      submenu: [
        {
          title: "Swaping Workers",
          href: "/dashboard/swaping-workers",
          icon: UserCog,
          roles: ["user", "super admin"],
        },
        {
          title: "Selling Workers",
          href: "/dashboard/selling-workers",
          icon: ClipboardList,
          roles: ["user", "super admin"],
        },
        {
          title: "Manage Swaping",
          href: "/dashboard/swaping-workers/manage",
          icon: Settings,
          roles: ["admin", "super admin"],
        },
        {
          title: "Manage Selling",
          href: "/dashboard/selling-workers/manage",
          icon: Settings,
          roles: ["admin", "super admin"],
        },
      ],
    },
    {
      title: "Employee Management",
      href: "/dashboard/employees",
      icon: User,
      roles: ["admin", "super admin"],
      submenu: [
        {
          title: "Employee Profile",
          href: "/dashboard/employee-profile",
          icon: FileUser,
          roles: ["admin", "super admin"],
        },
        {
          title: "Employee Schedule",
          href: "/dashboard/employee-schedule",
          icon: CalendarDays,
          roles: ["admin", "super admin"],
        },
        {
          title: "Employee Management",
          href: "/dashboard/employee-management",
          icon: Users,
          roles: ["super admin"],
        },
        {
          title: "Manage Employee",
          href: "/dashboard/manage-employee",
          icon: UserCog,
          roles: ["super admin"],
        },
      ],
    },
    {
      title: "Attendance & Time",
      href: "/dashboard/attendance",
      icon: Clock,
      roles: ["user", "admin", "super admin"],
      submenu: [
        {
          title: "Attendance Tracking",
          href: "/dashboard/attendance-tracking",
          icon: UserCheck,
          roles: ["user", "admin", "super admin"],
        },
        {
          title: "Attendance Records",
          href: "/dashboard/attendance",
          icon: ClipboardList,
          roles: ["super admin"],
        },
        {
          title: "Time Management",
          href: "/dashboard/time-management",
          icon: Timer,
          roles: ["super admin"],
        },
      ],
    },
    {
      title: "Forms & Documents",
      href: "/dashboard/forms",
      icon: FileText,
      roles: ["admin", "super admin"],
      badge: "New",
      isNew: true,
      submenu: [
        {
          title: "Form Builder",
          href: "/dashboard/form-builder",
          icon: FileText,
          roles: ["admin", "super admin"],
        },
        {
          title: "Create New Form",
          href: "/dashboard/form-builder/new",
          icon: FileArchive,
          roles: ["admin", "super admin"],
          isNew: true,
        },
        {
          title: "Preview Forms",
          href: "/preview",
          icon: ViewIcon,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Learning & Development",
      href: "/dashboard/learning",
      icon: GraduationCap,
      roles: ["super admin"],
      submenu: [
        {
          title: "My Certification",
          href: "/dashboard/my-certification",
          icon: Award,
          roles: ["super admin"],
        },
        {
          title: "Manage Certification",
          href: "/dashboard/manage-certification",
          icon: Settings,
          roles: ["super admin"],
        },
        {
          title: "My Seminar",
          href: "/dashboard/my-seminar",
          icon: BookOpen,
          roles: ["super admin"],
        },
        {
          title: "Manage Seminar",
          href: "/dashboard/manage-seminar",
          icon: Settings,
          roles: ["super admin"],
        },
        {
          title: "Seminar Register",
          href: "/dashboard/seminar-register",
          icon: Calendar,
          roles: ["super admin"],
        },
      ],
    },
    {
      title: "Organization",
      href: "/dashboard/organization",
      icon: Building2,
      roles: ["super admin"],
      submenu: [
        {
          title: "Departments",
          href: "/dashboard/department",
          icon: Building2,
          roles: ["super admin"],
        },
        {
          title: "System Logs",
          href: "/dashboard/logs",
          icon: Logs,
          roles: ["super admin"],
          badge: "Admin",
        },
      ],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) => {
    const userRole = role || "user";
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(userRole);
  });

  // Filter submenu items as well
  const filteredNavItemsWithSubmenus = filteredNavItems.map((item) => {
    if (item.submenu) {
      const filteredSubmenu = item.submenu.filter((subitem) => {
        const userRole = role || "user";
        if (!subitem.roles || subitem.roles.length === 0) return true;
        return subitem.roles.includes(userRole);
      });
      return { ...item, submenu: filteredSubmenu };
    }
    return item;
  });

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
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white shadow-2xl hover:shadow-blue-500/25 hover:scale-110 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </div>
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border/50 backdrop-blur-xl transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          "bg-gradient-to-b from-background/95 via-background/90 to-background/95",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-blue-500/5 before:via-transparent before:to-purple-500/5 before:pointer-events-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="relative p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h2>
              <p className="text-xs text-muted-foreground capitalize">
                {role || "User"} Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex h-full flex-col overflow-hidden">
          <nav
            className={`flex-1 overflow-y-auto px-4 ${
              isMobile ? "py-6" : "py-6"
            } space-y-2`}
          >
            {filteredNavItemsWithSubmenus.map((item, index) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.title)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.submenu && item.submenu.length > 0 ? (
                  <Collapsible
                    open={openSubmenu === item.title}
                    onOpenChange={() => toggleSubmenu(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between h-12 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          pathname.startsWith(item.href)
                            ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/20 shadow-lg shadow-blue-500/10"
                            : "hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:border-blue-200/10 border border-transparent",
                          hoveredItem === item.title && "scale-[1.02] shadow-lg"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-all duration-300",
                              pathname.startsWith(item.href)
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                : "bg-muted/50 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge
                              variant={item.isNew ? "default" : "secondary"}
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                item.isNew
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-300",
                              openSubmenu === item.title && "rotate-180"
                            )}
                          />
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-2 space-y-1 border-l-2 border-blue-100 dark:border-blue-900/30 pl-4">
                        {item.submenu.map((subitem, subIndex) => (
                          <div key={subitem.title}>
                            <Link
                              href={subitem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300 group relative overflow-hidden",
                                pathname === subitem.href
                                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 font-medium shadow-md"
                                  : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-1.5 rounded-md transition-all duration-300",
                                  pathname === subitem.href
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                    : "bg-muted/30 group-hover:bg-blue-500/10"
                                )}
                              >
                                <subitem.icon className="h-3.5 w-3.5" />
                              </div>
                              <span>{subitem.title}</span>
                              {subitem.isNew && (
                                <Badge className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                  New
                                </Badge>
                              )}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-12 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        pathname === item.href
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/20 shadow-lg shadow-blue-500/10"
                          : "hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:border-blue-200/10 border border-transparent",
                        hoveredItem === item.title && "scale-[1.02] shadow-lg"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-all duration-300",
                            pathname === item.href
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "bg-muted/50 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge
                            variant={item.isNew ? "default" : "secondary"}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full ml-auto",
                              item.isNew
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border border-blue-200/20">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Need Help?</p>
                  <p className="text-xs text-muted-foreground">
                    Contact support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
