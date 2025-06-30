// app/contact/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, QrCode } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Get In Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Contact Us
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to us through any of
            the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-orange-500" />
                  Registered Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  <strong>MD SAMIE SOHRAB</strong>
                  <br />
                  Arbiya College Road, In front of Middle School
                  <br />
                  Purnea, Purnia, Purnea
                  <br />
                  Durga Asthan, Madhopara
                  <br />
                  Purnea, Bihar, India
                  <br />
                  PIN: 854301
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-orange-500" />
                  Phone Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  <strong>Mobile:</strong> +91-99051-77065
                  <br />
                  <span className="text-sm text-gray-400">
                    Available during business hours
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-orange-500" />
                  Email Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  <strong>Support:</strong> support@trackyfy.com
                  <br />
                  <strong>Business:</strong> business@trackyfy.com
                  <br />
                  <span className="text-sm text-gray-400">
                    Response within 24 hours
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-orange-500" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 space-y-1">
                  <p>
                    <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM IST
                  </p>
                  <p>
                    <strong>Saturday:</strong> 10:00 AM - 4:00 PM IST
                  </p>
                  <p>
                    <strong>Sunday:</strong> Closed
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Emergency support available 24/7
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Large QR Code Section */}
          <div className="flex items-center justify-center">
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center text-2xl">
                  <QrCode className="mr-3 h-7 w-7 text-orange-500" />
                  Visit Our Website
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="flex flex-col items-center space-y-8">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl">
                    <Image
                      src="/qr-code.png"
                      alt="Website QR Code - Scan to visit trackyfy.com"
                      width={300}
                      height={300}
                      className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl text-gray-300 font-medium">
                      Scan to visit our website instantly
                    </p>
                    <p className="text-lg text-orange-400 font-semibold">
                      www.trackyfy.com
                    </p>
                    <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Point your camera at the QR code above to quickly access
                        our website, explore our services, and get in touch with
                        us directly.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
