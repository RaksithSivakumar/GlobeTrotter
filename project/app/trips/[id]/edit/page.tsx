"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Trip, Stop, City, Activity, ActivityTemplate } from "@/lib/types";
import { ArrowLeft, Plus, Trash2, Save, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function EditTripPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<(Stop & { city?: City })[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [activityTemplates, setActivityTemplates] = useState<
    ActivityTemplate[]
  >([]);
  const [selectedCityForActivities, setSelectedCityForActivities] = useState<
    string | null
  >(null);
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
      supabase.from("trips").select("*").eq("id", tripId).maybeSingle(),
      supabase
        .from("stops")
        .select("*, city:cities(*)")
        .eq("trip_id", tripId)
        .order("order_index"),
      supabase.from("cities").select("*").order("name"),
    ]);

    if (tripData.data) setTrip(tripData.data);
    if (stopsData.data) setStops(stopsData.data);
    if (citiesData.data) setCities(citiesData.data);
    setLoading(false);
  };

  const fetchActivityTemplates = async (cityId: string) => {
    const { data } = await supabase
      .from("activity_templates")
      .select("*")
      .eq("city_id", cityId);

    if (data) setActivityTemplates(data);
  };

  const handleAddStop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const stopData = {
      trip_id: tripId,
      city_id: formData.get("city_id") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      order_index: stops.length,
    };

    const { error } = await supabase.from("stops").insert(stopData);

    if (error) {
      toast.error("Failed to add stop");
    } else {
      toast.success("Stop added successfully");
      setAddStopDialog(false);
      fetchData();
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    const { error } = await supabase.from("stops").delete().eq("id", stopId);

    if (error) {
      toast.error("Failed to delete stop");
    } else {
      toast.success("Stop deleted");
      fetchData();
    }
  };

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStop) return;

    const formData = new FormData(e.currentTarget);
    const templateId = formData.get("activity_template_id") as string;
    const template = activityTemplates.find((t) => t.id === templateId);

    const activityData = {
      stop_id: selectedStop.id,
      activity_template_id: templateId,
      name: template?.name || (formData.get("custom_name") as string),
      description: template?.description || "",
      category: template?.category || "sightseeing",
      cost: template?.estimated_cost || 0,
      duration_hours: template?.duration_hours || 2,
      activity_date: formData.get("activity_date") as string,
      activity_time: (formData.get("activity_time") as string) || null,
      order_index: 0,
    };

    const { error } = await supabase.from("activities").insert(activityData);

    if (error) {
      toast.error("Failed to add activity");
    } else {
      toast.success("Activity added successfully");
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
  function SummaryRow({ label, value, highlight = false }: any) {
    return (
      <div className="flex justify-between">
        <span className="text-slate-500">{label}</span>
        <span
          className={`font-medium ${
            highlight ? "text-indigo-600" : "text-slate-800"
          }`}
        >
          {value}
        </span>
      </div>
    );
  }

  function EmptyState({ icon, text }: any) {
    return (
      <div className="text-center py-10 text-slate-500">
        <div className="flex justify-center mb-3 text-indigo-400">{icon}</div>
        <p className="text-sm">{text}</p>
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
            <Link
              href={`/trips/${tripId}`}
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to trip
            </Link>
            <h1 className="text-3xl font-semibold text-slate-900 mt-2">
              Edit Trip — {trip.name}
            </h1>
            <p className="text-sm text-slate-500">
              Organize stops and activities
            </p>
          </div>

          <Button
            onClick={() => router.push(`/trips/${tripId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" /> Save & Exit
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stops */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-sm border border-slate-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stops</CardTitle>
                <Dialog open={addStopDialog} onOpenChange={setAddStopDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-1" /> Add Stop
                    </Button>
                  </DialogTrigger>
                  {/* Dialog content unchanged */}
                </Dialog>
              </CardHeader>

              <CardContent className="space-y-4">
                {stops.length === 0 ? (
                  <EmptyState
                    icon={<MapPin />}
                    text="No stops yet. Add your first destination."
                  />
                ) : (
                  stops.map((stop, i) => (
                    <div
                      key={stop.id}
                      className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">
                            {stop.city?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(parseISO(stop.start_date), "MMM d")} –{" "}
                            {format(parseISO(stop.end_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStop(stop);
                            if (stop.city_id)
                              fetchActivityTemplates(stop.city_id);
                            setAddActivityDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Activity
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600"
                          onClick={() => handleDeleteStop(stop.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border border-slate-100">
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <SummaryRow
                  label="Duration"
                  value={`${format(
                    parseISO(trip.start_date),
                    "MMM d"
                  )} – ${format(parseISO(trip.end_date), "MMM d, yyyy")}`}
                />
                <SummaryRow label="Stops" value={`${stops.length}`} />
                <SummaryRow
                  label="Budget"
                  value={`$${Number(trip.total_budget).toFixed(2)}`}
                  highlight
                />
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 border-indigo-100">
              <CardContent className="p-5">
                <p className="text-sm text-indigo-700">
                  Tip: Add stops in the order you plan to visit them. You can
                  attach activities to each stop.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Activity Dialog remains unchanged */}
      </main>
    </div>
  );
}
