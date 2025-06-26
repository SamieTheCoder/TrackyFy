"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Globe, Monitor, Wifi, Clock } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Delivery Information
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Shipping & Delivery Policy
          </h1>
          <p className="text-lg text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="mr-2 h-5 w-5 text-orange-500" />
                Instant Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Immediate service activation upon payment</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="mr-2 h-5 w-5 text-orange-500" />
                Digital Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Cloud-based service, no physical shipping required</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-500" />
                24/7 Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Access your service anytime, anywhere</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Truck className="mr-2 h-5 w-5 text-orange-500" />
              Shipping & Delivery Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. No Physical Products</h3>
              <p>
                <strong>TrackyFy is a 100% digital service.</strong> We do not manufacture, store, or ship any physical products. 
                All our services are delivered electronically through our cloud-based platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Digital Service Delivery</h3>
              <p>TrackyFy is a Software-as-a-Service (SaaS) platform that provides gym management solutions entirely online. Your subscription includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Web-based dashboard access</li>
                <li>Cloud data storage and management</li>
                <li>Online member management tools</li>
                <li>Digital analytics and reporting</li>
                <li>Automated workflow systems</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Service Activation</h3>
              <p><strong>Instant Activation:</strong> Your TrackyFy subscription is activated immediately upon successful payment confirmation. You will receive:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Email confirmation of your subscription</li>
                <li>Login credentials and access instructions</li>
                <li>Welcome guide and setup tutorials</li>
                <li>Direct access to customer support</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. Delivery Timeline</h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Activation:</strong> Immediate (within 5 minutes of payment)</li>
                  <li><strong>Welcome Email:</strong> Within 10 minutes of activation</li>
                  <li><strong>Setup Support:</strong> Available immediately</li>
                  <li><strong>Full Service Access:</strong> Instant upon login</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Access Requirements</h3>
              <p>To access TrackyFy services, you only need:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>Internet Connection:</strong> Stable broadband connection</li>
                <li><strong>Web Browser:</strong> Modern browser (Chrome, Firefox, Safari, Edge)</li>
                <li><strong>Email Address:</strong> Valid email for account management</li>
                <li><strong>Device:</strong> Computer, tablet, or smartphone</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Service Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                    <Monitor className="mr-2 h-4 w-4" />
                    Platform Uptime
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• 99.9% service availability guaranteed</li>
                    <li>• Scheduled maintenance during low-usage hours</li>
                    <li>• Real-time status monitoring</li>
                  </ul>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2 flex items-center">
                    <Wifi className="mr-2 h-4 w-4" />
                    Support Availability
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Business hours: 9 AM - 6 PM IST</li>
                    <li>• Email support: 24/7</li>
                    <li>• Emergency support for critical issues</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Geographic Coverage</h3>
              <p>TrackyFy services are available globally with optimized performance for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>India:</strong> Primary market with local support and faster response times</li>
                <li><strong>Asia-Pacific:</strong> Optimized servers for reduced latency</li>
                <li><strong>Global Access:</strong> Available worldwide with standard support</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">8. Data Migration & Setup</h3>
              <p>For customers requiring data migration or custom setup assistance:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>Self-Service Setup:</strong> Immediate, with guided tutorials</li>
                <li><strong>Assisted Setup:</strong> 1-2 business days with our support team</li>
                <li><strong>Data Migration:</strong> 3-5 business days for complex migrations</li>
                <li><strong>Custom Integration:</strong> Timeline varies based on requirements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">9. What You Get Immediately</h3>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <p className="text-orange-200 mb-2">Upon successful payment, you instantly receive:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Complete access to TrackyFy dashboard</li>
                  <li>Member management system</li>
                  <li>Payment processing tools</li>
                  <li>Analytics and reporting features</li>
                  <li>Automated workflow systems</li>
                  <li>Customer support access</li>
                  <li>Documentation and training materials</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">10. Contact Information</h3>
              <p>For questions about service delivery or access issues, contact:</p>
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 mt-2">
                <p className="text-gray-300">
                  <strong>MD SAMIE SOHRAB</strong><br />
                  Arbiya College Road, In front of Middle School<br />
                  Purnea, Purnia, Purnea, Durga Asthan, Madhopara<br />
                  Purnea, Bihar, India, 854301<br />
                  <strong>Phone:</strong> +91-99051-77065<br />
                  <strong>Email:</strong> support@trackyfy.com
                </p>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-6">
              <h4 className="text-green-400 font-semibold mb-2 flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Ready to Get Started?
              </h4>
              <p className="text-green-200">
                Your TrackyFy subscription activates instantly upon payment. No waiting, no shipping delays - 
                just immediate access to powerful gym management tools. Start transforming your fitness business today!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
