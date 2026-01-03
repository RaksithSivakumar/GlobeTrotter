'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, User, Mail, MapPin, Globe, FileText, Calendar, Star, Plane, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Helper function to get user data from localStorage or use defaults
const getUserDataFromStorage = () => {
  try {
    const storedData = localStorage.getItem('globetrotter_user_data');
    const storedProfile = localStorage.getItem('globetrotter_profile');
    
    if (storedData && storedProfile) {
      const userData = JSON.parse(storedData);
      const profile = JSON.parse(storedProfile);
      
      return {
        fullName: userData.fullName || profile.full_name || 'User',
        email: userData.email || profile.email || '',
        city: userData.city || '',
        country: userData.country || '',
        aboutMe: userData.additionalInfo || 'Passionate traveler exploring the world one destination at a time. Love adventure, culture, and meeting new people.',
        avatarUrl: userData.avatarUrl || profile.avatar_url || '',
        memberSince: new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
    }
  } catch (error) {
    console.error('Error loading user data from storage:', error);
  }
  
  // Default fallback data
  return {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    city: 'San Francisco',
    country: 'United States',
    aboutMe: 'Passionate traveler exploring the world one destination at a time. Love adventure, culture, and meeting new people.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    memberSince: 'January 2023',
  };
};

// Mock statistics
const userStats = {
  totalTrips: 8,
  upcomingTrips: 3,
  completedTrips: 5,
  totalBudget: 24500,
  countriesVisited: 12,
  citiesExplored: 24,
};

const upcomingTrips = [
  {
    id: 1,
    name: 'European Adventure',
    dateRange: 'Jun 15 - Jul 2, 2024',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    name: 'Tokyo Discovery',
    dateRange: 'Aug 10 - Aug 25, 2024',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    name: 'Iceland Exploration',
    dateRange: 'Sep 5 - Sep 18, 2024',
    image: 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=800&h=600&fit=crop',
  },
];

const previousTrips = [
  {
    id: 1,
    name: 'Bali Paradise',
    dateRange: 'Mar 20 - Apr 5, 2024',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
    rating: 5,
  },
  {
    id: 2,
    name: 'New York City',
    dateRange: 'Dec 15 - Dec 22, 2023',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    rating: 4,
  },
  {
    id: 3,
    name: 'Paris Romance',
    dateRange: 'Oct 1 - Oct 10, 2023',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ProfilePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userData, setUserData] = useState(() => getUserDataFromStorage());
  const [editedData, setEditedData] = useState(() => getUserDataFromStorage());

  const handleOpenDialog = () => {
    setEditedData(userData);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditedData(userData); // Reset to original data
    setIsDialogOpen(false);
  };

  const handleSave = () => {
    setUserData(editedData);
    
    // Update localStorage with new data
    try {
      const storedData = localStorage.getItem('globetrotter_user_data');
      if (storedData) {
        const userDataObj = JSON.parse(storedData);
        const updatedData = {
          ...userDataObj,
          fullName: editedData.fullName,
          city: editedData.city,
          country: editedData.country,
          avatarUrl: editedData.avatarUrl,
          additionalInfo: editedData.aboutMe,
        };
        localStorage.setItem('globetrotter_user_data', JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
    
    setIsDialogOpen(false);
    // In a real app, you would make an API call here
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-indigo-100">
                      <AvatarImage 
                        src={userData.avatarUrl} 
                        alt={userData.fullName}
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = '';
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-blue-500 text-white text-4xl font-semibold">
                        {userData.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* User Info Section */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {userData.fullName}
                      </h1>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">
                            {userData.city}, {userData.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">Member since {userData.memberSince}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        onClick={handleOpenDialog}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Note: On smaller screens, stats will stack in 2 columns, then 3 on medium, and 6 on large */}
                {/* Total Trips */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 text-center">
                  <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-indigo-900 mb-1">
                    {userStats.totalTrips}
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">Total Trips</div>
                </div>

                {/* Upcoming Trips */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center">
                  <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    {userStats.upcomingTrips}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Upcoming</div>
                </div>

                {/* Completed Trips */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center">
                  <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {userStats.completedTrips}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Completed</div>
                </div>

                {/* Total Budget */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center">
                  <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    ${(userStats.totalBudget / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Total Budget</div>
                </div>

                {/* Countries Visited */}
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 text-center">
                  <div className="bg-cyan-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-cyan-900 mb-1">
                    {userStats.countriesVisited}
                  </div>
                  <div className="text-sm text-cyan-700 font-medium">Countries</div>
                </div>

                {/* Cities Explored */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center">
                  <div className="bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-900 mb-1">
                    {userStats.citiesExplored}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Cities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Member Since */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="h-4 w-4" />
                    Member Since
                  </Label>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded-md">
                    {userData.memberSince}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded-md">
                    {userData.city}, {userData.country}
                  </div>
                </div>

                {/* About Me */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="aboutMe" className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4" />
                    About Me
                  </Label>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-md min-h-[120px]">
                    {userData.aboutMe}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Profile Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          } else {
            setIsDialogOpen(true);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information. Changes will be reflected immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-4 ring-indigo-100">
                  <AvatarImage 
                    src={editedData.avatarUrl} 
                    alt={editedData.fullName}
                    onError={(e) => {
                      e.currentTarget.src = '';
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-blue-500 text-white text-3xl font-semibold">
                    {editedData.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                  <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Photo URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={editedData.avatarUrl}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a publicly accessible image URL. The avatar preview updates automatically.
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={editedData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Location - City and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </Label>
                  <Input
                    id="city"
                    value={editedData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={editedData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* About Me */}
              <div className="space-y-2">
                <Label htmlFor="aboutMe" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  About Me
                </Label>
                <Textarea
                  id="aboutMe"
                  value={editedData.aboutMe}
                  onChange={(e) => handleChange('aboutMe', e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseDialog}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upcoming Trips Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-0 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 shadow-lg">
                      Upcoming
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{trip.dateRange}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      View Trip
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Previous Trips Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Previous Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-0 h-full opacity-90">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 grayscale-[30%]"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-gray-500 text-white border-0 shadow-lg">
                      Completed
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{trip.dateRange}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < trip.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      View Trip
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

