'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Trip, Stop, Activity, Profile } from '@/lib/types';
import { saveTempTrip } from '@/lib/tempStorage';
import { Plane, Calendar, MapPin, DollarSign, Clock, Copy, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PublicTripPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<(Stop & { activities: Activity[] })[]>([]);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateStartDate, setDuplicateStartDate] = useState('');
  const [duplicateEndDate, setDuplicateEndDate] = useState('');

  useEffect(() => {
    if (tripId) {
      fetchTripData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchTripData = async () => {
    // Try Supabase first
    const { data: tripData } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('is_public', true)
      .maybeSingle();

    let foundTrip = tripData;

    // If not found in Supabase, check temp storage
    if (!foundTrip) {
      const { getTempTrip } = await import('@/lib/tempStorage');
      const tempTrip = getTempTrip(tripId);
      if (tempTrip && tempTrip.is_public) {
        foundTrip = tempTrip;
      }
    }

    if (!foundTrip) {
      setLoading(false);
      return;
    }

    setTrip(foundTrip);

    // Try to get author from Supabase
    const { data: authorData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', foundTrip.user_id)
      .maybeSingle();

    if (authorData) {
      setAuthor(authorData);
    } else {
      // Try to get from localStorage if it's a temp trip
      try {
        const storedProfile = localStorage.getItem('globetrotter_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          if (profile.id === foundTrip.user_id) {
            setAuthor(profile);
          }
        }
      } catch (error) {
        console.error('Error loading author from storage:', error);
      }
    }

    const { data: stopsData } = await supabase
      .from('stops')
      .select('*, city:cities(*)')
      .eq('trip_id', tripId)
      .order('order_index');

    if (stopsData && stopsData.length > 0) {
      const stopsWithActivities = await Promise.all(
        stopsData.map(async (stop) => {
          const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('stop_id', stop.id)
            .order('activity_date, order_index');

          return { ...stop, activities: activities || [] };
        })
      );
      setStops(stopsWithActivities);
    } else {
      // Add mock itinerary data if no stops found
      const mockStops = [
        {
          id: 'mock-stop-1',
          trip_id: foundTrip.id,
          city_id: 'mock-city-1',
          order_index: 0,
          start_date: foundTrip.start_date,
          end_date: foundTrip.end_date,
          notes: null,
          created_at: new Date().toISOString(),
          city: { id: 'mock-city-1', name: foundTrip.city || 'Destination', country: foundTrip.country || 'Country', region: null, cost_index: 3, popularity_score: 85, description: 'Beautiful destination', image_url: foundTrip.cover_photo_url, created_at: new Date().toISOString() },
          activities: [
            {
              id: 'mock-activity-1',
              stop_id: 'mock-stop-1',
              activity_template_id: null,
              name: 'City Tour',
              description: 'Explore the main attractions',
              category: 'sightseeing',
              cost: 50,
              duration_hours: 3,
              activity_date: foundTrip.start_date,
              activity_time: '10:00',
              order_index: 0,
              created_at: new Date().toISOString(),
            },
            {
              id: 'mock-activity-2',
              stop_id: 'mock-stop-1',
              activity_template_id: null,
              name: 'Local Cuisine Experience',
              description: 'Try authentic local dishes',
              category: 'food',
              cost: 75,
              duration_hours: 2,
              activity_date: foundTrip.start_date,
              activity_time: '19:00',
              order_index: 1,
              created_at: new Date().toISOString(),
            },
          ],
        },
      ];
      setStops(mockStops);
    }

    setLoading(false);
  };

  const handleDuplicateTrip = () => {
    if (!trip || !user) {
      toast.error('Please sign in to duplicate trips');
      router.push('/login');
      return;
    }
    
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
      ...trip,
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
    setDuplicateStartDate('');
    setDuplicateEndDate('');
    router.push('/trips');
  };

  const copyTrip = () => {
    if (!user) {
      toast.error('Please sign in to duplicate trips');
      router.push('/login');
      return;
    }
    setShowDuplicateDialog(true);
  };

  const shareTrip = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-6">
              This trip is either private or doesn't exist.
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 bg-clip-text text-transparent">
                GlobalTrotters
              </span>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={shareTrip}>
                Share
              </Button>
              {user && (
                <Button size="sm" onClick={copyTrip} className="bg-gradient-to-r from-orange-500 to-cyan-600">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Trip
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="relative h-80 rounded-xl overflow-hidden mb-8"
          style={{
            backgroundImage: `url(${trip.cover_photo_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-green-500">Public Trip</Badge>
              {author && (
                <span className="text-sm text-white/90">
                  by {author.full_name || 'Anonymous'}
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-4">{trip.name}</h1>
            {trip.description && (
              <p className="text-lg text-white/90 mb-4 max-w-3xl">{trip.description}</p>
            )}
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {stops.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No itinerary available</h3>
                <p className="text-gray-600">This trip doesn't have a detailed itinerary yet.</p>
              </CardContent>
            </Card>
          ) : (
            stops.map((stop, index) => (
              <Card key={stop.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-cyan-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{index + 1}</Badge>
                      <CardTitle className="text-2xl">{stop.city?.name}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stop.city?.country} • {format(parseISO(stop.start_date), 'MMM d')} - {format(parseISO(stop.end_date), 'MMM d')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {stop.activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activities planned</p>
                ) : (
                  <div className="space-y-3">
                    {stop.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="capitalize">
                            {activity.category}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{activity.name}</h4>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {activity.duration_hours}h
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${Number(activity.cost).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8 bg-gradient-to-r from-orange-500 to-cyan-600 text-white">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Love this itinerary?</h3>
              <p className="text-white/90 mb-6">
                Create an account to copy and customize this trip for yourself
              </p>
              <div className="flex gap-4 justify-center">
                {user ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={copyTrip}
                    className="bg-white text-orange-600 hover:bg-gray-100"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Duplicate This Trip
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => router.push('/login')}
                      className="bg-white text-orange-600 hover:bg-gray-100"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Sign In to Duplicate
                    </Button>
                    <Link href="/register">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Sign Up Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Duplicate Trip Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate This Trip</DialogTitle>
            <DialogDescription>
              Create a copy of "{trip?.name}" with your own dates. The trip will be added to your My Trips.
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
