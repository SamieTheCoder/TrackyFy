// app/privacy/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Privacy & Security
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="mr-2 h-5 w-5 text-orange-500" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal information (name, email, phone number)</li>
                <li>Business information (gym details, member data)</li>
                <li>Payment information (processed securely through PayU)</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our services</li>
                <li>Process payments and transactions</li>
                <li>Send important updates and notifications</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Information Sharing</h3>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share information only:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>With trusted service providers (payment processors)</li>
                <li>To protect our rights and safety</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. Data Security</h3>
              <p>We implement appropriate security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. All payment information is processed through secure, PCI-compliant payment gateways.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Data Retention</h3>
              <p>We retain your information for as long as necessary to provide services and comply with legal obligations. You may request deletion of your data at any time.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Cookies</h3>
              <p>We use cookies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">8. Contact Us</h3>
              <p>For privacy-related questions or concerns, contact MD SAMIE SOHRAB at:</p>
              <p className="mt-2">Arbiya College Road, In front of Middle School, Purnea, Purnia, Purnea, Durga Asthan, Madhopara, Purnea, Bihar, India, 854301</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
