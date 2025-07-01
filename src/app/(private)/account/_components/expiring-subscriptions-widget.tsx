"use client";
import React, { useState } from "react";
import { 
  AlertTriangle, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  RefreshCw,
  ExternalLink,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import toast from "react-hot-toast";

interface Subscription {
  id: string;
  user_name: string;
  user_email: string;
  plan_name: string;
  end_date: string;
  amount: number;
  days_remaining: number;
}

interface ExpiringSubscriptionsWidgetProps {
  expiringSubscriptions: Subscription[];
  expiredSubscriptions: Subscription[];
  onRefresh: () => void;
}

function ExpiringSubscriptionsWidget({ 
  expiringSubscriptions, 
  expiredSubscriptions, 
  onRefresh 
}: ExpiringSubscriptionsWidgetProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
    toast.success("Data refreshed successfully");
  };

  const sendReminderEmail = async (subscriptionId: string, userEmail: string) => {
    try {
      // Implement your email sending logic here
      toast.success(`Reminder sent to ${userEmail}`);
    } catch (error) {
      toast.error("Failed to send reminder");
    }
  };

  const SubscriptionCard = ({ subscription, isExpired = false }: { subscription: Subscription; isExpired?: boolean }) => (
    <div className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      isExpired 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
        : subscription.days_remaining <= 3
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <User className="h-4 w-4 mr-2" />
            {subscription.user_name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {subscription.user_email}
          </p>
        </div>
        <Badge variant={isExpired ? "destructive" : subscription.days_remaining <= 3 ? "destructive" : "secondary"}>
          {isExpired ? 'Expired' : `${subscription.days_remaining} days left`}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Plan:</span>
          <span className="font-medium text-gray-900 dark:text-white">{subscription.plan_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
          <span className="font-medium text-gray-900 dark:text-white">₹{subscription.amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">End Date:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {dayjs(subscription.end_date).format("MMM DD, YYYY")}
          </span>
        </div>
      </div>

      {/* <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => sendReminderEmail(subscription.id, subscription.user_email)}
          className="flex-1"
        >
          <Mail className="h-3 w-3 mr-1" />
          Send Reminder
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.open(`mailto:${subscription.user_email}`, '_blank')}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div> */}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Monitor expiring and expired subscriptions for proactive customer outreach
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expiring" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expiring" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expiring Soon ({expiringSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Recently Expired ({expiredSubscriptions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expiring" className="mt-6">
            {expiringSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Expiring Subscriptions
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All subscriptions are in good standing for the next 7 days.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiringSubscriptions.map((subscription) => (
                  <SubscriptionCard 
                    key={subscription.id} 
                    subscription={subscription} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired" className="mt-6">
            {expiredSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Recently Expired Subscriptions
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No subscriptions have expired in the past week.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiredSubscriptions.map((subscription) => (
                  <SubscriptionCard 
                    key={subscription.id} 
                    subscription={subscription} 
                    isExpired={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ExpiringSubscriptionsWidget;
