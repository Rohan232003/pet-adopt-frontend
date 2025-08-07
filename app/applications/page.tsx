'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Heart, ArrowLeft, Search, Calendar, User, FileText } from 'lucide-react';

interface Application {
  id: number;
  status: string;
  reason: string;
  experience?: string;
  livingSituation?: string;
  otherPets?: string;
  createdAt: string;
  pet: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user, loading: authLoading } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (user && !authLoading) {
      fetchApplications();
    }
  }, [user, authLoading]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.getApplications();
      // The API returns an object with an 'applications' property, which is an array.
      // Each item in the array is an object with 'applications' and 'pets' properties.
      const transformedApplications = response.applications.map((item: any) => {
        return {
          ...item.applications, // Spread the application properties
          pet: item.pets,       // Assign the pet object
        };
      });
      setApplications(transformedApplications || []);
      setError(null);
    } catch (err) {
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'WITHDRAWN':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Applications
                </h1>
                <p className="text-gray-600 text-lg">Track your adoption applications</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full md:w-80"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {applications.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {applications.filter(a => a.status === 'UNDER_REVIEW').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {applications.filter(a => a.status === 'APPROVED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8 text-center">
            Your Applications
          </h2>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No applications found.</p>
                <Button 
                  onClick={() => router.push('/adopt')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Browse Pets
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Pet Info */}
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {application.pet.imageUrl ? (
                            <img
                              src={application.pet.imageUrl}
                              alt={application.pet.name}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                              <Heart className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{application.pet.name}</h3>
                          <p className="text-sm text-gray-600">Application #{application.id}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-center">
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full shadow-lg ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/applications/${application.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        <strong>Reason for adoption:</strong> {application.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-12 text-gray-600">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md mx-auto">
            <p className="text-lg font-medium">Need help with your application?</p>
            <p className="text-sm mt-2">Contact us for support</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
