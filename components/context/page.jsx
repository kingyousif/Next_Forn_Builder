"use client";

import { createContext, useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

// Auth Context
export const AuthContext = createContext();

// Encryption/Decryption utilities
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key-32-chars-long!!";

// Simple encryption function
const encryptData = async (text) => {
  try {
    // Convert string to base64 with a simple cipher
    const encoded = btoa(text + ENCRYPTION_KEY);
    return encoded.split("").reverse().join(""); // Reverse for additional obfuscation
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Fallback to plain text
  }
};

// Simple decryption function
const decryptData = async (encryptedText) => {
  try {
    // Reverse the string and decode
    const reversed = encryptedText.split("").reverse().join("");
    const decoded = atob(reversed);
    // Remove the key from the end
    const original = decoded.replace(ENCRYPTION_KEY, "");
    return original;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
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

  // Function to safely get encrypted role from cookie and decrypt it
  const getRoleFromCookie = async () => {
    try {
      const encryptedRole = Cookies.get("role");
      if (!encryptedRole) {
        return null;
      }
      const decryptedRole = await decryptData(encryptedRole);
      return decryptedRole;
    } catch (error) {
      console.error("Error decrypting role from cookie:", error);
      Cookies.remove("role");
      return null;
    }
  };

  // Function to encrypt and set role in cookie
  const setRoleInCookie = async (roleValue) => {
    try {
      const encryptedRole = await encryptData(roleValue);
      Cookies.set("role", encryptedRole);
    } catch (error) {
      console.error("Error encrypting role for cookie:", error);
      // Fallback: don't store role if encryption fails
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setGlobalLoading(true);
      const response = await axios.post(`${url}/api/auth/login`, credentials);

      if (response.data.user._id && response.data.user.token) {
        const userData = {
          id: response.data.user._id,
          name: response.data.user.name,
          fullName: response.data.user.fullName,
          department: response.data.user.department,
        };

        const userRole = response.data.user.role;

        // Set cookies with encrypted role
        Cookies.set("user", JSON.stringify(userData));
        Cookies.set("token", response.data.user.token);
        await setRoleInCookie(userRole); // Encrypt and store role

        // Update state
        setUser(response.data.user);
        setToken(response.data.user.token);
        setRole(userRole);
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
    Cookies.remove("role"); // Remove encrypted role cookie
    setUser(null);
    setToken(null);
    setRole(null);
    setAuthError(null);
    router.push("/login");
  };

  // Check authentication status
  const checkAuth = async () => {
    const currentUser = getUserFromCookie();
    const currentToken = getTokenFromCookie();
    const currentRole = await getRoleFromCookie(); // Decrypt role from cookie

    if (!currentUser || !currentToken) {
      setGlobalLoading(false);
      return false;
    }

    // Set initial state from cookies (role is already decrypted)
    setUser(currentUser);
    setToken(currentToken);
    setRole(currentRole);

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
        // Update role if it changed on server
        const serverRole = res.data.user.role;
        if (serverRole !== currentRole) {
          await setRoleInCookie(serverRole); // Encrypt and update role
          setRole(serverRole);
        }

        setAuthError(null);
        return true;
      } else {
        logout();
        return false;
      }
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
      const cookieRole = await getRoleFromCookie(); // Decrypt role from cookie

      if (cookieUser && cookieToken) {
        // Set initial state immediately from cookies
        setUser(cookieUser);
        setToken(cookieToken);
        setRole(cookieRole);

        // Verify with server (without duplicating state setting)
        try {
          const res = await axios.post(
            `${url}/api/auth/check-auth`,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${cookieToken}`,
                "Content-Type": "application/json",
              },
              timeout: 8000,
            }
          );

          if (
            res.data.user &&
            res.data.user.token === cookieToken &&
            res.data.user._id === cookieUser.id
          ) {
            // Update role if it changed on server
            const serverRole = res.data.user.role;
            if (serverRole !== cookieRole) {
              await setRoleInCookie(serverRole);
              setRole(serverRole);
            }

            setAuthError(null);

            // Redirect if on login page
            if (pathname === "/login") {
              router.push("/dashboard");
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth check error during init:", error);
          setAuthError("Authentication check failed");
          logout();
        }
      } else {
        setGlobalLoading(false);
      }

      setGlobalLoading(false);
    };

    initAuth();
  }, []);

  // Export all auth-related values and functions
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role, // This will now be consistently available and decrypted
        globalLoading,
        authError,
        login,
        logout,
        checkAuth,
        setUser,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy context usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
