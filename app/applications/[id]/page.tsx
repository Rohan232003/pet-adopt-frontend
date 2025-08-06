'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Heart, ArrowLeft, Calendar, User, FileText, MessageSquare } from 'lucide-react';

interface Application {
  id: number;
  status: string;
  reason: string;
  experience?: string;
  livingSituation?: string;
  otherPets?: string;
  createdAt: string;
  updatedAt: string;
  pet: {
    id: number;
    name: string;
    imageUrl?: string;
    age: number;
    gender: string;
    size: string;
  };
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchApplication(Number(params.id));
    }
  }, [params.id]);

  const fetchApplication = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.getApplication(id);
      setApplication(response.application);
    } catch (err) {
      setError('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The application you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/applications')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/applications')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Application #{application.id}
              </h1>
              <p className="text-gray-600 text-lg">Adoption application for {application.pet.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pet Information */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  About {application.pet.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    {application.pet.age} year{application.pet.age !== 1 ? 's' : ''} old • {application.pet.gender} • {application.pet.size}
                  </span>
                </div>
                <Button 
                  onClick={() => router.push(`/pets/${application.pet.id}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  View Pet Details
                </Button>
              </CardContent>
            </Card>

            {/* Pet Image */}
            <Card className="overflow-hidden border-0 shadow-xl">
              {application.pet.imageUrl ? (
                <img
                  src={application.pet.imageUrl}
                  alt={application.pet.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </Card>
          </div>

          {/* Application Details */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Application Status
                  </CardTitle>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full shadow-lg ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>
                <CardDescription className="text-lg">
                  Submitted on {new Date(application.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Why do you want to adopt {application.pet.name}?</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {application.reason}
                  </p>
                </div>

                {application.experience && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Experience with pets</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {application.experience}
                    </p>
                  </div>
                )}

                {application.livingSituation && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Living situation</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {application.livingSituation}
                    </p>
                  </div>
                )}

                {application.otherPets && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Other pets</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {application.otherPets}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last updated: {new Date(application.updatedAt).toLocaleDateString()}
                  </div>
                  <Button 
                    variant="outline"
                    className="flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Shelter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
