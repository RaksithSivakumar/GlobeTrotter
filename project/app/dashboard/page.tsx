'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Trip, City } from '@/lib/types';
import { Plus, Map, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [tripsData, citiesData] = await Promise.all([
      supabase
        .from('trips')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_date', { ascending: false })
        .limit(3),
      supabase
        .from('cities')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(6)
    ]);

    if (tripsData.data) setTrips(tripsData.data);
    if (citiesData.data) setPopularCities(citiesData.data);
    setLoadingData(false);
  };

  if (loading || !user) {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'Traveler'}!
          </h1>
          <p className="text-gray-600">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/calendar-view">
            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Calendar View</h3>
                    <p className="text-sm text-gray-600">View your trips and activities on a calendar</p>
                  </div>
                  <div className="bg-emerald-500 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/community">
            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Community</h3>
                    <p className="text-sm text-gray-600">Connect with fellow travelers</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Map className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips.length}</div>
              <p className="text-xs text-muted-foreground">Planned adventures</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${trips.reduce((sum, trip) => sum + Number(trip.total_budget || 0), 0).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all trips</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Trip</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trips.length > 0 && trips[0].start_date
                  ? `${differenceInDays(parseISO(trips[0].start_date), new Date())} days`
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Until departure</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Trips</h2>
              <Link href="/trips">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>

            {loadingData ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
                  <p className="text-gray-600 mb-4">Start planning your first adventure!</p>
                  <Link href="/trips/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Trip
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trips.map(trip => (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/trips/${trip.id}`)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{trip.name}</CardTitle>
                          <CardDescription>
                            {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-orange-600">
                            ${Number(trip.total_budget || 0).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">Budget</div>
                        </div>
                      </div>
                    </CardHeader>
                    {trip.description && (
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Popular Destinations</h2>
              <Link href="/explore">
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Explore More
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {popularCities.map(city => (
                <Card key={city.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative h-32">
                    <img
                      src={city.image_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-semibold">{city.name}</h3>
                      <p className="text-white/80 text-xs">{city.country}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-orange-500 to-cyan-600 text-white">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Ready for a new adventure?</h3>
                <p className="text-white/90">Create your next trip and discover amazing destinations</p>
              </div>
              <Link href="/trips/create">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                  <Plus className="w-5 h-5 mr-2" />
                  Plan New Trip
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
