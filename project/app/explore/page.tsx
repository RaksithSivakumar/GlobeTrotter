'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Trip, Profile } from '@/lib/types';
import { getTempTrips, saveTempTrip } from '@/lib/tempStorage';
import { Search, MapPin, Calendar, DollarSign, Copy, Eye, Plane } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface TripWithAuthor extends Trip {
  author?: Profile;
}

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<TripWithAuthor[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripWithAuthor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripWithAuthor | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateStartDate, setDuplicateStartDate] = useState('');
  const [duplicateEndDate, setDuplicateEndDate] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const fetchPublicTrips = async () => {
    try {
      // Fetch from Supabase
      const { data: supabaseTrips } = await supabase
        .from('trips')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      // Fetch from temp storage
      const tempTrips = getTempTrips().filter(t => t.is_public);

      // Combine and fetch author profiles
      const allTrips: TripWithAuthor[] = [];
      
      if (supabaseTrips) {
        for (const trip of supabaseTrips) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', trip.user_id)
            .maybeSingle();
          allTrips.push({ ...trip, author: profile || undefined });
        }
      }

      for (const trip of tempTrips) {
        // Try to get author from localStorage
        try {
          const storedProfile = localStorage.getItem('globetrotter_profile');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            if (profile.id === trip.user_id) {
              allTrips.push({ ...trip, author: profile });
            } else {
              allTrips.push(trip);
            }
          } else {
            allTrips.push(trip);
          }
        } catch {
          allTrips.push(trip);
        }
      }

      // If no trips found, use mock data
      if (allTrips.length === 0) {
        const mockTrips: TripWithAuthor[] = [
          {
            id: 'mock-2',
            user_id: 'temp-user',
            name: 'Tokyo & Kyoto Discovery',
            description: 'Immersing in Japanese culture and cuisine',
            start_date: '2024-08-01T00:00:00Z',
            end_date: '2024-08-14T00:00:00Z',
            cover_photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
            is_public: true,
            total_budget: 3500,
            city: 'Tokyo',
            country: 'Japan',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author: { id: 'user1', email: 'user@example.com', full_name: 'Traveler', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          },
          {
            id: 'mock-3',
            user_id: 'temp-user',
            name: 'Bali Beach Paradise',
            description: 'Relaxing on beautiful beaches and exploring tropical islands',
            start_date: '2024-09-10T00:00:00Z',
            end_date: '2024-09-24T00:00:00Z',
            cover_photo_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
            is_public: true,
            total_budget: 2500,
            city: 'Bali',
            country: 'Indonesia',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author: { id: 'user2', email: 'user2@example.com', full_name: 'Adventurer', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          },
          {
            id: 'mock-4',
            user_id: 'temp-user',
            name: 'European Grand Tour',
            description: 'Exploring Paris, Rome, and Barcelona in one amazing journey',
            start_date: '2024-07-01T00:00:00Z',
            end_date: '2024-07-20T00:00:00Z',
            cover_photo_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
            is_public: true,
            total_budget: 6000,
            city: 'Paris',
            country: 'France',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author: { id: 'user3', email: 'user3@example.com', full_name: 'Explorer', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          },
        ];
        setTrips(mockTrips);
        setFilteredTrips(mockTrips);
      } else {
        setTrips(allTrips);
        setFilteredTrips(allTrips);
      }
    } catch (error) {
      console.error('Error fetching public trips:', error);
      // Use mock data on error
      const mockTrips: TripWithAuthor[] = [
        {
          id: 'mock-2',
          user_id: 'temp-user',
          name: 'Tokyo & Kyoto Discovery',
          description: 'Immersing in Japanese culture and cuisine',
          start_date: '2024-08-01T00:00:00Z',
          end_date: '2024-08-14T00:00:00Z',
          cover_photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
          is_public: true,
          total_budget: 3500,
          city: 'Tokyo',
          country: 'Japan',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: { id: 'user1', email: 'user@example.com', full_name: 'Traveler', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        },
        {
          id: 'mock-3',
          user_id: 'temp-user',
          name: 'Bali Beach Paradise',
          description: 'Relaxing on beautiful beaches and exploring tropical islands',
          start_date: '2024-09-10T00:00:00Z',
          end_date: '2024-09-24T00:00:00Z',
          cover_photo_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
          is_public: true,
          total_budget: 2500,
          city: 'Bali',
          country: 'Indonesia',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: { id: 'user2', email: 'user2@example.com', full_name: 'Adventurer', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        },
      ];
      setTrips(mockTrips);
      setFilteredTrips(mockTrips);
    } finally {
      setLoadingData(false);
    }
  };

  const filterTrips = () => {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(
        trip =>
          trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter !== 'all') {
      filtered = filtered.filter(trip => trip.city?.toLowerCase() === cityFilter.toLowerCase());
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter(trip => trip.country?.toLowerCase() === countryFilter.toLowerCase());
    }

    setFilteredTrips(filtered);
  };

  useEffect(() => {
    if (user) {
      fetchPublicTrips();
    } else if (!loading) {
      // Load mock data even if not logged in for explore page
      const mockTrips: TripWithAuthor[] = [
        {
          id: 'mock-2',
          user_id: 'temp-user',
          name: 'Tokyo & Kyoto Discovery',
          description: 'Immersing in Japanese culture and cuisine',
          start_date: '2024-08-01T00:00:00Z',
          end_date: '2024-08-14T00:00:00Z',
          cover_photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
          is_public: true,
          total_budget: 3500,
          city: 'Tokyo',
          country: 'Japan',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: { id: 'user1', email: 'user@example.com', full_name: 'Traveler', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        },
        {
          id: 'mock-3',
          user_id: 'temp-user',
          name: 'Bali Beach Paradise',
          description: 'Relaxing on beautiful beaches and exploring tropical islands',
          start_date: '2024-09-10T00:00:00Z',
          end_date: '2024-09-24T00:00:00Z',
          cover_photo_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
          is_public: true,
          total_budget: 2500,
          city: 'Bali',
          country: 'Indonesia',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: { id: 'user2', email: 'user2@example.com', full_name: 'Adventurer', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        },
        {
          id: 'mock-4',
          user_id: 'temp-user',
          name: 'European Grand Tour',
          description: 'Exploring Paris, Rome, and Barcelona in one amazing journey',
          start_date: '2024-07-01T00:00:00Z',
          end_date: '2024-07-20T00:00:00Z',
          cover_photo_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
          is_public: true,
          total_budget: 6000,
          city: 'Paris',
          country: 'France',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: { id: 'user3', email: 'user3@example.com', full_name: 'Explorer', avatar_url: null, language: 'en', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        },
      ];
      setTrips(mockTrips);
      setFilteredTrips(mockTrips);
      setLoadingData(false);
    }
  }, [user, loading]);

  useEffect(() => {
    filterTrips();
  }, [searchTerm, cityFilter, countryFilter, trips]);

  const cities = Array.from(new Set(trips.map(t => t.city).filter(Boolean) as string[]));
  const countries = Array.from(new Set(trips.map(t => t.country).filter(Boolean) as string[]));

  const handleDuplicateTrip = () => {
    if (!selectedTrip || !user) return;
    
    if (!duplicateStartDate || !duplicateEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(duplicateEndDate) < new Date(duplicateStartDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const newTripId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duplicatedTrip: Trip = {
      ...selectedTrip,
      id: newTripId,
      user_id: user.id,
      start_date: duplicateStartDate,
      end_date: duplicateEndDate,
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveTempTrip(duplicatedTrip);
    toast.success('Trip duplicated and added to My Trips!');
    setShowDuplicateDialog(false);
    setSelectedTrip(null);
    setDuplicateStartDate('');
    setDuplicateEndDate('');
    router.push('/trips');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Public Trips</h1>
          <p className="text-gray-600">Discover trips shared by travelers and plan your own adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search trips, cities, or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-2xl transition-all group">
                <div className="relative h-48">
                  <img
                    src={trip.cover_photo_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Public
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-2xl mb-1">{trip.name}</h3>
                    {trip.city && trip.country && (
                      <p className="text-white/90 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trip.city}, {trip.country}
                      </p>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {trip.description || 'Explore this amazing trip'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}</span>
                    </div>
                    {trip.total_budget > 0 && (
                      <div className="flex items-center text-orange-600 font-semibold text-sm">
                        <DollarSign className="w-4 h-4" />
                        <span>${trip.total_budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {trip.author && (
                    <p className="text-xs text-gray-500 mb-4">By {trip.author.full_name || 'Anonymous'}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/public/trips/${trip.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Itinerary
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setSelectedTrip(trip);
                        setShowDuplicateDialog(true);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTrips.length === 0 && !loadingData && (
          <Card className="text-center py-16">
            <CardContent>
              <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No public trips found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Duplicate Trip Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate This Trip</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedTrip?.name}" with your own dates. The trip will be added to your My Trips.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={duplicateStartDate}
                onChange={(e) => setDuplicateStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={duplicateEndDate}
                onChange={(e) => setDuplicateEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateTrip} className="bg-blue-600 hover:bg-blue-700">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
