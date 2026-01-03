'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Trip, Stop, City, Activity, ActivityTemplate } from '@/lib/types';
import { ArrowLeft, Plus, Trash2, Save, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

export default function EditTripPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<(Stop & { city?: City })[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [selectedCityForActivities, setSelectedCityForActivities] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [addStopDialog, setAddStopDialog] = useState(false);
  const [addActivityDialog, setAddActivityDialog] = useState(false);

  useEffect(() => {
    if (user && tripId) {
      fetchData();
    }
  }, [user, tripId]);

  const fetchData = async () => {
    const [tripData, stopsData, citiesData] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).maybeSingle(),
      supabase
        .from('stops')
        .select('*, city:cities(*)')
        .eq('trip_id', tripId)
        .order('order_index'),
      supabase.from('cities').select('*').order('name'),
    ]);

    if (tripData.data) setTrip(tripData.data);
    if (stopsData.data) setStops(stopsData.data);
    if (citiesData.data) setCities(citiesData.data);
    setLoading(false);
  };

  const fetchActivityTemplates = async (cityId: string) => {
    const { data } = await supabase
      .from('activity_templates')
      .select('*')
      .eq('city_id', cityId);

    if (data) setActivityTemplates(data);
  };

  const handleAddStop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const stopData = {
      trip_id: tripId,
      city_id: formData.get('city_id') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      order_index: stops.length,
    };

    const { error } = await supabase.from('stops').insert(stopData);

    if (error) {
      toast.error('Failed to add stop');
    } else {
      toast.success('Stop added successfully');
      setAddStopDialog(false);
      fetchData();
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    const { error } = await supabase.from('stops').delete().eq('id', stopId);

    if (error) {
      toast.error('Failed to delete stop');
    } else {
      toast.success('Stop deleted');
      fetchData();
    }
  };

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStop) return;

    const formData = new FormData(e.currentTarget);
    const templateId = formData.get('activity_template_id') as string;
    const template = activityTemplates.find(t => t.id === templateId);

    const activityData = {
      stop_id: selectedStop.id,
      activity_template_id: templateId,
      name: template?.name || (formData.get('custom_name') as string),
      description: template?.description || '',
      category: template?.category || 'sightseeing',
      cost: template?.estimated_cost || 0,
      duration_hours: template?.duration_hours || 2,
      activity_date: formData.get('activity_date') as string,
      activity_time: formData.get('activity_time') as string || null,
      order_index: 0,
    };

    const { error } = await supabase.from('activities').insert(activityData);

    if (error) {
      toast.error('Failed to add activity');
    } else {
      toast.success('Activity added successfully');
      setAddActivityDialog(false);
      setSelectedStop(null);
    }
  };

  if (loading || !trip) {
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
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trip
            </Button>
          </Link>
          <Button onClick={() => router.push(`/trips/${tripId}`)} className="bg-gradient-to-r from-orange-500 to-cyan-600">
            <Save className="w-4 h-4 mr-2" />
            Done Editing
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit: {trip.name}</h1>
          <p className="text-gray-600">Manage your trip itinerary</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Stops & Cities</CardTitle>
                  <Dialog open={addStopDialog} onOpenChange={setAddStopDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Stop
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Stop</DialogTitle>
                        <DialogDescription>Add a city to your trip itinerary</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStop} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="city_id">City</Label>
                          <Select name="city_id" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map(city => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}, {city.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input type="date" name="start_date" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input type="date" name="end_date" required />
                          </div>
                        </div>

                        <Button type="submit" className="w-full">Add Stop</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {stops.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No stops yet. Add your first destination!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-cyan-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{stop.city?.name}</h4>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(stop.start_date), 'MMM d')} - {format(parseISO(stop.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedStop(stop);
                              if (stop.city_id) {
                                fetchActivityTemplates(stop.city_id);
                                setSelectedCityForActivities(stop.city_id);
                              }
                              setAddActivityDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Activities
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteStop(stop.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-semibold">
                    {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Stops</div>
                  <div className="font-semibold">{stops.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Budget</div>
                  <div className="font-semibold text-orange-600">
                    ${Number(trip.total_budget).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-100 to-cyan-100">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-2">Quick Tip</h3>
                <p className="text-sm text-gray-700">
                  Add stops in the order you plan to visit them. You can add activities to each stop to plan your daily schedule.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={addActivityDialog} onOpenChange={setAddActivityDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Activity</DialogTitle>
              <DialogDescription>
                Add an activity to {selectedStop?.city?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Activity</Label>
                <Select name="activity_template_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from popular activities" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - ${template.estimated_cost} ({template.duration_hours}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity_date">Date</Label>
                  <Input type="date" name="activity_date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity_time">Time (optional)</Label>
                  <Input type="time" name="activity_time" />
                </div>
              </div>

              <Button type="submit" className="w-full">Add Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
