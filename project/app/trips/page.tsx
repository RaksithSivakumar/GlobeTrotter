'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/lib/types';
import { Plus, Map, Calendar, DollarSign, Eye, Edit, Trash2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TripsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user!.id)
      .order('start_date', { ascending: false });

    if (data) setTrips(data);
    setLoadingData(false);
  };

  const handleDelete = async (tripId: string) => {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      toast.error('Failed to delete trip');
    } else {
      toast.success('Trip deleted successfully');
      setTrips(trips.filter(t => t.id !== tripId));
    }
    setDeleteDialog(null);
  };

  const togglePublic = async (trip: Trip) => {
    const { error } = await supabase
      .from('trips')
      .update({ is_public: !trip.is_public })
      .eq('id', trip.id);

    if (error) {
      toast.error('Failed to update trip visibility');
    } else {
      toast.success(trip.is_public ? 'Trip is now private' : 'Trip is now public');
      fetchTrips();
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">Manage all your travel plans in one place</p>
          </div>
          <Link href="/trips/create">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-cyan-600">
              <Plus className="w-5 h-5 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure and explore the world!</p>
              <Link href="/trips/create">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-cyan-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Trip
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative h-48">
                  <img
                    src={trip.cover_photo_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-4 right-4">
                    {trip.is_public && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Public
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl mb-1">{trip.name}</h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {trip.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center text-orange-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="font-semibold">${Number(trip.total_budget || 0).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/trips/${trip.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => setDeleteDialog(trip.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trip</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this trip? This action cannot be undone and will delete all stops, activities, and expenses associated with this trip.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialog && handleDelete(deleteDialog)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
