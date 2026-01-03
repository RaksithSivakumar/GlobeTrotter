'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateTripPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tripData = {
      user_id: user!.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      total_budget: parseFloat(formData.get('budget') as string) || 0,
      cover_photo_url: formData.get('cover_photo_url') as string || null,
    };

    const { data, error } = await supabase
      .from('trips')
      .insert(tripData)
      .select()
      .single();

    if (error) {
      toast.error('Failed to create trip');
      setLoading(false);
    } else {
      toast.success('Trip created successfully!');
      router.push(`/trips/${data.id}/edit`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/trips">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trips
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Trip</CardTitle>
            <CardDescription>
              Start planning your next adventure by providing basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Summer Europe Adventure"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your trip..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (USD)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_photo_url">Cover Photo URL (optional)</Label>
                <Input
                  id="cover_photo_url"
                  name="cover_photo_url"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Trip'}
                </Button>
                <Link href="/trips" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
