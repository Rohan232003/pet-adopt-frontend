'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, Species } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

export default function ManageSpeciesPage() {
  const router = useRouter();
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breedError, setBreedError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [breedFormData, setBreedFormData] = useState({
    name: '',
    speciesId: '',
  });

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      const response = await api.getSpecies();
      setSpecies(response.species);
    } catch (err) {
      setError('Failed to load species.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createSpecies({
        ...formData,
      });
      setFormData({ name: '', description: '' });
      fetchSpecies(); // Refresh the list
    } catch (err) {
      setError('Failed to create species. Please try again.');
    }
  };

  const handleBreedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBreedFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBreedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreedError(null);
    try {
      await api.createBreed({
        name: breedFormData.name,
        speciesId: parseInt(breedFormData.speciesId, 10),
      });
      setBreedFormData({ name: '', speciesId: '' });
      // Optionally, you might want to refresh something here, like a list of breeds
    } catch (err) {
      setBreedError('Failed to create breed. Please try again.');
    }
  };

  const handleDelete = async (speciesId: number) => {
    if (!window.confirm('Are you sure you want to delete this species? This action cannot be undone.')) {
      return;
    }

    setError(null);
    try {
      await api.deleteSpecies(speciesId);
      fetchSpecies(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete species. It may have associated breeds.');
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mt-4">Manage Species</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add New Species</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Species
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Add New Breed</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBreedSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="speciesId" className="block text-sm font-medium text-gray-700">Species</label>
                    <select name="speciesId" id="speciesId" value={breedFormData.speciesId} onChange={handleBreedInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">Select a species</option>
                      {species.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="breedName" className="block text-sm font-medium text-gray-700">Breed Name</label>
                    <input type="text" name="name" id="breedName" value={breedFormData.name} onChange={handleBreedInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  {breedError && <p className="text-red-500 text-sm">{breedError}</p>}
                  <Button type="submit" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Breed
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Species</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {species.map(s => (
                      <li key={s.id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-sm text-gray-600">{s.description}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
