'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, Pet } from '@/lib/api';
import { Heart, ArrowLeft, User, Mail, Phone, Home, FileText } from 'lucide-react';

interface AdoptionForm {
  reason: string;
  experience: string;
  livingSituation: string;
  otherPets: string;
}

export default function AdoptionPage() {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdoptionForm>({
    reason: '',
    experience: '',
    livingSituation: '',
    otherPets: '',
  });

  useEffect(() => {
    if (params.petId) {
      fetchPet(Number(params.petId));
    }
  }, [params.petId]);

  const fetchPet = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.getPet(id);
      console.log("Fetched pet:", response.pet);
      setPet(response.pet);
      setError(null);
    } catch (err) {
      setError('Failed to load pet details. Please try again later.');
      console.error('Error fetching pet:', err);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet || !user) return;

    console.log("Submitting application for pet ID:", pet.id);

    try {
      setSubmitting(true);
      await api.createApplication({
        petId: pet.id,
        ...formData,
      });

      alert('Adoption application submitted successfully! We will contact you soon.');
      router.push('/');
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AdoptionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pet Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The pet you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADOPTER">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Adopt {pet.name}
              </h1>
              <p className="text-gray-600 text-lg">Complete your adoption application</p>
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
                  About {pet.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    {pet.age} year{pet.age !== 1 ? 's' : ''} old • {pet.gender} • {pet.size} • {pet.species.name} • {pet.breed.name} • {pet.shelter.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">{pet.color} • {pet.size} size</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">
                    {pet.isVaccinated ? 'Vaccinated' : 'Not vaccinated'} • {pet.isNeutered ? 'Neutered' : 'Not neutered'}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{pet.description}</p>
              </CardContent>
            </Card>

            {/* Pet Image */}
            <Card className="overflow-hidden border-0 shadow-xl">
              {pet.imageUrl ? (
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
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

          {/* Adoption Form */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Adoption Application
                </CardTitle>
                <CardDescription className="text-lg">
                  Tell us about yourself and why you'd like to adopt {pet.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to adopt {pet.name}? *
                    </label>
                    <textarea
                      required
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Tell us about your motivation for adoption..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you have experience with pets?
                    </label>
                    <textarea
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Share your experience with pets..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your living situation
                    </label>
                    <textarea
                      value={formData.livingSituation}
                      onChange={(e) => handleInputChange('livingSituation', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="House, apartment, yard, etc..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you have other pets?
                    </label>
                    <textarea
                      value={formData.otherPets}
                      onChange={(e) => handleInputChange('otherPets', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Tell us about your other pets..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !['AVAILABLE', 'HOLD'].includes(pet.status)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          {pet.status === 'AVAILABLE' ? 'Submit Application' : 'Apply to Adopt'}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
