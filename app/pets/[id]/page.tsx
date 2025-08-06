'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, Pet } from '@/lib/api';
import { fetchLookups } from '@/lib/lookups';
import { Heart, ArrowLeft, MapPin, Calendar, Users, Phone, Mail } from 'lucide-react';

export default function PetDetail() {
  const { user } = useAuth();
  const [lookups, setLookups] = useState<{ speciesMap: Record<number, string>; breedMap: Record<number, string>; shelterMap: Record<number, string> } | null>(null);
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchPet(Number(params.id));
    }
  }, [params.id]);

  const fetchPet = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.getPet(id);
      setPet(response.pet);
      setError(null);
    } catch (err) {
      setError('Failed to load pet details. Please try again later.');
      console.error('Error fetching pet:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADOPTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pet Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The pet you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
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
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pet Details</h1>
              <p className="text-gray-600 text-lg">Learn more about {pet.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pet Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-2xl">
              {pet.imageUrl ? (
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </Card>
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{pet.name}</CardTitle>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full shadow-lg ${getStatusColor(pet.status)}`}>
                    {pet.status}
                  </span>
                </div>
                <CardDescription className="text-lg font-medium text-gray-600">
                  {pet.age} year{pet.age !== 1 ? 's' : ''} old • {pet.gender} • {pet.size}
                  {lookups && pet.species && ` • ${lookups.speciesMap[pet.species.id] || `Species #${pet.species.id}`}`}
                  {lookups && pet.breed && ` • ${lookups.breedMap[pet.breed.id] || `Breed #${pet.breed.id}`}`}
                  {lookups && pet.shelter && ` • ${lookups.shelterMap[pet.shelter.id] || `Shelter #${pet.shelter.id}`}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">{pet.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="font-medium">{pet.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{pet.age} year{pet.age !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Heart className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium">{pet.gender}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Color</p>
                      <p className="font-medium">{pet.color}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pet.status === 'HOLD' && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                      <p className="font-bold">Application Pending</p>
                      <p>This pet has a pending adoption application. You can still apply, and your application will be considered if the current one is not approved.</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutered/Spayed</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${pet.isNeutered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {pet.isNeutered ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vaccinated</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${pet.isVaccinated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {pet.isVaccinated ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {user?.role !== 'STAFF' && user?.role !== 'ADMIN' && (
                  <Button
                    onClick={() => router.push(`/adopt/${pet.id}`)}
                    disabled={pet.status === 'ADOPTED'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-4 shadow-xl disabled:bg-gray-400"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    {pet.status === 'ADOPTED' ? 'Adopted' : `Adopt ${pet.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Shelter Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Shelter Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{pet.shelter.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{pet.shelter.email}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-sm text-gray-600">{pet.shelter.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
