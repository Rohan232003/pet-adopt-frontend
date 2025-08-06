'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload } from 'lucide-react';

interface Species {
  id: number;
  name: string;
}

interface Breed {
  id: number;
  name: string;
  speciesId: number;
}

interface Shelter {
  id: number;
  name: string;
}

export default function AddPetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    speciesId: '',
    breedId: '',
    shelterId: '',
    age: '',
    gender: 'Male',
    size: 'Medium',
    color: '',
    description: '',
    status: 'AVAILABLE',
    isNeutered: false,
    isVaccinated: false,
    imageUrl: '',
  });

  useEffect(() => {
    fetchInitialData();
    if (user?.role === 'STAFF' && user.shelterId) {
      handleInputChange('shelterId', user.shelterId.toString());
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      // Fetch species, breeds, and shelters
      const [speciesRes, breedsRes, sheltersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/species`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/breeds`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/shelters`),
      ]);

      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        setSpecies(speciesData.species || []);
      }

      if (breedsRes.ok) {
        const breedsData = await breedsRes.json();
        setBreeds(breedsData || []);
      }

      if (sheltersRes.ok) {
        const sheltersData = await sheltersRes.json();
        setShelters(sheltersData.shelters || []);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };
// Add this helper function inside your AddPetPage component
const handleImageUpload = async (file: File) => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    handleInputChange('imageUrl', data.url);
  } catch (err) {
    alert('Image upload failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          speciesId: parseInt(formData.speciesId),
          breedId: parseInt(formData.breedId),
          shelterId: parseInt(formData.shelterId),
          age: parseInt(formData.age),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add pet');
      }

      router.push('/staff/pets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  const filteredBreeds = breeds.filter(breed => 
    !formData.speciesId || breed.speciesId === parseInt(formData.speciesId)
  );

  return (
    <ProtectedRoute requiredRole="STAFF">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/staff/pets')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Pet
                </h1>
                <p className="text-gray-600">Add a new pet to your shelter</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Pet Information</CardTitle>
                <CardDescription>
                  Fill in the details for the new pet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pet Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter pet name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age (years) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter age"
                      />
                    </div>
                  </div>

                  {/* Species and Breed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Species *
                      </label>
                      <select
                        value={formData.speciesId}
                        onChange={(e) => {
                          handleInputChange('speciesId', e.target.value);
                          handleInputChange('breedId', ''); // Reset breed when species changes
                        }}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select species</option>
                        {species.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Breed *
                      </label>
                      <select
                        value={formData.breedId}
                        onChange={(e) => handleInputChange('breedId', e.target.value)}
                        required
                        disabled={!formData.speciesId}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select breed</option>
                        {filteredBreeds.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Physical Characteristics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size *
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color *
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Golden, Black, White"
                      />
                    </div>
                  </div>

                  {/* Shelter and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shelter *
                      </label>
                      <select
                        value={formData.shelterId}
                        onChange={(e) => handleInputChange('shelterId', e.target.value)}
                        required
                        disabled={user?.role === 'STAFF'}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        {user?.role === 'STAFF' && user.shelterName ? (
                          <option value={user.shelterId}>{user.shelterName}</option>
                        ) : (
                          <>
                            <option value="">Select shelter</option>
                            {shelters.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="HOLD">Hold</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isNeutered"
                        checked={formData.isNeutered}
                        onChange={(e) => handleInputChange('isNeutered', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isNeutered" className="text-sm font-medium text-gray-700">
                        Neutered/Spayed
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isVaccinated"
                        checked={formData.isVaccinated}
                        onChange={(e) => handleInputChange('isVaccinated', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isVaccinated" className="text-sm font-medium text-gray-700">
                        Vaccinated
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe the pet's personality, behavior, and any special needs..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Image
                    </label>
                    <div className="space-y-4">
                      {/* Image URL Input */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Image URL (or upload below)
                        </label>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/pet-image.jpg"
                        />
                      </div>
                      
                      {/* File Upload */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Or upload an image file
                        </label>
                        <div className="flex items-center space-x-2">
                         <input
  type="file"
  id="imageUpload"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB. Please choose a smaller image.');
        return;
      }
      handleImageUpload(file); // <-- Use the new function
    }
  }}
  className="hidden"
/>
                           <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('imageUpload')?.click()}
                            className="px-4"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-gray-500">
                            JPG, PNG, GIF up to 5MB
                          </span> 
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      {formData.imageUrl && (
                        <div className="mt-4">
                          <label className="block text-sm text-gray-600 mb-2">
                            Image Preview
                          </label>
                          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                            <img
                              src={formData.imageUrl}
                              alt="Pet preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCAzMkM3My42NzE2IDMyIDgxLjMzMzMgMzkuNjYxNyA4MS4zMzMzIDQ5LjMzMzNDODEuMzMzMyA1OS4wMDUgNzMuNjcxNiA2Ni42NjY3IDY0IDY2LjY2NjdDNTQuMzI4NCA2Ni42NjY3IDQ2LjY2NjcgNTkuMDA1IDQ2LjY2NjcgNDkuMzMzM0M0Ni42NjY3IDM5LjY2MTcgNTQuMzI4NCAzMiA2NCAzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTY0IDc2QzQ0LjExNzcgNzYgMjggODguMjM1MyAyOCAxMDRIMTAwQzEwMCA4OC4yMzUzIDgzLjg4MjMgNzYgNjQgNzZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleInputChange('imageUrl', '')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/staff/pets')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="h-4 w-4 mr-2" />
                          Add Pet
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
