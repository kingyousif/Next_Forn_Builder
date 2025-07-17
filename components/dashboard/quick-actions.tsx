import {
  FileText,
  BarChart,
  Download,
  Share2,
  Users,
  Settings,
  Shield,
  Database,
  UserPlus,
  Building,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  userRole: "super_admin" | "admin" | "user";
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getSuperAdminActions = () => [
    {
      icon: Building,
      label: "Manage Organizations",
      href: "/dashboard/organizations",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      label: "User Management",
      href: "/dashboard/users",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      label: "System Settings",
      href: "/dashboard/system",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Database,
      label: "Database Overview",
      href: "/dashboard/database",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BarChart,
      label: "Global Analytics",
      href: "/dashboard/analytics",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Settings,
      label: "Platform Config",
      href: "/dashboard/config",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const getAdminActions = () => [
    {
      icon: FileText,
      label: "Create Form",
      href: "/dashboard/form-builder/new",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      label: "Team Management",
      href: "/dashboard/team",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BarChart,
      label: "Team Analytics",
      href: "/dashboard/analytics",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: UserPlus,
      label: "Invite Users",
      href: "/dashboard/invite",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Download,
      label: "Export Reports",
      href: "/dashboard/exports",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Settings,
      label: "Team Settings",
      href: "/dashboard/settings",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const getUserActions = () => [
    {
      icon: FileText,
      label: "Create Form",
      href: "/dashboard/form-builder/new",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Eye,
      label: "View Forms",
      href: "/dashboard/forms",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BarChart,
      label: "View Analytics",
      href: "/dashboard/analytics",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Edit,
      label: "Edit Profile",
      href: "/dashboard/profile",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Download,
      label: "Export Data",
      href: "/dashboard/exports",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Share2,
      label: "Share Form",
      href: "/dashboard/share",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const getActionsForRole = () => {
    switch (userRole) {
      case "super_admin":
        return getSuperAdminActions();
      case "admin":
        return getAdminActions();
      case "user":
        return getUserActions();
      default:
        return getUserActions();
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Quick Actions
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {userRole === "super_admin" && "System-wide management tools"}
          {userRole === "admin" && "Team management and oversight"}
          {userRole === "user" && "Your essential form tools"}
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>
                  <div className="relative p-4 flex flex-col items-center text-center space-y-3">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      {action.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
