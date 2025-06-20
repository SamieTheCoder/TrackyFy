// app/refund/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CreditCard } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Refund Policy
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Return & Refund Policy
          </h1>
          <p className="text-lg text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-500" />
                7-Day Window
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Request refunds within 7 days of purchase</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-orange-500" />
                Original Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Refunds processed to original payment source</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-orange-500" />
                5-7 Business Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Processing time for approved refunds</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <RefreshCw className="mr-2 h-5 w-5 text-orange-500" />
              Return & Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Refund Eligibility</h3>
              <p>You are eligible for a full refund if:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>You request a refund within 7 days of your initial subscription purchase</li>
                <li>You have not extensively used the service (less than 10% of features accessed)</li>
                <li>Technical issues prevent you from using the service</li>
                <li>The service does not meet the advertised specifications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Refund Duration</h3>
              <p><strong>7-Day Refund Window:</strong> All refund requests must be submitted within 7 days of the original purchase date. Requests submitted after this period will not be eligible for refunds.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Refund Process</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact our support team with your refund request</li>
                <li>Provide your subscription ID and reason for refund</li>
                <li>Our team will review your request within 2 business days</li>
                <li>If approved, refund will be processed within 5-7 business days</li>
                <li>You will receive confirmation once the refund is processed</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. Refund Mode</h3>
              <p>All approved refunds will be processed through the original payment method:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                <li><strong>Net Banking:</strong> 3-5 business days</li>
                <li><strong>UPI:</strong> 1-3 business days</li>
                <li><strong>Digital Wallets:</strong> 1-3 business days</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Non-Refundable Items</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Subscriptions used for more than 7 days</li>
                <li>Custom setup or consultation services</li>
                <li>Third-party integrations or add-ons</li>
                <li>Data export or migration services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Partial Refunds</h3>
              <p>In certain circumstances, we may offer partial refunds based on usage and time elapsed. This is evaluated on a case-by-case basis.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Contact for Refunds</h3>
              <p>To request a refund, contact MD SAMIE SOHRAB at:</p>
              <p className="mt-2">Arbiya College Road, In front of Middle School, Purnea, Purnia, Purnea, Durga Asthan, Madhopara, Purnea, Bihar, India, 854301</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
