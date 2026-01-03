'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/lib/types';
import { getTempTrips, deleteTempTrip, saveTempTrip, initializeTempStorage } from '@/lib/tempStorage';
import { Plus, Map, Calendar, DollarSign, Eye, Edit, Trash2, Share2, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const IconBtn = ({ icon, onClick, danger }: { icon: React.ReactNode; onClick: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition ${danger ? 'hover:bg-rose-100 text-rose-600' : 'hover:bg-slate-100 text-slate-600'}`}
  >
    {icon}
  </button>
);
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
    // Initialize temp storage with mock data
    initializeTempStorage();
    
    // Load trips from temporary storage
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      // Try to load from Supabase first
      if (user) {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (data && data.length > 0) {
          setTrips(data);
          setLoadingData(false);
          return;
        }
      }
      
      // Fallback to temporary storage
      const tempTrips = getTempTrips();
      setTrips(tempTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Fallback to temporary storage
      const tempTrips = getTempTrips();
      setTrips(tempTrips);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    try {
      // Try to delete from Supabase first
      if (user && !tripId.startsWith('temp-') && !tripId.startsWith('mock-')) {
        const { error } = await supabase
          .from('trips')
          .delete()
          .eq('id', tripId);

        if (error) throw error;
      }
      
      // Delete from temporary storage
      deleteTempTrip(tripId);
      toast.success('Trip deleted successfully');
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    } finally {
      setDeleteDialog(null);
    }
  };

  const togglePublic = async (trip: Trip) => {
    try {
      // Try to update in Supabase first
      if (user && !trip.id.startsWith('temp-') && !trip.id.startsWith('mock-')) {
        const { error } = await supabase
          .from('trips')
          .update({ is_public: !trip.is_public })
          .eq('id', trip.id);

        if (error) throw error;
      }
      
      // Update in temporary storage
      const updatedTrip = { ...trip, is_public: !trip.is_public };
      saveTempTrip(updatedTrip);
      
      toast.success(trip.is_public ? 'Trip is now private' : 'Trip is now public');
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip visibility:', error);
      toast.error('Failed to update trip visibility');
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
  <div className="min-h-screen bg-slate-50">
    <Navbar />

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Your Trips</h1>
          <p className="text-sm text-slate-500">Manage and organize your journeys</p>
        </div>
        <Link href="/trips/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Map className="w-14 h-14 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No trips yet</h3>
          <p className="text-slate-500 mb-6">Create your first trip to get started.</p>
          <Link href="/trips/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <Card 
              key={trip.id} 
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/trips/${trip.id}/timeline`)}
            >
              <div className="relative h-44">
                <img
                  src={trip.cover_photo_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                  className="w-full h-full object-cover"
                />
                {trip.is_public && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">
                    Public
                  </span>
                )}
              </div>

              <CardContent className="p-5" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{trip.name}</h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(trip.start_date), 'MMM d')} – {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                </p>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {trip.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> ${Number(trip.total_budget || 0).toFixed(0)}
                  </span>

                  <div className="flex gap-2">
                    <IconBtn danger icon={<Trash2 />} onClick={(e) => { e.stopPropagation(); setDeleteDialog(trip.id); }} />
                  </div>
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-600" />
                    <Label htmlFor={`public-${trip.id}`} className="text-sm text-slate-700 cursor-pointer">
                      Make Public
                    </Label>
                  </div>
                  <Switch
                    id={`public-${trip.id}`}
                    checked={trip.is_public || false}
                    onCheckedChange={(checked) => {
                      const updatedTrip = { ...trip, is_public: checked };
                      togglePublic(updatedTrip);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={(e) => { e.stopPropagation(); router.push(`/trips/${trip.id}/timeline`); }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    View Timeline
                  </Button>
                  <Button
                    onClick={(e) => { e.stopPropagation(); router.push(`/itinerary?tripId=${trip.id}`); }}
                    variant="outline"
                    className="flex-1"
                  >
                    Edit Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this trip and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
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
