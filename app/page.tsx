import Link from 'next/link';
import { Vote, Shield, Users, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-600 rounded-full">
              <Vote className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Voting System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, secure, and transparent online voting platform with enterprise-grade security 
            and real-time results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary px-8 py-3 text-lg">
              Login to Vote
            </Link>
            <Link href="/register" className="btn-secondary px-8 py-3 text-lg">
              Register Now
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Bank-Level Security</h3>
            <p className="text-gray-600">
              AES-256 encryption, secure JWT authentication, and comprehensive audit trails 
              ensure your vote remains private and secure.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Users className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
            <p className="text-gray-600">
              Separate interfaces for voters and administrators with granular permissions 
              and secure access controls.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <BarChart3 className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-Time Results</h3>
            <p className="text-gray-600">
              Live vote tallying with instant result updates and comprehensive 
              analytics for election administrators.
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Security Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">End-to-End Encryption</h4>
                  <p className="text-sm text-gray-600">All votes are encrypted using AES-256-CBC before storage</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Duplicate Vote Prevention</h4>
                  <p className="text-sm text-gray-600">Database-level constraints prevent multiple votes per user</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Secure Authentication</h4>
                  <p className="text-sm text-gray-600">JWT tokens with HTTP-only cookies and bcrypt password hashing</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Input Validation</h4>
                  <p className="text-sm text-gray-600">Comprehensive Zod validation on all API endpoints</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Audit Trail</h4>
                  <p className="text-sm text-gray-600">Complete logging of all voting activities and admin actions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Route Protection</h4>
                  <p className="text-sm text-gray-600">Middleware-based authentication and authorization</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p>&copy; 2026 Secure Voting System. Built with Next.js 14 and enterprise security.</p>
        </div>
      </div>
    </div>
  );
}