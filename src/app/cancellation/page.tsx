// app/cancellation/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, AlertTriangle } from "lucide-react";

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Cancellation Policy
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Cancellation Policy
          </h1>
          <p className="text-lg text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-gradient-to-br from-red-900/20 to-gray-800/90 border-red-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200">
              <strong>No Cancellation Policy:</strong> All TrackyFy subscriptions are non-cancellable once activated. 
              Please review our refund policy for eligible refund scenarios within the first 7 days.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <XCircle className="mr-2 h-5 w-5 text-orange-500" />
              Cancellation Policy Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. No Cancellation Policy</h3>
              <p>TrackyFy operates under a <strong>no cancellation policy</strong>. Once a subscription is purchased and activated, it cannot be cancelled for the duration of the subscription period.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Subscription Duration</h3>
              <p>All subscriptions run for their full term:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>Monthly:</strong> 30 days from activation</li>
                <li><strong>Quarterly:</strong> 90 days from activation</li>
                <li><strong>Half-Yearly:</strong> 180 days from activation</li>
                <li><strong>Yearly:</strong> 365 days from activation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Alternative Options</h3>
              <p>While cancellation is not available, you have these options:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>Refund Request:</strong> Available within 7 days of purchase (see Refund Policy)</li>
                <li><strong>Account Suspension:</strong> Temporarily suspend your account (subscription continues)</li>
                <li><strong>Plan Downgrade:</strong> Switch to a lower plan at next billing cycle</li>
                <li><strong>Non-Renewal:</strong> Choose not to renew when current term expires</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. Automatic Renewal</h3>
              <p>Subscriptions automatically renew at the end of each term unless:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>You disable auto-renewal in your account settings</li>
                <li>Payment method fails or is declined</li>
                <li>Account is suspended for terms violation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Service Termination</h3>
              <p>We reserve the right to terminate services immediately for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Violation of Terms & Conditions</li>
                <li>Fraudulent activities</li>
                <li>Abuse of service or support</li>
                <li>Non-payment of dues</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Data Access</h3>
              <p>Upon subscription expiry or termination:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Access to the platform will be suspended</li>
                <li>Data will be retained for 30 days for potential renewal</li>
                <li>After 30 days, data may be permanently deleted</li>
                <li>Data export must be completed before expiry</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Contact Information</h3>
              <p>For questions about this cancellation policy, contact MD SAMIE SOHRAB at:</p>
              <p className="mt-2">Arbiya College Road, In front of Middle School, Purnea, Purnia, Purnea, Durga Asthan, Madhopara, Purnea, Bihar, India, 854301</p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-6">
              <h4 className="text-orange-400 font-semibold mb-2">Recommendation</h4>
              <p className="text-orange-200">
                We strongly recommend reviewing all features and taking advantage of our 7-day refund policy 
                if the service doesn't meet your expectations. Once this period expires, the subscription 
                becomes non-cancellable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
