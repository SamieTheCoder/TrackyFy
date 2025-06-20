// app/contact/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Get In Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Contact Us
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to us through any of the channels below.
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
                  <strong>MD SAMIE SOHRAB</strong><br />
                  Arbiya College Road, In front of Middle School<br />
                  Purnea, Purnia, Purnea<br />
                  Durga Asthan, Madhopara<br />
                  Purnea, Bihar, India<br />
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
                  <strong>Mobile:</strong> +91-99051-77065<br />
                  <span className="text-sm text-gray-400">Available during business hours</span>
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
                  <strong>Support:</strong> support@trackyfy.com<br />
                  <strong>Business:</strong> business@trackyfy.com<br />
                  <span className="text-sm text-gray-400">Response within 24 hours</span>
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
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM IST</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM IST</p>
                  <p><strong>Sunday:</strong> Closed</p>
                  <p className="text-sm text-gray-400 mt-2">Emergency support available 24/7</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <Input 
                      placeholder="Enter your first name"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <Input 
                      placeholder="Enter your last name"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input 
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <Input 
                    placeholder="What is this regarding?"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all text-white">
                  Send Message
                </Button>

                <p className="text-sm text-gray-400 text-center">
                  We'll get back to you within 24 hours during business days.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
