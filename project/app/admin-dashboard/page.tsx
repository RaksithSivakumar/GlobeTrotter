'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Users, 
  MapPin, 
  TrendingUp, 
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  DollarSign,
  Globe
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as RechartsLineChart, Line } from 'recharts';

type ActiveTab = 'users' | 'cities' | 'activities' | 'analytics';

interface User {
  id: string;
  name: string;
  email: string;
  tripsCount: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface PopularCity {
  id: string;
  name: string;
  country: string;
  visits: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface PopularActivity {
  id: string;
  name: string;
  category: string;
  participants: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export default function AdminDashboard() {
  const { user, profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, loading, router]);

  // Show loading while checking auth
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Sample data
  const users: User[] = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', tripsCount: 5, totalSpent: 3500, joinDate: '2025-01-15', status: 'active' },
    { id: '2', name: 'Mike Chen', email: 'mike@example.com', tripsCount: 3, totalSpent: 2200, joinDate: '2025-02-20', status: 'active' },
    { id: '3', name: 'Emma Wilson', email: 'emma@example.com', tripsCount: 8, totalSpent: 5800, joinDate: '2024-12-10', status: 'active' },
    { id: '4', name: 'David Brown', email: 'david@example.com', tripsCount: 2, totalSpent: 1500, joinDate: '2025-03-01', status: 'inactive' },
    { id: '5', name: 'Lisa Anderson', email: 'lisa@example.com', tripsCount: 6, totalSpent: 4200, joinDate: '2025-01-28', status: 'active' },
  ];

  const popularCities: PopularCity[] = [
    { id: '1', name: 'Paris', country: 'France', visits: 245, trend: 'up', percentage: 28.5 },
    { id: '2', name: 'Tokyo', country: 'Japan', visits: 189, trend: 'up', percentage: 22.0 },
    { id: '3', name: 'Amsterdam', country: 'Netherlands', visits: 156, trend: 'stable', percentage: 18.1 },
    { id: '4', name: 'New York', country: 'USA', visits: 134, trend: 'down', percentage: 15.6 },
    { id: '5', name: 'Barcelona', country: 'Spain', visits: 98, trend: 'up', percentage: 11.4 },
    { id: '6', name: 'Dubai', country: 'UAE', visits: 87, trend: 'up', percentage: 10.1 },
  ];

  const popularActivities: PopularActivity[] = [
    { id: '1', name: 'Museum Visits', category: 'Culture', participants: 342, trend: 'up', percentage: 32.5 },
    { id: '2', name: 'City Tours', category: 'Sightseeing', participants: 298, trend: 'up', percentage: 28.3 },
    { id: '3', name: 'Food Tours', category: 'Food', participants: 267, trend: 'stable', percentage: 25.4 },
    { id: '4', name: 'Adventure Sports', category: 'Adventure', participants: 189, trend: 'up', percentage: 18.0 },
    { id: '5', name: 'Nightlife', category: 'Entertainment', participants: 156, trend: 'down', percentage: 14.8 },
  ];

  // Analytics data
  const pieData = [
    { name: 'Active Users', value: 68, color: '#3b82f6' },
    { name: 'Inactive Users', value: 32, color: '#10b981' },
  ];

  const lineData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 145 },
    { month: 'Mar', users: 132 },
    { month: 'Apr', users: 168 },
    { month: 'May', users: 189 },
  ];

  const barData = [
    { category: 'Trips', value: 450 },
    { category: 'Activities', value: 320 },
    { category: 'Cities', value: 280 },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredCities = useMemo(() => {
    return popularCities.filter(city =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredActivities = useMemo(() => {
    return popularActivities.filter(activity =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-600">Manage users, view trends, and analyze data</p>
        </div>

        {/* Search and Action Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search bar ......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Group by
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort by...
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {[
            { id: 'users' as ActiveTab, label: 'Manage Users', icon: Users },
            { id: 'cities' as ActiveTab, label: 'Popular Cities', icon: MapPin },
            { id: 'activities' as ActiveTab, label: 'Popular Activities', icon: Activity },
            { id: 'analytics' as ActiveTab, label: 'User Trends and Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'users' && <ManageUsersSection users={filteredUsers} />}
            {activeTab === 'cities' && <PopularCitiesSection cities={filteredCities} />}
            {activeTab === 'activities' && <PopularActivitiesSection activities={filteredActivities} />}
            {activeTab === 'analytics' && <AnalyticsSection pieData={pieData} lineData={lineData} barData={barData} />}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                {activeTab === 'users' && (
                  <>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Manage</p>
                      <p>This Section is responsible for managing the users and their actions.</p>
                      <p className="mt-2">This section gives the admin access to view all trips made by the user. Also other functionalities are welcome.</p>
                    </div>
                  </>
                )}
                {activeTab === 'cities' && (
                  <>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Popular Cities</p>
                      <p>Lists all the popular cities where the users are visiting based on the current user trends.</p>
                    </div>
                  </>
                )}
                {activeTab === 'activities' && (
                  <>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Popular Activities</p>
                      <p>List all the popular activities that the users are doing based on the current user trend data.</p>
                    </div>
                  </>
                )}
                {activeTab === 'analytics' && (
                  <>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">User Trends</p>
                      <p>This section will major focus on providing analysis across various points and give useful information to the user.</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function ManageUsersSection({ users }: { users: User[] }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Manage Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.tripsCount} trips
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${user.totalSpent}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PopularCitiesSection({ cities }: { cities: PopularCity[] }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Popular Cities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cities.map((city, index) => (
            <div
              key={city.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{city.name}</h3>
                    <p className="text-sm text-gray-600">{city.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{city.visits}</div>
                  <div className="text-xs text-gray-500">visits</div>
                  <div className={`flex items-center gap-1 mt-1 ${
                    city.trend === 'up' ? 'text-green-600' :
                    city.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${city.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span className="text-xs">{city.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PopularActivitiesSection({ activities }: { activities: PopularActivity[] }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Popular Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                    <p className="text-sm text-gray-600">{activity.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{activity.participants}</div>
                  <div className="text-xs text-gray-500">participants</div>
                  <div className={`flex items-center gap-1 mt-1 ${
                    activity.trend === 'up' ? 'text-green-600' :
                    activity.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${activity.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span className="text-xs">{activity.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSection({ 
  pieData, 
  lineData, 
  barData 
}: { 
  pieData: { name: string; value: number; color: string }[];
  lineData: { month: string; users: number }[];
  barData: { category: string; value: number }[];
}) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          User Trends and Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4">User Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4">User Growth Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 5 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4">Activity Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats List */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4">Key Metrics</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Users', value: '1,234', trend: '+12%' },
                { label: 'Active Trips', value: '456', trend: '+8%' },
                { label: 'Total Revenue', value: '$89K', trend: '+15%' },
                { label: 'Avg Trip Cost', value: '$1,250', trend: '+5%' },
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="text-gray-600 text-sm">{metric.label}</p>
                    <p className="text-gray-900 font-bold text-lg">{metric.value}</p>
                  </div>
                  <span className="text-green-600 text-sm font-semibold">{metric.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}