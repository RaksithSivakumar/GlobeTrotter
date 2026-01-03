'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { City } from '@/lib/types';
import { Search, MapPin, TrendingUp, DollarSign } from 'lucide-react';

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCities();
    }
  }, [user]);

  useEffect(() => {
    filterCities();
  }, [searchTerm, regionFilter, costFilter, cities]);

  const fetchCities = async () => {
    const { data } = await supabase
      .from('cities')
      .select('*')
      .order('popularity_score', { ascending: false });

    if (data) {
      setCities(data);
      setFilteredCities(data);
    }
    setLoadingData(false);
  };

  const filterCities = () => {
    let filtered = cities;

    if (searchTerm) {
      filtered = filtered.filter(
        city =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(city => city.region === regionFilter);
    }

    if (costFilter !== 'all') {
      const costValue = parseInt(costFilter);
      filtered = filtered.filter(city => city.cost_index === costValue);
    }

    setFilteredCities(filtered);
  };

  const regions = Array.from(new Set(cities.map(c => c.region).filter(Boolean)));

  const getCostLabel = (cost: number) => {
    const labels = ['', '$', '$$', '$$$', '$$$$', '$$$$$'];
    return labels[cost] || '$$$';
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Destinations</h1>
          <p className="text-gray-600">Discover amazing cities around the world</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search cities or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region!}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={costFilter} onValueChange={setCostFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Costs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Costs</SelectItem>
              <SelectItem value="1">$ - Budget</SelectItem>
              <SelectItem value="2">$$ - Affordable</SelectItem>
              <SelectItem value="3">$$$ - Moderate</SelectItem>
              <SelectItem value="4">$$$$ - Expensive</SelectItem>
              <SelectItem value="5">$$$$$ - Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map(city => (
              <Card key={city.id} className="overflow-hidden hover:shadow-2xl transition-all group cursor-pointer">
                <div className="relative h-48">
                  <img
                    src={city.image_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg'}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-white/90 text-gray-900">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {city.popularity_score}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-2xl">{city.name}</h3>
                    <p className="text-white/90 text-sm">{city.country}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {city.description || 'Explore this amazing destination'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{city.region}</span>
                    </div>
                    <div className="flex items-center text-orange-600 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">{getCostLabel(city.cost_index)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCities.length === 0 && !loadingData && (
          <Card className="text-center py-16">
            <CardContent>
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No cities found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
