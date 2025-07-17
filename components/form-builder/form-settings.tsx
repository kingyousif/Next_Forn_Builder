"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Mail,
  Palette,
  Bell,
  Type,
  Code,
  CheckCircle,
  Send,
} from "lucide-react";

interface FormSettingsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function FormSettings({ formData, setFormData }: FormSettingsProps) {
  const handleSettingChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Form Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your form's behavior and appearance
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white dark:bg-slate-800 shadow-sm">
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure the basic settings for your form
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="submit-button-text"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Send className="h-4 w-4 text-blue-600" />
                    Submit Button Text
                  </Label>
                  <Input
                    id="submit-button-text"
                    value={formData.settings.submitButtonText}
                    onChange={(e) =>
                      handleSettingChange("submitButtonText", e.target.value)
                    }
                    className="bg-white dark:bg-slate-800 border-2 hover:border-purple-300 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirect-url" className="text-sm font-medium">
                    Redirect URL (Optional)
                  </Label>
                  <Input
                    id="redirect-url"
                    value={formData.settings.redirectUrl || ""}
                    onChange={(e) =>
                      handleSettingChange("redirectUrl", e.target.value)
                    }
                    placeholder="https://example.com/thank-you"
                    className="bg-white dark:bg-slate-800 border-2 hover:border-purple-300 focus:border-purple-500 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to show the success message instead
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="success-message"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Success Message
                </Label>
                <Textarea
                  id="success-message"
                  value={formData.settings.successMessage}
                  onChange={(e) =>
                    handleSettingChange("successMessage", e.target.value)
                  }
                  rows={4}
                  className="bg-white dark:bg-slate-800 border-2 hover:border-purple-300 focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email notifications for form submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-800">
                <div className="space-y-1">
                  <Label
                    htmlFor="enable-email-notifications"
                    className="text-sm font-medium"
                  >
                    Enable Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive an email when someone submits your form
                  </p>
                </div>
                <Switch
                  id="enable-email-notifications"
                  checked={formData.settings.enableEmailNotifications || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableEmailNotifications", checked)
                  }
                />
              </div>

              {formData.settings.enableEmailNotifications && (
                <div className="space-y-6 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Email Notifications Enabled
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email-recipient"
                        className="text-sm font-medium"
                      >
                        Email Recipient
                      </Label>
                      <Input
                        id="email-recipient"
                        value={formData.settings.emailRecipient || ""}
                        onChange={(e) =>
                          handleSettingChange("emailRecipient", e.target.value)
                        }
                        placeholder="you@example.com"
                        type="email"
                        className="bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email-subject"
                        className="text-sm font-medium"
                      >
                        Email Subject
                      </Label>
                      <Input
                        id="email-subject"
                        value={
                          formData.settings.emailSubject ||
                          `New submission: ${formData.title}`
                        }
                        onChange={(e) =>
                          handleSettingChange("emailSubject", e.target.value)
                        }
                        className="bg-white dark:bg-slate-800 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-green-600" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your form
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-sm font-medium">
                    Form Theme
                  </Label>
                  <Select
                    value={formData.settings.theme || "default"}
                    onValueChange={(value) =>
                      handleSettingChange("theme", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-2 hover:border-green-300 focus:border-green-500 transition-colors">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="font-size"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Type className="h-4 w-4 text-purple-600" />
                    Font Size
                  </Label>
                  <Select
                    value={formData.settings.fontSize || "medium"}
                    onValueChange={(value) =>
                      handleSettingChange("fontSize", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-2 hover:border-green-300 focus:border-green-500 transition-colors">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="custom-css"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Code className="h-4 w-4 text-orange-600" />
                  Custom CSS (Advanced)
                </Label>
                <Textarea
                  id="custom-css"
                  value={formData.settings.customCss || ""}
                  onChange={(e) =>
                    handleSettingChange("customCss", e.target.value)
                  }
                  placeholder=".form-element { border-radius: 8px; }"
                  rows={6}
                  className="bg-white dark:bg-slate-800 border-2 hover:border-green-300 focus:border-green-500 transition-colors resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Add custom CSS to further customize your form's appearance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
