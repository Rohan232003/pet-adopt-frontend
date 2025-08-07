'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, Pet, Species } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Heart, MapPin, Calendar, Users, Search, FileText, LogIn, User } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<number | null>(null);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, [page, selectedSpecies]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [petsResponse, speciesResponse, sheltersResponse] = await Promise.all([
        api.getPets({ page, limit: 12, speciesId: selectedSpecies || undefined }),
        api.getSpecies(),
        api.getShelters(),
      ]);
      setPets(petsResponse.pets);
      setTotalPages(petsResponse.pagination.totalPages);
      setSpecies(speciesResponse.species);
      setShelters(sheltersResponse.shelters);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await api.getPets({ page: currentPage, limit: 12, speciesId: selectedSpecies || undefined });
      setPets(response.pets);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load pets. Please try again later.');
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PetAdopt
              </h1>
              <p className="text-gray-600 mt-1 text-lg">Find your perfect companion</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search pets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full md:w-80"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedSpecies || ''}
                  onChange={(e) => setSelectedSpecies(e.target.value ? Number(e.target.value) : null)}
                  className="pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full md:w-48"
                >
                  <option value="">All Species</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {user ? (
                <>
                  {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  {user.role === 'ADOPTER' && (
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/applications')}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Applications
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={logout}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Logout
                  </Button>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{user.role}</span>
                </>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
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
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Pets</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {pets.filter(p => p.status === 'AVAILABLE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(!user || user.role === 'ADOPTER' || user.role === 'ADMIN') && (
            <>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recently Adopted</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {pets.filter(p => p.status === 'ADOPTED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Shelters</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{shelters.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>

        {/* Pets Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8 text-center">
            Available Pets
          </h2>
          {filteredPets.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No pets found matching your search.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredPets.map((pet) => (
                  <Card 
                    key={pet.id} 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group hover:scale-105"
                    onClick={() => router.push(`/pets/${pet.id}`)}
                  >
                    <div className="relative overflow-hidden">
                      {pet.imageUrl ? (
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Heart className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getStatusColor(pet.status)}`}>
                          {pet.status}
                        </span>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-800">{pet.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 font-medium">
                        {pet.age} year{pet.age !== 1 ? 's' : ''} old • {pet.gender} • {pet.size}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                        {pet.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(pet.createdAt).toLocaleDateString()}
                        </div>
                        {user?.role !== 'STAFF' && user?.role !== 'ADMIN' && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/adopt/${pet.id}`);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                            disabled={!['AVAILABLE', 'HOLD'].includes(pet.status)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {pet.status === 'AVAILABLE' ? 'Adopt' : pet.status === 'HOLD' ? 'Apply to Adopt' : 'Adopted'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-12 text-gray-600">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md mx-auto">
            <p className="text-lg font-medium">Made with ❤️ for pet adoption</p>
            <p className="text-sm mt-2">Help us find loving homes for every pet</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
