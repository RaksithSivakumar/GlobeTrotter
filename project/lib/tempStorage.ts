import { Trip } from './types';

const STORAGE_KEY = 'globe_trotter_temp_trips';

// Mock trip data
export const mockTrips: Trip[] = [
  {
    id: 'mock-1',
    user_id: 'temp-user',
    name: 'Summer Europe Adventure',
    description: 'Exploring the beautiful cities of Europe during summer',
    start_date: '2024-06-15T00:00:00Z',
    end_date: '2024-07-15T00:00:00Z',
    cover_photo_url: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
    is_public: false,
    total_budget: 5000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    user_id: 'temp-user',
    name: 'Tokyo & Kyoto Discovery',
    description: 'Immersing in Japanese culture and cuisine',
    start_date: '2024-08-01T00:00:00Z',
    end_date: '2024-08-14T00:00:00Z',
    cover_photo_url: 'https://picsum.photos/200',
    is_public: true,
    total_budget: 3500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    user_id: 'temp-user',
    name: 'Bali Beach Paradise',
    description: 'Relaxing on beautiful beaches and exploring tropical islands',
    start_date: '2024-09-10T00:00:00Z',
    end_date: '2024-09-24T00:00:00Z',
    cover_photo_url: 'https://picsum.photos/seed/picsum/200/300',
    is_public: false,
    total_budget: 2500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initialize with mock data if storage is empty
export function initializeTempStorage() {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTrips));
  }
}

// Get all temporary trips
export function getTempTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with mock data if empty
    initializeTempStorage();
    return mockTrips;
  } catch (error) {
    console.error('Error reading temp trips:', error);
    return mockTrips;
  }
}

// Save a trip to temporary storage
export function saveTempTrip(trip: Trip): void {
  if (typeof window === 'undefined') return;
  
  try {
    const trips = getTempTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    
    if (existingIndex >= 0) {
      // Update existing trip
      trips[existingIndex] = { ...trip, updated_at: new Date().toISOString() };
    } else {
      // Add new trip
      trips.push({ ...trip, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Error saving temp trip:', error);
  }
}

// Delete a trip from temporary storage
export function deleteTempTrip(tripId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const trips = getTempTrips();
    const filtered = trips.filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting temp trip:', error);
  }
}

// Get a single trip by ID
export function getTempTrip(tripId: string): Trip | null {
  if (typeof window === 'undefined') return null;
  
  const trips = getTempTrips();
  return trips.find(t => t.id === tripId) || null;
}

// Clear all temporary trips
export function clearTempTrips(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Itinerary Sections Storage
export interface ItinerarySectionData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
}

const ITINERARY_SECTIONS_KEY = 'globe_trotter_itinerary_sections';

// Save itinerary sections for a trip
export function saveItinerarySections(tripId: string, sections: ItinerarySectionData[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allSections = getItinerarySectionsMap();
    allSections[tripId] = sections;
    localStorage.setItem(ITINERARY_SECTIONS_KEY, JSON.stringify(allSections));
  } catch (error) {
    console.error('Error saving itinerary sections:', error);
  }
}

// Get itinerary sections for a trip
export function getItinerarySections(tripId: string): ItinerarySectionData[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const allSections = getItinerarySectionsMap();
    return allSections[tripId] || null;
  } catch (error) {
    console.error('Error reading itinerary sections:', error);
    return null;
  }
}

// Get all itinerary sections map
function getItinerarySectionsMap(): Record<string, ItinerarySectionData[]> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(ITINERARY_SECTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading itinerary sections map:', error);
    return {};
  }
}

// Delete itinerary sections for a trip
export function deleteItinerarySections(tripId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allSections = getItinerarySectionsMap();
    delete allSections[tripId];
    localStorage.setItem(ITINERARY_SECTIONS_KEY, JSON.stringify(allSections));
  } catch (error) {
    console.error('Error deleting itinerary sections:', error);
  }
}

