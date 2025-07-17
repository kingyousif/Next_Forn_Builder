"use client";
import React from "react";
import Link from "next/link";
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

export default function LicenseExpired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-red-900/20 dark:to-orange-900/20 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl transition-all duration-500 hover:shadow-3xl">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 dark:from-red-500 dark:via-orange-500 dark:to-red-600 text-white rounded-t-xl">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white/20 rounded-full backdrop-blur-sm animate-pulse">
                <Shield className="h-20 w-20 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              License Expired
            </CardTitle>
            <CardDescription className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your Harem Hospital Management System license has expired. Please
              renew to continue using all features.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10">
            <div className="space-y-10">
              {/* License Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl p-6 border-2 border-red-200 dark:border-red-700 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                    System Status
                  </h3>
                  <p className="text-red-600 dark:text-red-300 font-medium">
                    Access Restricted
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-700 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Calendar className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                    License Status
                  </h3>
                  <p className="text-orange-600 dark:text-orange-300 font-medium">
                    Expired
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <RefreshCw className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                    Action Required
                  </h3>
                  <p className="text-blue-600 dark:text-blue-300 font-medium">
                    Renew License
                  </p>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 dark:from-gray-900/50 dark:via-slate-900/50 dark:to-gray-900/50 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    What This Means
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>All system features are temporarily disabled</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Patient data remains secure and protected</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>No data will be lost during this period</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Contact your administrator for renewal</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>System will restore immediately after renewal</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>All features will be fully functional</p>
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
                    <div className="text-3xl mb-2">🔄</div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                      Quick Renewal
                    </h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Request immediate license renewal
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Check License Status
                </Button>

                <Link href="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-red-600/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-red-400/15 to-orange-600/15 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
    </div>
  );
}
