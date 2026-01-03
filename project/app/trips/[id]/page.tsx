'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { Trip, Stop, Activity, Expense } from '@/lib/types';
import { ArrowLeft, Edit, Calendar, MapPin, DollarSign, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function TripDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<(Stop & { activities: Activity[] })[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && tripId) {
      fetchTripData();
    }
  }, [user, tripId]);

  const fetchTripData = async () => {
    const [tripData, stopsData, expensesData] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).maybeSingle(),
      supabase
        .from('stops')
        .select('*, city:cities(*)')
        .eq('trip_id', tripId)
        .order('order_index'),
      supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('expense_date'),
    ]);

    if (tripData.data) {
      setTrip(tripData.data);
    }

    if (stopsData.data) {
      const stopsWithActivities = await Promise.all(
        stopsData.data.map(async (stop) => {
          const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('stop_id', stop.id)
            .order('activity_date, order_index');

          return { ...stop, activities: activities || [] };
        })
      );
      setStops(stopsWithActivities);
    }

    if (expensesData.data) {
      setExpenses(expensesData.data);
    }

    setLoading(false);
  };

  const shareTrip = () => {
    const url = `${window.location.origin}/public/trips/${tripId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const calculateTotalCost = () => {
    const activitiesCost = stops.reduce(
      (sum, stop) => sum + stop.activities.reduce((s, a) => s + Number(a.cost), 0),
      0
    );
    const expensesCost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return activitiesCost + expensesCost;
  };

  const groupExpensesByCategory = () => {
    const grouped: Record<string, number> = {};
    expenses.forEach(exp => {
      grouped[exp.category] = (grouped[exp.category] || 0) + Number(exp.amount);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
          <Link href="/trips">
            <Button>Back to Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/trips">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trips
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={shareTrip}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Link href={`/trips/${tripId}/edit`}>
              <Button className="bg-gradient-to-r from-orange-500 to-cyan-600">
                <Edit className="w-4 h-4 mr-2" />
                Edit Trip
              </Button>
            </Link>
          </div>
        </div>

        <div
          className="relative h-64 rounded-xl overflow-hidden mb-8"
          style={{
            backgroundImage: `url(${trip.cover_photo_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                ${calculateTotalCost().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="space-y-6">
            {stops.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No stops yet</h3>
                  <p className="text-gray-600 mb-4">Add destinations to your itinerary</p>
                  <Link href={`/trips/${tripId}/edit`}>
                    <Button>Add Stops</Button>
                  </Link>
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
                            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    ${Number(trip.total_budget).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-600">
                    ${calculateTotalCost().toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${(Number(trip.total_budget) - calculateTotalCost()).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(groupExpensesByCategory()).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="font-semibold text-orange-600">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Trip Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-cyan-600" />
                  {stops.map((stop, index) => (
                    <div key={stop.id} className="relative">
                      <div className="absolute -left-[1.6rem] w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-100">
                        <h4 className="font-bold text-lg">{stop.city?.name}</h4>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(stop.start_date), 'MMM d')} - {format(parseISO(stop.end_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm mt-2">{stop.activities.length} activities planned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
