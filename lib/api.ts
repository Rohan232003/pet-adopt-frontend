const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Pet {
  id: number;
  name: string;
  age: number;
  gender: string;
  size: string;
  color: string;
  description: string;
  status: string;
  isNeutered: boolean;
  isVaccinated: boolean;
  imageUrl?: string;
  species: { id: number; name: string };
  breed: { id: number; name: string };
  shelter: Shelter;
  createdAt: string;
  updatedAt: string;
}

export interface PetsResponse {
  pets: Pet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PetResponse {
  pet: Pet;
}

export interface Shelter {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  capacity?: number;
  createdAt: string;
}

export interface SheltersResponse {
  shelters: Shelter[];
}

export interface Species {
  id: number;
  name: string;
  description?: string;
}

export interface SpeciesResponse {
  species: Species[];
}

export interface Breed {
  id: number;
  name: string;
  speciesId: number;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || response.statusText);
  }

  return response.json();
}

export const api = {
  // Pets
  getPets: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return fetchApi<PetsResponse>(`/pets${query ? `?${query}` : ''}`, { credentials: 'include' });
  },

  getPet: (id: number) => {
    return fetchApi<PetResponse>(`/pets/${id}`);
  },

  createPet: (data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<{ message: string; pet: Partial<Pet> }>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePet: (id: number, data: Partial<Pet>) => {
    return fetchApi<{ message: string; pet: Partial<Pet> }>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePet: (id: number) => {
    return fetchApi<{ message: string }>(`/pets/${id}`, {
      method: 'DELETE',
    });
  },

  // Shelters
  getShelters: () => {
    return fetchApi<SheltersResponse>('/shelters');
  },

  getShelter: (id: number) => {
    return fetchApi<{ shelter: Shelter }>(`/shelters/${id}`);
  },

  createShelter: (data: Omit<Shelter, 'id' | 'createdAt'>) => {
    return fetchApi<{ message: string; shelter: Shelter }>('/shelters', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  updateShelter: (id: number, data: Partial<Omit<Shelter, 'id' | 'createdAt'>>) => {
    return fetchApi<{ message: string; shelter: Shelter }>(`/shelters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  // Species
  getSpecies: () => {
    return fetchApi<SpeciesResponse>('/species');
  },

  createSpecies: (data: Omit<Species, 'id'>) => {
    return fetchApi<{ message: string; species: Species }>('/species', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  deleteSpecies: (id: number) => {
    return fetchApi<{ message: string }>(`/species/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  // Breeds
  createBreed: (data: { name: string; speciesId: number }) => {
    return fetchApi<{ message: string; breed: Breed }>('/api/breeds', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  // Applications
  createApplication: (data: { petId: number; reason: string; experience: string; livingSituation: string; otherPets: string; }) => {
    return fetchApi('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  getApplications: (params?: { limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    return fetchApi<{ applications: any[] }>(`/applications${query ? `?${query}` : ''}`, { credentials: 'include' });
  },

  getApplication: (id: number) => {
    return fetchApi<{ application: any }>(`/applications/${id}`, { credentials: 'include' });
  },

  getApplicationNotes: (id: number) => {
    return fetchApi<{ notes: any[] }>(`/applications/${id}/notes`, { credentials: 'include' });
  },

  approveApplication: (id: number) => {
    return fetchApi<{ message: string }>(`/applications/${id}/approve`, {
      method: 'PUT',
      credentials: 'include',
    });
  },

  // Health check
  healthCheck: () => {
    return fetchApi<{ ok: boolean }>('/healthz');
  },

  // Analytics
  getDailyAdoptionStats: () => {
    return fetchApi<{ stats: any[] }>('/analytics/daily-adoptions', {
      credentials: 'include',
    });
  },

  getSystemOverview: () => {
    return fetchApi<{ totalUsers: number; totalPets: number; totalApplications: number; }>('/analytics/overview', {
      credentials: 'include',
    });
  },
};
