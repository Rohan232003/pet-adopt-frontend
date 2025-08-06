'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Shield, Copy, RefreshCw, ArrowLeft, Users, UserCheck } from 'lucide-react';

export default function AdminInvitationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInvitationCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/admin/invite`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invitation code');
      }

      const data = await response.json();
      setInvitationCode(data.invitationCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invitation code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (invitationCode) {
      try {
        await navigator.clipboard.writeText(invitationCode);
        alert('Invitation code copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Invitation Management
                  </h1>
                  <p className="text-gray-600">Generate invitation codes for staff and admin accounts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Admin Panel</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generate Invitation Code */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                  Generate Invitation Code
                </CardTitle>
                <CardDescription>
                  Create a new invitation code for staff or admin registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Security Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Invitation codes are required for STAFF and ADMIN registration</p>
                      <p>• Codes are single-use and expire after 24 hours</p>
                      <p>• Only administrators can generate invitation codes</p>
                      <p>• Keep invitation codes secure and share them privately</p>
                    </div>
                  </div>

                  <Button
                    onClick={generateInvitationCode}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate New Code
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Display Generated Code */}
            {invitationCode && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                    Generated Invitation Code
                  </CardTitle>
                  <CardDescription>
                    Share this code with the person you want to invite
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono text-gray-800 break-all">
                        {invitationCode}
                      </code>
                      <Button
                        onClick={copyToClipboard}
                        size="sm"
                        variant="outline"
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• This code expires in 24 hours</li>
                      <li>• Share it securely with the intended recipient</li>
                      <li>• The recipient will need this code during registration</li>
                      <li>• Each code can only be used once</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Security Guidelines */}
          <Card className="border-0 shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Security Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">For Administrators:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Only generate codes for trusted individuals</li>
                    <li>• Verify the identity of the person requesting access</li>
                    <li>• Use secure communication channels to share codes</li>
                    <li>• Monitor user registrations regularly</li>
                    <li>• Revoke access immediately if needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">For Staff/Admin Users:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Keep your invitation code confidential</li>
                    <li>• Use a strong, unique password</li>
                    <li>• Enable two-factor authentication if available</li>
                    <li>• Report any suspicious activity immediately</li>
                    <li>• Log out when not using the system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
} 