'use client';

import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Heart, User, Shield, Users, FileText, Settings, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface OverviewStats {
  totalUsers: number;
  totalPets: number;
  totalApplications: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchOverviewStats = async () => {
        try {
          setLoadingStats(true);
          const stats = await api.getSystemOverview();
          setOverviewStats(stats);
        } catch (error) {
          console.error("Failed to fetch overview stats", error);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchOverviewStats();
    }
  }, [user]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADOPTER':
        return <User className="h-6 w-6" />;
      case 'STAFF':
        return <Users className="h-6 w-6" />;
      case 'ADMIN':
        return <Shield className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADOPTER':
        return 'text-blue-600 bg-blue-100';
      case 'STAFF':
        return 'text-green-600 bg-green-100';
      case 'ADMIN':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'ADOPTER':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  My Applications
                </CardTitle>
                <CardDescription>View and track your adoption applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-4"></p>
                <Button 
                  onClick={() => router.push('/applications')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  View Applications
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-green-600" />
                  Browse Pets
                </CardTitle>
                <CardDescription>Find your perfect companion</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-4"></p>
                <Button 
                  onClick={() => router.push('/adopt')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Browse Pets
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'STAFF':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Manage Pets
                </CardTitle>
                <CardDescription>Add, edit, and manage pets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-4"></p>
                <Button 
                  onClick={() => router.push('/staff/pets')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Manage Pets
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Review Applications
                </CardTitle>
                <CardDescription>Review and process adoption applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-4"></p>
                <Button 
                  onClick={() => router.push('/staff/applications')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Review Applications
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'ADMIN':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  System Overview
                </CardTitle>
                <CardDescription>View system-wide statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <p>Loading stats...</p>
                ) : overviewStats ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Total Users: <span className="font-semibold">{overviewStats.totalUsers}</span></p>
                    <p className="text-sm text-gray-600">Total Pets: <span className="font-semibold">{overviewStats.totalPets}</span></p>
                    <p className="text-sm text-gray-600">Total Applications: <span className="font-semibold">{overviewStats.totalApplications}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Could not load stats.</p>
                )}
                <Button 
                  onClick={() => router.push('/admin/analytics')}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  View Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-600" />
                  Manage Shelters
                </CardTitle>
                <CardDescription>Add or edit shelter information</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/admin/shelters')}
                  className="w-full bg-gradient-to-r mt-24 from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  Manage Shelters
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
           
           <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-teal-600" />
                  Manage Species
                </CardTitle>
                <CardDescription>Add or edit species and breeds</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/admin/species')}
                  className="w-full bg-gradient-to-r mt-24 from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                >
                  Manage Species
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Manage system configuration</p>
                 <Button 
                   onClick={() => router.push('/admin/invitations')}
                   className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                 >
                   Manage Invitations
                   <ArrowRight className="h-4 w-4 ml-2" />
                 </Button>
                
              </CardContent>
            </Card>

          

            
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
                {user?.role === 'STAFF' && user.shelterName && (
                  <p className="text-gray-600">Shelter: {user.shelterName}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                  <div className="flex items-center">
                    {getRoleIcon(user?.role || '')}
                    <span className="ml-1">{user?.role}</span>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Access your most important features</p>
          </div>

          {getDashboardContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
}
