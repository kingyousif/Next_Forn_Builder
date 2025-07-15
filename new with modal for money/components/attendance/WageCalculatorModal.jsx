"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Save, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WageCalculatorModal = ({ totalHours, onWageUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(8);
  const [amount, setAmount] = useState(20);
  const [savedWageConfig, setSavedWageConfig] = useState(null);
  const [calculatedWage, setCalculatedWage] = useState(0);

  // Load saved wage configuration from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wageConfiguration");
    if (saved) {
      const config = JSON.parse(saved);
      setSavedWageConfig(config);
      setHours(config.hours);
      setAmount(config.amount);
    }
  }, []);

  // Calculate wage whenever totalHours or wage config changes
  useEffect(() => {
    if (savedWageConfig && totalHours) {
      const hourlyRate = savedWageConfig.amount / savedWageConfig.hours;
      const totalMinutes = totalHours.totalMinutes || 0;
      const totalHoursDecimal = totalMinutes / 60;
      const wage = totalHoursDecimal * hourlyRate;
      setCalculatedWage(wage);

      // Notify parent component about wage update
      if (onWageUpdate) {
        onWageUpdate({
          totalWage: wage,
          hourlyRate: hourlyRate,
          config: savedWageConfig,
        });
      }
    }
  }, [savedWageConfig, totalHours]); // Removed onWageUpdate from dependencies

  const handleSave = () => {
    if (hours <= 0 || amount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Hours and amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const config = {
      hours: parseFloat(hours),
      amount: parseFloat(amount),
      currency: "IQD", // Iraqi Dinar
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("wageConfiguration", JSON.stringify(config));
    setSavedWageConfig(config);
    setIsOpen(false);

    toast({
      title: "Success",
      description: `Wage configuration saved: ${hours} hours = ${amount} IQD`,
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace("IQD", "دينار");
  };

  return (
    <div className="space-y-4">
      {/* Wage Display Card */}
      {savedWageConfig && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <DollarSign className="h-5 w-5" />
              Wage Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    savedWageConfig.amount / savedWageConfig.hours
                  )}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">
                  Per Hour
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalHours
                    ? `${totalHours.hours}h ${totalHours.minutes}m`
                    : "0h 0m"}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">
                  Total Hours
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(calculatedWage)}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">
                  Total Wage
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="w-full justify-center text-emerald-700 border-emerald-300"
            >
              Rate: {savedWageConfig.hours} hours ={" "}
              {formatCurrency(savedWageConfig.amount)}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Wage Calculator Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Calculator className="h-4 w-4 mr-2" />
            {savedWageConfig ? "Edit Wage Rate" : "Set Wage Rate"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Hourly Wage Calculator
            </DialogTitle>
            <DialogDescription>
              Set your hourly wage rate in Iraqi Dinars (IQD)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="8"
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (IQD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="20"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            {/* Preview */}
            {hours > 0 && amount > 0 && (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Hourly Rate Preview
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                      {formatCurrency(amount / hours)} / hour
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {hours} hours = {formatCurrency(amount)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WageCalculatorModal;
