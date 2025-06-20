// app/about/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Shield } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            About TrackyFy
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            About TrackyFy
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing gym management with cutting-edge technology and innovative solutions.
          </p>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="mr-2 h-5 w-5 text-orange-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                To empower fitness businesses with comprehensive management solutions that streamline operations, 
                enhance member experiences, and drive sustainable growth in the fitness industry.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="mr-2 h-5 w-5 text-orange-500" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                To become the leading gym management platform globally, setting new standards for 
                innovation, reliability, and customer satisfaction in fitness technology.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Details */}
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 mb-16">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="mr-2 h-5 w-5 text-orange-500" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Legal Entity</h3>
              <p className="text-gray-300">This website is operated by MD SAMIE SOHRAB</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Registered Address</h3>
              <p className="text-gray-300">
                Arbiya College Road, In front of Middle School, Purnea, Purnia, Purnea, 
                Durga Asthan, Madhopara, Purnea, Bihar, India, 854301
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What We Do</h3>
              <p className="text-gray-300">
                TrackyFy is a comprehensive gym management platform that provides fitness businesses 
                with tools for member management, payment processing, analytics, and automated workflows. 
                Our solution helps gym owners streamline operations and focus on what matters most - 
                helping their members achieve their fitness goals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                500+ Gyms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Trusted by fitness businesses worldwide</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="mr-2 h-5 w-5 text-orange-500" />
                10K+ Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Managing fitness journeys effectively</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="mr-2 h-5 w-5 text-orange-500" />
                98% Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Delivering exceptional results consistently</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
