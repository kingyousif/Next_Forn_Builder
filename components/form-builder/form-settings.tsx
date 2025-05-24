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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Tabs defaultValue="general">
      <TabsList className="w-full">
        <TabsTrigger value="general" className="flex-1">
          General
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex-1">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex-1">
          Appearance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure the basic settings for your form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="submit-button-text">Submit Button Text</Label>
              <Input
                id="submit-button-text"
                value={formData.settings.submitButtonText}
                onChange={(e) =>
                  handleSettingChange("submitButtonText", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success-message">Success Message</Label>
              <Textarea
                id="success-message"
                value={formData.settings.successMessage}
                onChange={(e) =>
                  handleSettingChange("successMessage", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
              <Input
                id="redirect-url"
                value={formData.settings.redirectUrl || ""}
                onChange={(e) =>
                  handleSettingChange("redirectUrl", e.target.value)
                }
                placeholder="https://example.com/thank-you"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to show the success message instead
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure email notifications for form submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-email-notifications"
                checked={formData.settings.enableEmailNotifications || false}
                onCheckedChange={(checked) =>
                  handleSettingChange("enableEmailNotifications", checked)
                }
              />
              <Label htmlFor="enable-email-notifications">
                Enable Email Notifications
              </Label>
            </div>

            {formData.settings.enableEmailNotifications && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email-recipient">Email Recipient</Label>
                  <Input
                    id="email-recipient"
                    value={formData.settings.emailRecipient || ""}
                    onChange={(e) =>
                      handleSettingChange("emailRecipient", e.target.value)
                    }
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={
                      formData.settings.emailSubject ||
                      `New submission: ${formData.title}`
                    }
                    onChange={(e) =>
                      handleSettingChange("emailSubject", e.target.value)
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance Settings</CardTitle>
            <CardDescription>
              Customize the look and feel of your form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Form Theme</Label>
              <Select
                value={formData.settings.theme || "default"}
                onValueChange={(value) => handleSettingChange("theme", value)}
              >
                <SelectTrigger id="theme">
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
              <Label htmlFor="font-size">Font Size</Label>
              <Select
                value={formData.settings.fontSize || "medium"}
                onValueChange={(value) =>
                  handleSettingChange("fontSize", value)
                }
              >
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-css">Custom CSS (Advanced)</Label>
              <Textarea
                id="custom-css"
                value={formData.settings.customCss || ""}
                onChange={(e) =>
                  handleSettingChange("customCss", e.target.value)
                }
                placeholder=".form-element { border-radius: 8px; }"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Add custom CSS to further customize your form's appearance
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
