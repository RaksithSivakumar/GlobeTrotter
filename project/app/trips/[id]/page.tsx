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
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Share2, 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  Compass,
  Users,
  Navigation,
  Download,
  Printer,
  ChevronRight,
  Star,
  Sparkles,
  Globe,
  Mountain,
  Palette,
  Music,
  Coffee,
  ShoppingBag,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';

export default function TripDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<(Stop & { activities: Activity[]; city: any })[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(0);

  useEffect(() => {
    if (user && tripId) {
      fetchTripData();
    }
  }, [user, tripId]);

  const fetchTripData = async () => {
    try {
      const [tripData, stopsData, expensesData] = await Promise.all([
        supabase.from('trips').select('*').eq('id', tripId).maybeSingle(),
        supabase
          .from('stops')
          .select('*, city:cities(*)')
          .eq('trip_id', tripId)
          .order('order_index', { ascending: true }),
        supabase
          .from('expenses')
          .select('*')
          .eq('trip_id', tripId)
          .order('expense_date', { ascending: true }),
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
              .order('activity_date, order_index', { ascending: true });

            return { ...stop, activities: activities || [] };
          })
        );
        setStops(stopsWithActivities);
      }

      if (expensesData.data) {
        setExpenses(expensesData.data);
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareTrip = () => {
    const url = `${window.location.origin}/trips/${tripId}`;
    navigator.clipboard.writeText(url);
    toast.success('Trip link copied to clipboard! ✨');
  };

  const calculateTotalCost = () => {
    const activitiesCost = stops.reduce(
      (sum, stop) => sum + stop.activities.reduce((s, a) => s + Number(a.cost || 0), 0),
      0
    );
    const expensesCost = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return activitiesCost + expensesCost;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'accommodation': return <Hotel className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'sightseeing': return <Camera className="w-4 h-4" />;
      case 'transport': return <Navigation className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'entertainment': return <Music className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'museum': return <Palette className="w-5 h-5" />;
      case 'hiking': return <Mountain className="w-5 h-5" />;
      case 'beach': return <Sparkles className="w-5 h-5" />;
      case 'city tour': return <Globe className="w-5 h-5" />;
      case 'food tour': return <Coffee className="w-5 h-5" />;
      case 'shopping': return <ShoppingBag className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  const getDaysArray = () => {
    if (!trip) return [];
    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    const days = differenceInDays(end, start) + 1;
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-500 border-t-transparent"></div>
            <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-600 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-600 font-medium text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Compass className="w-16 h-16 text-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Adventure Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">This trip might have been moved or deleted.</p>
          <Link href="/trips">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full px-8 py-6 text-lg font-bold">
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to All Trips
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalDays = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const remainingBudget = Number(trip.total_budget) - calculateTotalCost();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-64 md:h-96 w-full bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80'})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/30 to-pink-500/30 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-semibold">YOUR ADVENTURE</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{trip.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{totalDays} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">{stops.length} destinations</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white/40 text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                  onClick={shareTrip}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
                <Link href={`/trips/${tripId}/edit`}>
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full">
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Trip
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-12 right-12 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12 relative">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">${calculateTotalCost().toFixed(0)}</div>
                  <div className="text-white/90 text-sm">Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">${remainingBudget.toFixed(0)}</div>
                  <div className="text-white/90 text-sm">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">{trip.travelers_count || 1}</div>
                  <div className="text-white/90 text-sm">Travelers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">{stops.reduce((sum, stop) => sum + stop.activities.length, 0)}</div>
                  <div className="text-white/90 text-sm">Activities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="itinerary" className="space-y-8">
          <TabsList className="bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
            <TabsTrigger value="itinerary" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl px-8 py-3">
              <Compass className="w-4 h-4 mr-2" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl px-8 py-3">
              <DollarSign className="w-4 h-4 mr-2" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl px-8 py-3">
              <MapPin className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="space-y-8">
            {/* Day Selector */}
            {totalDays > 1 && (
              <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
                {getDaysArray().map((day) => (
                  <Button
                    key={day}
                    variant={activeDay === day - 1 ? "default" : "outline"}
                    className={`rounded-full px-6 ${activeDay === day - 1 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : ''}`}
                    onClick={() => setActiveDay(day - 1)}
                  >
                    Day {day}
                  </Button>
                ))}
              </div>
            )}

            {/* Itinerary Cards */}
            <div className="space-y-6">
              {stops.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300 text-center py-16 rounded-2xl">
                  <CardContent>
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No destinations yet</h3>
                    <p className="text-gray-600 mb-6">Add your first stop to start planning!</p>
                    <Link href={`/trips/${tripId}/edit`}>
                      <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full px-8">
                        <Plus className="w-5 h-5 mr-2" />
                        Add First Stop
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                stops.map((stop, stopIndex) => (
                  <Card key={stop.id} className="border-0 shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={stop.city?.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'}
                        alt={stop.city?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                          Stop {stopIndex + 1}
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 left-6">
                        <h3 className="text-3xl font-black text-white mb-2">{stop.city?.name}</h3>
                        <div className="flex items-center gap-4 text-white/90">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {format(parseISO(stop.start_date), 'MMM d')} - {format(parseISO(stop.end_date), 'MMM d')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {differenceInDays(parseISO(stop.end_date), parseISO(stop.start_date)) + 1} days
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <div className="text-lg font-bold text-white">
                          ${stop.activities.reduce((sum, a) => sum + Number(a.cost || 0), 0).toFixed(0)}
                        </div>
                        <div className="text-xs text-white/80">Estimated cost</div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {stop.activities.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Compass className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No activities planned for this stop</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stop.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all group/activity"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center group-hover/activity:scale-110 transition-transform">
                                    {getActivityIcon(activity.category)}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-bold text-gray-900">{activity.name}</h4>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {activity.category}
                                    </Badge>
                                  </div>
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{activity.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {activity.duration_hours}h
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      ${Number(activity.cost).toFixed(2)}
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto">
                                      <Heart className="w-4 h-4 text-red-400 cursor-pointer hover:text-red-500" />
                                    </div>
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
          </TabsContent>

          <TabsContent value="budget" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Budget Overview */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-2xl font-black">Budget Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Budget Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Total Budget: ${Number(trip.total_budget).toFixed(2)}</span>
                          <span className="font-bold text-green-600">${remainingBudget.toFixed(2)} remaining</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (calculateTotalCost() / Number(trip.total_budget)) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>0%</span>
                          <span>${calculateTotalCost().toFixed(2)} spent</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Expense Categories */}
                      <div>
                        <h4 className="font-bold text-lg mb-4">Expenses by Category</h4>
                        <div className="space-y-3">
                          {['Accommodation', 'Transport', 'Food', 'Activities', 'Shopping', 'Other'].map((category) => {
                            const total = expenses
                              .filter(e => e.category === category)
                              .reduce((sum, e) => sum + Number(e.amount || 0), 0);
                            
                            if (total === 0) return null;
                            
                            return (
                              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                                    {getCategoryIcon(category)}
                                  </div>
                                  <span className="font-medium">{category}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900">${total.toFixed(2)}</div>
                                  <div className="text-sm text-gray-500">
                                    {((total / calculateTotalCost()) * 100).toFixed(0)}% of total
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Actions & Stats */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-4">Budget Tips</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <span className="text-sm text-gray-700">You're ${remainingBudget.toFixed(2)} under budget</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                        <span className="text-sm text-gray-700">Food is your biggest expense</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <span className="text-sm text-gray-700">Consider booking activities in advance for discounts</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 rounded-xl">
                        <Download className="w-4 h-4 mr-3" />
                        Export Budget
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-auto py-3 rounded-xl">
                        <Printer className="w-4 h-4 mr-3" />
                        Print Summary
                      </Button>
                      <Link href={`/trips/${tripId}/expenses`}>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl py-3">
                          <Plus className="w-4 h-4 mr-3" />
                          Add Expense
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-8">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-2xl font-black">Trip Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Map Placeholder */}
                <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Interactive Map</h4>
                    <p className="text-gray-600">Map integration coming soon!</p>
                  </div>
                  
                  {/* Mock Route Points */}
                  <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Connecting Lines */}
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1 border-t-2 border-dashed border-gray-400 transform rotate-45"></div>
                  <div className="absolute top-1/2 left-1/2 w-1/2 h-1 border-t-2 border-dashed border-gray-400 transform -rotate-45 origin-left"></div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stops.map((stop, index) => (
                <Card key={stop.id} className="border-0 shadow-md hover:shadow-xl transition-all rounded-xl overflow-hidden">
                  <div className="h-32 relative">
                    <img
                      src={stop.city?.image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80'}
                      alt={stop.city?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white text-gray-900 font-bold">#{index + 1}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg mb-1">{stop.city?.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{stop.city?.country}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {format(parseISO(stop.start_date), 'MMM d')} - {format(parseISO(stop.end_date), 'd')}
                      </span>
                      <span className="font-semibold">{stop.activities.length} activities</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Trips */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/trips">
            <Button variant="outline" className="rounded-full border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600">
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to All Trips
            </Button>
          </Link>
        </div>
      </main>

      {/* Add missing Plus icon import */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Add missing Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);