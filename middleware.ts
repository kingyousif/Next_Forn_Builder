import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define role hierarchy
const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super admin",
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

// Define page access by role with hierarchy
const pageAccessControl = {
  // Pages accessible by all authenticated users
  [ROLES.USER]: [
    "/dashboard",
    "/dashboard/swaping-workers",
    "/dashboard/selling-workers",
    "/dashboard/swaping-workers/manage",
    "/dashboard/selling-workers/manage",
    "/dashboard/analytics",
    "/dashboard/attendance-tracking",
  ],

  // Pages accessible by admin and super admin
  [ROLES.ADMIN]: [
    "/dashboard/analytics",
    "/dashboard/swaping-workers/manage",
    "/dashboard/selling-workers/manage",
    "/dashboard/form-builder",
    "/dashboard/form-builder/new",
    "/dashboard/form-builder/:id",
    "/dashboard/department",
    "/dashboard/employee-schedule",
    "/dashboard/employee-cv-print",
    "/dashboard/employee-profile",
  ],

  // Pages accessible only by super admin
  [ROLES.SUPER_ADMIN]: [
    "/dashboard/department-analytics",
    "/dashboard/department",
    "/dashboard/form-builder",
    "/dashboard/logs",
    "/dashboard/manage-employee",
    // "/dashboard/form-builder/new",
    "/dashboard/attendance-statistics",
    "/dashboard/attendance-tracking",
    "/dashboard/time-management",
    "/dashboard/attendance",
    "/dashboard/employee-management",
    "/dashboard/my-certification",
    "/dashboard/manage-certification",
    "/dashboard/my-seminar",
    "/dashboard/manage-seminar",
    "/dashboard/seminar-register",
    "/dashboard/employee-profile",
    "/dashboard/employee-cv-print",
  ],
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for non-dashboard routes
  if (!path.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Skip middleware for API routes
  if (path.startsWith("/api")) {
    return NextResponse.next();
  }

  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Get and decrypt role
    const encryptedRole = request.cookies.get("role")?.value;
    if (!encryptedRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = await decryptRole(encryptedRole);
    if (!userRole) {
      console.error("Failed to decrypt role");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify token is still valid (optional but recommended)
    const isValidToken = await verifyToken(token);
    if (!isValidToken) {
      console.error("Invalid token");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if the current path is allowed for the user's role
    const isAllowed = checkPathAccess(path, userRole);

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Improved role decryption with better error handling
async function decryptRole(encryptedText: string): Promise<Role | null> {
  try {
    // Use server-side encryption key (not exposed to client)
    const ENCRYPTION_KEY =
      process.env.ENCRYPTION_KEY || "your-secret-key-32-chars-long!!";

    // Reverse the string and decode
    const reversed = encryptedText.split("").reverse().join("");
    const decoded = atob(reversed);

    // Remove the key from the end
    const original = decoded.replace(ENCRYPTION_KEY, "");

    // Validate that the decrypted role is valid
    const validRoles = Object.values(ROLES);
    if (validRoles.includes(original as Role)) {
      return original as Role;
    }

    return null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

// Token verification function
async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-auth`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Add timeout for the request
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

// Helper function to check if a path is accessible for a role with hierarchy
function checkPathAccess(path: string, role: Role): boolean {
  if (path === "/dashboard") return true;

  const accessiblePaths = getAccessiblePathsForRole(role);

  // Check for exact match or dynamic route match
  return accessiblePaths.some((route) => {
    if (route === path) return true;

    // Handle dynamic segments like :id
    const routeRegex = new RegExp(
      "^" + route.replace(/:[^/]+/g, "[^/]+") + "$"
    );
    return routeRegex.test(path);
  });
}

// Get all accessible paths for a role (including inherited permissions)
function getAccessiblePathsForRole(role: Role): string[] {
  let paths: string[] = [];

  // All users get user-level access
  paths = [...paths, ...pageAccessControl[ROLES.USER]];

  // Admins and super admins get admin-level access
  if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
    paths = [...paths, ...pageAccessControl[ROLES.ADMIN]];
  }

  // Super admins get super admin-level access
  if (role === ROLES.SUPER_ADMIN) {
    paths = [...paths, ...pageAccessControl[ROLES.SUPER_ADMIN]];
  }

  return paths;
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Match all dashboard routes but exclude API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
  ],
};
