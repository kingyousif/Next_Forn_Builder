"use client";

import { createContext, useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
// import { useRouter } from "next/router";

// Auth Context
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(true);
  const pathname = usePathname();

  const router = useRouter();
  const url = process.env.NEXT_PUBLIC_API_URL;

  // Function to safely get user from cookie
  const getUserFromCookie = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        setGlobalLoading(false);
        return null;
      }

      const userData = JSON.parse(userCookie);
      if (!userData || typeof userData !== "object" || !userData.id) {
        console.error("Invalid user data in cookie");
        Cookies.remove("user");
        return null;
      }
      return userData;
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      Cookies.remove("user");
      return null;
    }
  };

  // Function to safely get token from cookie
  const getTokenFromCookie = () => {
    return Cookies.get("token") || null;
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${url}/api/auth/login`, credentials);

      if (response.data.user._id && response.data.user.token) {
        const user = {
          id: response.data.user._id,
          name: response.data.user.name,
          fullName: response.data.user.fullName,
          department: response.data.user.department,
        };
        // Set cookies
        Cookies.set("user", JSON.stringify(user));
        Cookies.set("token", response.data.user.token);

        // Update state
        setUser(response.data.user);
        setToken(response.data.user.token);
        setAuthError(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    Cookies.remove("user");
    Cookies.remove("token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  // Check authentication status
  const checkAuth = async () => {
    const currentUser = getUserFromCookie();
    const currentToken = getTokenFromCookie();

    if (!currentUser || !currentToken) {
      setGlobalLoading(false);
      return false;
    }

    try {
      const res = await axios.post(
        `${url}/api/auth/check-auth`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );

      if (
        res.data.user &&
        res.data.user.token === currentToken &&
        res.data.user._id === currentUser.id
      ) {
        setUser(currentUser);
        setToken(currentToken);
        setAuthError(null);
        return true;
      } else {
        logout();
        return false;
      }
      // If validation fails, clear auth state
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthError("Authentication check failed");
      logout();
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      setGlobalLoading(true);
      // Try to get data from cookies first
      const cookieUser = getUserFromCookie();
      const cookieToken = getTokenFromCookie();

      if (cookieUser && cookieToken) {
        setUser(cookieUser);
        setToken(cookieToken);
        let check = await checkAuth(); // Verify with server
        if (check) {
          if (pathname === "/login") {
            router.push("/dashboard");
          } else {
            return;
          }
        }
      } else {
        setGlobalLoading(false);
      }
    };

    initAuth();
  }, []);

  // Export all auth-related values and functions
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        globalLoading,
        authError,
        login,
        logout,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy context usage
export const useAuth = () => useContext(AuthContext);

// Legacy contexts maintained for backward compatibility
export const userContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
}

export const localContext = createContext();

export function LocalProvider({ children }) {
  return (
    <localContext.Provider value={{ local: "Local" }}>
      {children}
    </localContext.Provider>
  );
}
