"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { saveTempTrip, initializeTempStorage } from "@/lib/tempStorage";
import { Trip } from "@/lib/types";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function CreateTripPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize temp storage with mock data
    initializeTempStorage();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tripId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const tripData: Trip = {
      id: tripId,
      user_id: user?.id || 'temp-user',
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      total_budget: parseFloat(formData.get("budget") as string) || 0,
      cover_photo_url: (formData.get("cover_photo_url") as string) || null,
      is_public: false,
      city: (formData.get("city") as string) || null,
      country: (formData.get("country") as string) || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Save to temporary storage
      saveTempTrip(tripData);
      toast.success("Trip created successfully! (Saved temporarily)");
      router.push(`/trips`);
    } catch (error) {
      toast.error("Failed to create trip");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function Field({ label, children }: any) {
    return (
      <div className="space-y-1">
        <Label className="text-sm text-slate-700">{label}</Label>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back */}
        <Link
          href="/trips"
          className="text-sm text-sky-600 hover:underline flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Link>

        <Card className="rounded-2xl shadow-sm border border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-900">
              Create New Trip
            </CardTitle>
            <CardDescription className="text-slate-500">
              Add basic details to start planning your journey.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Trip Name *">
                <Input
                  name="name"
                  placeholder="Summer Europe Adventure"
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  name="description"
                  placeholder="Describe your trip..."
                  rows={4}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Start Date *">
                  <Input name="start_date" type="date" required />
                </Field>
                <Field label="End Date *">
                  <Input name="end_date" type="date" required />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City *">
                  <Input
                    name="city"
                    placeholder="e.g., Paris"
                    required
                  />
                </Field>
                <Field label="Country *">
                  <Input
                    name="country"
                    placeholder="e.g., France"
                    required
                  />
                </Field>
              </div>

              <Field label="Total Budget">
                <Input
                  name="budget"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </Field>

              <Field label="Cover Image URL">
                <Input
                  name="cover_photo_url"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                />
              </Field>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Trip"}
                </Button>

                <Link href="/trips" className="flex-1">
                  <Button variant="outline" className="w-full">
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
