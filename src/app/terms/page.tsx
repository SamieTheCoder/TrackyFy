// app/terms/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Legal Information
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="mr-2 h-5 w-5 text-orange-500" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Website Operator</h3>
              <p>This website is operated by MD SAMIE SOHRAB, located at Arbiya College Road, In front of Middle School, Purnea, Purnia, Purnea, Durga Asthan, Madhopara, Purnea, Bihar, India, 854301.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Acceptance of Terms</h3>
              <p>By accessing and using TrackyFy services, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Service Description</h3>
              <p>TrackyFy provides gym management software solutions including member management, payment processing, analytics, and automated workflows for fitness businesses.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. User Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Not engage in any unauthorized or illegal activities</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All prices are listed in Indian Rupees (INR)</li>
                <li>Subscription fees are billed in advance</li>
                <li>Payment is due immediately upon subscription activation</li>
                <li>Late payments may result in service suspension</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Intellectual Property</h3>
              <p>All content, features, and functionality of TrackyFy are owned by MD SAMIE SOHRAB and are protected by international copyright, trademark, and other intellectual property laws.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Limitation of Liability</h3>
              <p>TrackyFy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">8. Termination</h3>
              <p>We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">9. Governing Law</h3>
              <p>These terms shall be governed by and construed in accordance with the laws of India, and any disputes shall be subject to the jurisdiction of courts in Bihar, India.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">10. Contact Information</h3>
              <p>For questions about these Terms & Conditions, please contact us at our registered address mentioned above.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
