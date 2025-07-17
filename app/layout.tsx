import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/context/page";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Home,
  RefreshCw,
  Clock,
  AlertTriangle,
  Shield,
  Calendar,
} from "lucide-react";
import { decryptData } from "@/utils/encryption";

export const metadata: Metadata = {
  title: "Harem Hospital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { NEXT_PRIVATE_EXPIRE_SYSYTEM } = process.env;
  const encryptedExpireDate = NEXT_PRIVATE_EXPIRE_SYSYTEM ?? "";
  const decryptedExpireDate = decryptData(encryptedExpireDate);
  const expireDate = new Date(decryptedExpireDate || 0);
  const currentDate = new Date();

  // Check if license has expired
  if (currentDate > expireDate) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 transition-colors duration-500">
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
              <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl transition-all duration-500 hover:shadow-3xl">
                <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-600 text-white rounded-t-xl">
                  <div className="flex justify-center mb-6">
                    <div className="p-6 bg-white/20 rounded-full backdrop-blur-sm animate-pulse">
                      <Shield className="h-20 w-20 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                    System Maintenance
                  </CardTitle>
                  <CardDescription className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                    Our Harem Hospital Management System is currently undergoing
                    maintenance. We'll be back online shortly.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-10">
                  <div className="space-y-10">
                    {/* System Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-700 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                          System Status
                        </h3>
                        <p className="text-yellow-600 dark:text-yellow-300 font-medium">
                          Under Maintenance
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                          Availability
                        </h3>
                        <p className="text-blue-600 dark:text-blue-300 font-medium">
                          Temporarily Offline
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6 border-2 border-green-200 dark:border-green-700 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <RefreshCw className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                          Expected Status
                        </h3>
                        <p className="text-green-600 dark:text-green-300 font-medium">
                          Back Online Soon
                        </p>
                      </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 dark:from-gray-900/50 dark:via-slate-900/50 dark:to-gray-900/50 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                          What's Happening
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>System is undergoing scheduled maintenance</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>All patient data remains secure and protected</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>No data will be lost during this period</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>We're working to restore service quickly</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>System will be fully operational soon</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>
                              All features will be available after maintenance
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-700">
                      <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6 text-center">
                        Need Immediate Assistance?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-2">
                          <div className="text-3xl mb-2">📧</div>
                          <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                            Email Support
                          </h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Contact your system administrator
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-3xl mb-2">📞</div>
                          <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                            Phone Support
                          </h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Call technical support team
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-3xl mb-2">⏰</div>
                          <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                            Status Updates
                          </h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Check back in a few minutes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Check System Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-blue-600/15 rounded-full blur-3xl animate-pulse delay-500"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-indigo-600/15 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster theme="system" richColors closeButton />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
