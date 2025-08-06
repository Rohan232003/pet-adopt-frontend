// Utility to fetch and cache species, breed, and shelter lookups

export interface Species { id: number; name: string; }
export interface Breed { id: number; name: string; }
export interface Shelter { id: number; name: string; }

export async function fetchSpecies(): Promise<Species[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/species`);
  const data = await res.json();
  return data.species || [];
}

export async function fetchBreeds(): Promise<Breed[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/breeds`);
  const data = await res.json();
  return data.breeds || [];
}

export async function fetchShelters(): Promise<Shelter[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/shelters`);
  const data = await res.json();
  return data.shelters || [];
}

export async function fetchLookups() {
  const [species, breeds, shelters] = await Promise.all([
    fetchSpecies(),
    fetchBreeds(),
    fetchShelters(),
  ]);
  const speciesMap = Object.fromEntries(species.map(s => [s.id, s.name]));
  const breedMap = Object.fromEntries(breeds.map(b => [b.id, b.name]));
  const shelterMap = Object.fromEntries(shelters.map(s => [s.id, s.name]));
  return { speciesMap, breedMap, shelterMap };
}
