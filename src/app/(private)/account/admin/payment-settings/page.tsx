"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageTitle from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPaymentSettings, updatePaymentSettings, IPaymentSettings } from "@/actions/payment-settings";
import toast from "react-hot-toast";
import { 
  CreditCard, 
  Settings, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";

function PaymentSettingsPage() {
  const [paymentSettings, setPaymentSettings] = useState<IPaymentSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const response = await getPaymentSettings();
      if (response.success && response.data) {
        setPaymentSettings(response.data);
      } else {
        toast.error("Failed to fetch payment settings");
      }
    } catch (error) {
      toast.error("Error fetching payment settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (gatewayName: string, updates: Partial<IPaymentSettings>) => {
    try {
      setSaving(gatewayName);
      const response = await updatePaymentSettings(gatewayName, updates);
      
      if (response.success) {
        toast.success(`${gatewayName} settings updated successfully`);
        await fetchPaymentSettings();
      } else {
        toast.error(response.message || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Error updating settings");
    } finally {
      setSaving(null);
    }
  };

  const handleSettingsChange = (gatewayName: string, field: string, value: any) => {
    setPaymentSettings(prev => 
      prev.map(setting => 
        setting.gateway_name === gatewayName 
          ? {
              ...setting,
              settings: {
                ...setting.settings,
                [field]: value
              }
            }
          : setting
      )
    );
  };

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 flex items-center justify-center animate-pulse">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="relative">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            {/* Navigation */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                size="sm"
                className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
              >
                <Link href="/account" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            </div>

            {/* Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-300 dark:from-indigo-900/30 dark:via-indigo-800/30 dark:to-indigo-700/30 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center shadow-lg">
                    <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                    Payment Gateway Settings
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    Configure and manage your payment gateways. Enable multiple gateways or use them individually.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paymentSettings.map((setting) => (
              <Card key={setting.gateway_name} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        setting.gateway_name === 'razorpay' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="capitalize flex items-center gap-2">
                          {setting.gateway_name}
                          {setting.is_primary && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {setting.gateway_name === 'razorpay' 
                            ? 'Indian payment gateway with UPI, cards, and net banking'
                            : 'Global payment processor with extensive card support'
                          }
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={setting.is_enabled ? "default" : "secondary"}>
                        {setting.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Enable Gateway</Label>
                      <p className="text-xs text-gray-500">
                        Allow customers to pay using this gateway. Multiple gateways can be enabled simultaneously.
                      </p>
                    </div>
                    <Switch
                      checked={setting.is_enabled}
                      onCheckedChange={(checked: boolean) => 
                        handleUpdateSettings(setting.gateway_name, { is_enabled: checked })
                      }
                      disabled={saving === setting.gateway_name}
                    />
                  </div>

                  {/* Primary Gateway Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Set as Primary</Label>
                      <p className="text-xs text-gray-500">
                        Use this as the default payment gateway when multiple gateways are enabled
                      </p>
                    </div>
                    <Switch
                      checked={setting.is_primary}
                      onCheckedChange={(checked: boolean) => 
                        handleUpdateSettings(setting.gateway_name, { is_primary: checked })
                      }
                      disabled={saving === setting.gateway_name || !setting.is_enabled}
                    />
                  </div>

                  {/* Gateway-specific settings */}
                  {setting.gateway_name === 'razorpay' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <Label className="text-sm font-medium">Razorpay Configuration</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`razorpay-key-id-${setting.gateway_name}`} className="text-xs">Key ID</Label>
                        <Input
                          id={`razorpay-key-id-${setting.gateway_name}`}
                          name="razorpay_key_id"
                          type="text"
                          placeholder="rzp_live_xxxxxxxxxx"
                          value={setting.settings.key_id || ''}
                          onChange={(e) => handleSettingsChange(setting.gateway_name, 'key_id', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`razorpay-key-secret-${setting.gateway_name}`} className="text-xs">Key Secret</Label>
                        <Input
                          id={`razorpay-key-secret-${setting.gateway_name}`}
                          name="razorpay_key_secret"
                          type="password"
                          placeholder="••••••••••••••••"
                          value={setting.settings.key_secret || ''}
                          onChange={(e) => handleSettingsChange(setting.gateway_name, 'key_secret', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {setting.gateway_name === 'stripe' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <Label className="text-sm font-medium">Stripe Configuration</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`stripe-publishable-key-${setting.gateway_name}`} className="text-xs">Publishable Key</Label>
                        <Input
                          id={`stripe-publishable-key-${setting.gateway_name}`}
                          name="stripe_publishable_key"
                          type="text"
                          placeholder="pk_live_xxxxxxxxxx"
                          value={setting.settings.publishable_key || ''}
                          onChange={(e) => handleSettingsChange(setting.gateway_name, 'publishable_key', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`stripe-secret-key-${setting.gateway_name}`} className="text-xs">Secret Key</Label>
                        <Input
                          id={`stripe-secret-key-${setting.gateway_name}`}
                          name="stripe_secret_key"
                          type="password"
                          placeholder="sk_live_xxxxxxxxxx"
                          value={setting.settings.secret_key || ''}
                          onChange={(e) => handleSettingsChange(setting.gateway_name, 'secret_key', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button
                    onClick={() => handleUpdateSettings(setting.gateway_name, {
                      settings: setting.settings
                    })}
                    disabled={saving === setting.gateway_name}
                    className="w-full mt-4"
                    variant={setting.is_enabled ? "default" : "outline"}
                  >
                    {saving === setting.gateway_name ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Payment Gateway Usage Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Multiple Gateways Enabled</h4>
                  <p>When both gateways are enabled, customers can choose their preferred payment method. The primary gateway will be selected by default.</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Single Gateway Enabled</h4>
                  <p>When only one gateway is enabled, all payments will be processed through that gateway automatically.</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <p>• <strong>Primary Gateway:</strong> The primary gateway will be pre-selected when multiple gateways are available.</p>
                  <p>• <strong>Simultaneous Usage:</strong> Both gateways can be enabled at the same time to provide customers with more payment options.</p>
                  <p>• <strong>Individual Usage:</strong> You can enable only one gateway if you prefer to use a single payment processor.</p>
                  <p>• <strong>Security:</strong> API keys are encrypted and stored securely. Never share your secret keys.</p>
                  <p>• <strong>Testing:</strong> Use test keys during development and switch to live keys for production.</p>
                  <p>• <strong>Webhooks:</strong> Configure webhooks in your gateway dashboard for real-time payment updates.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PaymentSettingsPage;
