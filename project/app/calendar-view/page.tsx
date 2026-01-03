'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, ChevronLeft, ChevronRight, DollarSign, Plane, Camera, Compass, Luggage, Calendar as CalendarIcon, Globe, Search, X, Filter, ArrowUpDown } from 'lucide-react';

type TravelItem = {
  id: string;
  stopId: string;
  day: string;
  activityId: string;
  time: string;
  cost: number;
  location: string;
  activity: string;
};

export default function TravelCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 2, 1)); // March 2026
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [minCost, setMinCost] = useState<number>(0);
  const [maxCost, setMaxCost] = useState<number>(100);
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'location' | 'activity'>('date');

  const travelData: TravelItem[] = [
    {
      id: "ia1",
      stopId: "s1",
      day: "2026-03-10",
      activityId: "a1",
      time: "10:00",
      cost: 35,
      location: "Paris",
      activity: "Eiffel Tower",
    },
    {
      id: "ia2",
      stopId: "s1",
      day: "2026-03-10",
      activityId: "a2",
      time: "17:00",
      cost: 22,
      location: "Paris",
      activity: "Seine River Cruise",
    },
    {
      id: "ia3",
      stopId: "s2",
      day: "2026-03-13",
      activityId: "a3",
      time: "09:30",
      cost: 40,
      location: "Amsterdam",
      activity: "Van Gogh Museum",
    },
    {
      id: "ia4",
      stopId: "s2",
      day: "2026-03-14",
      activityId: "a4",
      time: "14:00",
      cost: 25,
      location: "Amsterdam",
      activity: "Canal Tour",
    },
    {
      id: "ia5",
      stopId: "s3",
      day: "2026-03-20",
      activityId: "a5",
      time: "11:00",
      cost: 50,
      location: "Tokyo",
      activity: "Sensoji Temple",
    },
  ];

  const daysOfWeek: string[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (
    date: Date
  ): { daysInMonth: number; startingDayOfWeek: number } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(travelData.map(t => t.location))).sort();
  }, []);

  // Filter and sort travel data
  const filteredTravelData = useMemo(() => {
    let filtered = [...travelData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        trip =>
          trip.activity.toLowerCase().includes(query) ||
          trip.location.toLowerCase().includes(query) ||
          trip.day.includes(query)
      );
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(trip => trip.location === selectedLocation);
    }

    // Cost filter
    filtered = filtered.filter(trip => trip.cost >= minCost && trip.cost <= maxCost);

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.cost - a.cost;
        case 'location':
          return a.location.localeCompare(b.location);
        case 'activity':
          return a.activity.localeCompare(b.activity);
        case 'date':
        default:
          return a.day.localeCompare(b.day);
      }
    });

    return filtered;
  }, [searchQuery, selectedLocation, minCost, maxCost, sortBy, travelData]);

  const getTravelForDate = (dateStr: string): TravelItem[] =>
    filteredTravelData.filter((trip) => trip.day === dateStr);

  const formatDate = (year: number, month: number, day: number): string => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const navigateMonth = (direction: number): void => {
    setCurrentDate((prev: Date) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendar = (): React.ReactElement[] => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const cells: JSX.Element[] = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="aspect-square p-2" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const travels = getTravelForDate(dateStr);
      const hasTravel = travels.length > 0;
      const locations = Array.from(new Set(travels.map((t) => t.location)));

      cells.push(
        <div
          key={day}
          className={`aspect-square p-2 border-2 rounded-lg relative transition-all hover:scale-105 ${
            hasTravel 
              ? "bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-50 border-blue-300 shadow-md" 
              : "bg-white border-gray-200 hover:border-blue-200"
          }`}
        >
          <div className={`text-sm font-bold ${hasTravel ? "text-blue-700" : "text-gray-700"}`}>
            {day}
          </div>

          {hasTravel && (
            <div className="mt-1 space-y-1">
              {locations.map((loc, idx) => (
                <div
                  key={loc}
                  className={`text-xs px-1.5 py-0.5 text-white rounded-md truncate flex items-center gap-1 shadow-sm ${
                    idx === 0 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                    idx === 1 ? "bg-gradient-to-r from-teal-500 to-emerald-500" :
                    "bg-gradient-to-r from-orange-500 to-amber-500"
                  }`}
                >
                  <MapPin size={10} />
                  <span className="truncate font-medium">{loc}</span>
                </div>
              ))}

              {travels.length > 1 && (
                <div className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                  <Camera size={10} />
                  {travels.length} activities
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const travelDates = Array.from(new Set(filteredTravelData.map((t) => t.day))).sort();
  const totalCost = filteredTravelData.reduce((sum, t) => sum + t.cost, 0);
  const totalActivities = filteredTravelData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 text-gray-900 p-6 relative overflow-hidden">
      {/* Decorative travel elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl -z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  GlobeTrotter
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Compass size={14} className="text-blue-500" />
                  Track your adventures around the world
                </p>
              </div>
            </div>
          </div>

          {/* Search, Filter, and Sort Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search activities, locations, or dates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 placeholder-gray-400 shadow-sm h-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter and Sort Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border-2 rounded-xl text-sm transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap ${
                  showFilters || selectedLocation !== 'all' || minCost > 0 || maxCost < 100
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                <Filter size={16} />
                Filter
                {(selectedLocation !== 'all' || minCost > 0 || maxCost < 100) && (
                  <span className="bg-white text-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  const options: ('date' | 'cost' | 'location' | 'activity')[] = ['date', 'cost', 'location', 'activity'];
                  const currentIndex = options.indexOf(sortBy);
                  setSortBy(options[(currentIndex + 1) % options.length]);
                }}
                className="px-4 py-3 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-xl text-sm transition-all text-blue-700 font-medium shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <ArrowUpDown size={16} />
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </button>
            </div>
          </div>


          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-6 bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={20} className="text-blue-500" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 bg-white"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cost Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Cost: ${minCost}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minCost}
                    onChange={(e) => setMinCost(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Cost: ${maxCost}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={maxCost}
                    onChange={(e) => setMaxCost(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedLocation('all');
                    setMinCost(0);
                    setMaxCost(100);
                  }}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-100 text-sm font-medium">Total Trips</div>
                <Luggage className="w-5 h-5 text-blue-100" />
              </div>
              <div className="text-3xl font-bold">
                {travelDates.length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl p-5 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <div className="text-teal-100 text-sm font-medium">Activities</div>
                <Camera className="w-5 h-5 text-teal-100" />
              </div>
              <div className="text-3xl font-bold">
                {totalActivities}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-5 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <div className="text-orange-100 text-sm font-medium">Total Spent</div>
                <DollarSign className="w-5 h-5 text-orange-100" />
              </div>
              <div className="text-3xl font-bold">
                ${totalCost}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-100/50 to-emerald-100/50 rounded-tr-full"></div>
          
          <div className="mb-6 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Travel Calendar
              </h2>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-2 border-2 border-blue-100">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-white rounded-lg transition-all text-blue-700 hover:shadow-md"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <Plane className="w-5 h-5 text-blue-500" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Plane className="w-5 h-5 text-cyan-500 rotate-180" />
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-white rounded-lg transition-all text-blue-700 hover:shadow-md"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-3 relative z-10">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-bold text-blue-600 py-2 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 relative z-10">{renderCalendar()}</div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-8 text-sm relative z-10 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-blue-300 rounded-lg shadow-sm"></div>
              <span className="font-medium text-blue-700">Travel day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-lg"></div>
              <span className="font-medium text-gray-600">No travel</span>
            </div>
          </div>
        </div>

        {/* Travel List */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-100/50 to-blue-100/50 rounded-bl-full"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Upcoming Adventures
            </h3>
          </div>
          
          <div className="space-y-3 relative z-10">
            {filteredTravelData.length === 0 ? (
              <div className="text-center py-12">
                <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No trips found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredTravelData.map((trip, idx) => (
              <div
                key={trip.id}
                className="flex items-center justify-between bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 p-5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform ${
                    idx % 3 === 0 ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                    idx % 3 === 1 ? "bg-gradient-to-br from-teal-500 to-emerald-500" :
                    "bg-gradient-to-br from-orange-500 to-amber-500"
                  }`}>
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {trip.activity}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Compass size={12} className="text-blue-500" />
                      {trip.location} • {trip.day} at {trip.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                  <DollarSign size={18} className="text-green-600" />
                  <span className="text-green-600 font-bold text-lg">${trip.cost}</span>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


