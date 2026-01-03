"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Trip, City } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Map,
  DollarSign,
  Calendar,
  Plane,
  MapPin,
  ArrowRight,
  Globe,
  Star,
  ChevronRight,
  Heart,
  Award,
  TrendingUp,
  Users,
  Network,
  Briefcase,
  Target,
  ChevronLeft,
  Sparkles,
  Compass,
  Rocket,
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Trip, City } from '@/lib/types';
import { Plus, Map, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, differenceInDays } from 'date-fns';
export const dynamic = "force-dynamic";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDaysUntil = (dateStr: string) => {
  const target = new Date(dateStr);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [tripsData, citiesData] = await Promise.all([
        supabase
          .from("trips")
          .select("*")
          .eq("user_id", user!.id)
          .order("start_date", { ascending: false })
          .limit(4),
        supabase
          .from("cities")
          .select("*")
          .order("popularity_score", { ascending: false })
          .limit(8),
      ]);

      if (tripsData.data) setTrips(tripsData.data);
      if (citiesData.data) setPopularCities(citiesData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent"></div>
            <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = trips.reduce(
    (sum, trip) => sum + Number(trip.total_budget || 0),
    0
  );
  const upcomingTrip = trips.find(
    (trip) => new Date(trip.start_date) > new Date()
  );

  const nextRoute = () => {
    setCurrentRouteIndex((prev) =>
      prev + 3 >= popularCities.length ? 0 : prev + 3
    );
  };

  const prevRoute = () => {
    setCurrentRouteIndex((prev) =>
      prev - 3 < 0 ? Math.max(0, popularCities.length - 3) : prev - 3
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="bg-white rounded-3xl p-8 shadow-xl inline-block mb-8">
                <p className="text-sm text-gray-600 mb-2">
                  As an independent entity,
                </p>
                <p className="text-sm text-gray-600">
                  we provide supportive and neutral
                </p>
                <p className="text-sm text-gray-600">
                  guidance for your travel journey
                </p>
              </div>

              <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8">
                TRAVEL
                <br />
                AROUND
                <br />
                THE WORLD
              </h1>

              <Link href="/trips/create">
                <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg font-semibold">
                  Plan Your Journey
                </Button>
              </Link>
            </div>

            {/* Right Content - Plane Image */}
            <div className="relative">
              <div className="p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop"
                  alt="Airplane"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[26rem]">
            {/* Stat 1 */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-5xl font-black text-gray-900 mb-2">
                      76%
                    </div>
                    <p className="text-sm text-gray-600">
                      Trip completion rate
                    </p>
                  </div>
                  <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold">
                    01
                  </div>
                </div>

                <div className="mt-auto">
                  <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop"
                    alt="Flight"
                    className="w-full h-40 object-cover rounded-2xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stat 2 */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <img
                  src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=200&fit=crop"
                  alt="Aircraft"
                  className="w-full h-40 object-cover rounded-2xl mb-4"
                />

                <div className="bg-black text-white px-4 py-2 rounded-full inline-block mb-2 self-start">
                  <span className="text-3xl font-black">83.5</span>
                </div>

                <p className="text-sm text-gray-600">
                  It's not always easy for
                </p>
                <p className="text-sm text-gray-600">travellers to know</p>

                <div className="mt-auto bg-black text-white rounded-2xl p-4">
                  <div className="text-2xl font-black mb-1">8 IN 10</div>
                  <p className="text-xs">Feel overwhelmed by</p>
                  <p className="text-xs">starting the process</p>
                </div>
              </CardContent>
            </Card>

            {/* Stat 3 */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <img
                  src="https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=600&auto=format&fit=crop&q=60"
                  alt="Low emission flight"
                  className="w-full h-40 object-cover rounded-2xl mb-4"
                />

                <div className="flex justify-between items-center mt-auto">
                  <div>
                    <h3 className="text-4xl font-black text-gray-900 leading-tight">
                      159{" "}
                      <span className="text-lg font-semibold text-gray-500">
                        MN
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 leading-snug">
                      Lower-emission flights selected
                    </p>
                    <p className="text-sm text-gray-500">on Skyscanner</p>
                  </div>

                  <div className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg">
                    03
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-4">
                We are international
              </p>
              <p className="text-sm font-semibold text-gray-500 mb-8">
                travel agency
              </p>

              <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                We're working to accelerate change within the tourism industry
                by bringing{" "}
                <span className="text-gray-400">
                  together leading industry. This means we can empower people to
                  make more informed.
                </span>
              </h2>

              <Button
                variant="outline"
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full px-8 py-6 font-semibold"
              >
                Read more
              </Button>
            </div>

            <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-yellow-100 rounded-3xl shadow-xl overflow-hidden h-full">
              <img
                src="https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzWFyY2h8NHx8dHJpcHxlbnwwfHwwfHx8MA%3D%3D"
                alt="Low emission flight"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-5xl font-black text-gray-900">ROUTES</h2>
            <div className="flex gap-3">
              <button
                onClick={prevRoute}
                className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextRoute}
                className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-900 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularCities
              .slice(currentRouteIndex, currentRouteIndex + 3)
              .map((city, index) => (
                <Card
                  key={city.id}
                  className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl"
                  onClick={() => router.push(`/explore?city=${city.id}`)}
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={
                        city.image_url ||
                        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=800&fit=crop"
                      }
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{city.country}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4">
                        {city.name}
                      </h3>
                      <div className="flex justify-between items-center text-white text-sm">
                        <span>Explore destination</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-gray-900 mb-16">
            WHAT WE DO
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop"
                alt="Flight Planning"
                className="w-full h-64 object-cover"
              />
            </Card>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&h=400&fit=crop"
                alt="Travel"
                className="w-full h-64 object-cover"
              />
            </Card>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&h=400&fit=crop"
                alt="Destinations"
                className="w-full h-64 object-cover"
              />
            </Card>
          </div>

          {/* Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border-0 shadow-xl rounded-3xl p-8">
              <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mb-6">
                01
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Trip Planning
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Planning is the process of creating personalized itineraries,
                managing budgets, and organizing all aspects of your journey in
                one place.
              </p>
              <Link href="/trips/create">
                <Button
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full font-semibold"
                >
                  Start Planning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="bg-white border-0 shadow-xl rounded-3xl p-8">
              <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mb-6">
                02
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Budget Management
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Budget management helps you track expenses, set spending limits,
                and ensure your travels stay within financial goals while
                maximizing experiences.
              </p>
              <Link href="/budget">
                <Button
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full font-semibold"
                >
                  Manage Budget
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Trips Section */}
      {trips.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-5xl font-black text-gray-900">YOUR TRIPS</h2>
              <Link href="/trips">
                <Button
                  variant="ghost"
                  className="text-gray-900 hover:text-gray-700 font-semibold"
                >
                  View All
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trips.slice(0, 2).map((trip, index) => (
                <Card
                  key={trip.id}
                  className="group cursor-pointer overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl"
                  onClick={() => router.push(`/trips/${trip.id}`)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-br"
                      style={{
                        background:
                          index === 0
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-3xl font-black text-white mb-2">
                        {trip.name}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {trip.description}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(trip.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ${Number(trip.total_budget || 0).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                  New Adventure Awaits
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Your{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Next Chapter
                </span>{" "}
                Begins Here
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Create unforgettable memories with our intuitive trip planner.
                Join 50,000+ travelers crafting their perfect journeys.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <Link href="/trips/create" className="group">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full px-8 py-7 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <Rocket className="w-6 h-6 mr-3 group-hover:rotate-45 transition-transform" />
                    Start Planning
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="outline"
                    className="
                      group relative overflow-hidden
                      border-2 border-white/40
                      text-white
                      rounded-full
                      px-7 sm:px-8
                      py-3 sm:py-4
                      text-base sm:text-lg
                      font-bold tracking-wide
                      backdrop-blur-md
                      transition-all duration-300 ease-out
                      hover:border-white/70
                      hover:shadow-xl hover:shadow-white/10
                      hover:scale-[1.05]
                      active:scale-[0.97]
                    "
                  >
                    {/* Glow Effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content */}
                    <span className="relative flex items-center gap-3 text-black">
                      <Compass className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-12 text-blue-400" />
                      Explore Destinations
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Interactive Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Next Trip */}
              <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs uppercase text-orange-300 font-semibold mb-2">
                  Next Trip
                </p>
                <h3 className="text-white text-xl font-bold">
                  {trips.length ? trips[0].name : "No upcoming trip"}
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  {trips.length
                    ? `${getDaysUntil(trips[0].start_date)} days to go`
                    : "Start planning your journey"}
                </p>
              </div>

              {/* Budget */}
              <div className="bg-gradient-to-br from-green-500/20 to-cyan-500/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs uppercase text-green-300 font-semibold mb-2">
                  Total Budget
                </p>
                <h3 className="text-white text-xl font-bold">
                  ${trips.reduce((s, t) => s + Number(t.total_budget || 0), 0)}
                </h3>
                <p className="text-sm text-white/70 mt-1">Across all trips</p>
              </div>

              {/* Favorite City */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs uppercase text-purple-300 font-semibold mb-2">
                  Top Destination
                </p>
                <h3 className="text-white text-xl font-bold">
                  {popularCities[0]?.name || "Discover cities"}
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  {popularCities[0]?.country || "Explore trending places"}
                </p>
              </div>

              {/* Trips Count */}
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs uppercase text-blue-300 font-semibold mb-2">
                  Trips Planned
                </p>
                <h3 className="text-white text-xl font-bold">{trips.length}</h3>
                <p className="text-sm text-white/70 mt-1">Journeys created</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
