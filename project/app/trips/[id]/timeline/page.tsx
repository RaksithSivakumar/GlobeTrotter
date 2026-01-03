'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getTempTrip, 
  getItinerarySections, 
  saveItinerarySections,
  initializeTempStorage,
  type ItinerarySectionData 
} from '@/lib/tempStorage';
import { Trip } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import TimelineSection, { SectionStatus } from '@/components/TimelineSection';
import { 
  ArrowLeft, 
  Edit, 
  Calendar,
  DollarSign,
  Search,
  Filter,
  SortAsc,
  Globe
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { saveTempTrip } from '@/lib/tempStorage';
import { toast } from 'sonner';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function TripTimelineContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [sections, setSections] = useState<ItinerarySectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ItinerarySectionData | null>(null);
  const [editForm, setEditForm] = useState<ItinerarySectionData | null>(null);

  const togglePublic = async (checked: boolean) => {
    if (!trip) return;
    
    try {
      const updatedTrip = { ...trip, is_public: checked };
      
      // Try to update in Supabase first
      if (user && !trip.id.startsWith('temp-') && !trip.id.startsWith('mock-')) {
        const { error } = await supabase
          .from('trips')
          .update({ is_public: checked })
          .eq('id', trip.id);

        if (error) throw error;
      }
      
      // Update in temporary storage
      saveTempTrip(updatedTrip);
      setTrip(updatedTrip);
      
      toast.success(checked ? 'Trip is now public' : 'Trip is now private');
    } catch (error) {
      console.error('Error updating trip visibility:', error);
      toast.error('Failed to update trip visibility');
    }
  };

  useEffect(() => {
    initializeTempStorage();
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    setLoading(true);
    try {
      let tripData: Trip | null = null;

      // Check if it's a temporary trip
      if (tripId.startsWith('temp-') || tripId.startsWith('mock-')) {
        tripData = getTempTrip(tripId);
      } else {
        // Try to load from Supabase
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();

        if (!error && data) {
          tripData = data;
        }
      }

      if (tripData) {
        setTrip(tripData);
        
        // Load sections
        const savedSections = getItinerarySections(tripId);
        if (savedSections && savedSections.length > 0) {
          setSections(savedSections);
        } else {
          // Create default section from trip data
          const defaultSection: ItinerarySectionData = {
            id: crypto.randomUUID(),
            title: tripData.name || '',
            description: tripData.description || '',
            startDate: tripData.start_date ? tripData.start_date.split('T')[0] : '',
            endDate: tripData.end_date ? tripData.end_date.split('T')[0] : '',
            budget: tripData.total_budget ? tripData.total_budget.toString() : '',
            type: 'activity',
          };
          setSections([defaultSection]);
        }
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      toast.error('Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  // Sort sections by startDate
  const sortedSections = [...sections].sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Filter sections by search query
  const filteredSections = sortedSections.filter(section => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title?.toLowerCase().includes(query) ||
      section.description?.toLowerCase().includes(query) ||
      section.type?.toLowerCase().includes(query)
    );
  });

  // Calculate section status
  const getSectionStatus = (section: ItinerarySectionData): SectionStatus => {
    if (!section.startDate || !section.endDate) return 'upcoming';
    
    try {
      const now = new Date();
      const start = parseISO(section.startDate);
      const end = parseISO(section.endDate);
      
      if (isBefore(now, start)) {
        return 'upcoming';
      } else if (isAfter(now, end)) {
        return 'completed';
      } else {
        return 'active';
      }
    } catch {
      return 'upcoming';
    }
  };

  const handleEdit = (section: ItinerarySectionData) => {
    setSelectedSection(section);
    setEditForm({ ...section });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm || !selectedSection) return;

    const updatedSections = sections.map(s => 
      s.id === selectedSection.id ? editForm : s
    );
    
    setSections(updatedSections);
    saveItinerarySections(tripId, updatedSections);
    setEditDialogOpen(false);
    setSelectedSection(null);
    toast.success('Section updated successfully');
  };

  const handleDelete = (id: string) => {
    const sectionToDelete = sections.find(s => s.id === id);
    if (sectionToDelete) {
      setSelectedSection(sectionToDelete);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!selectedSection) return;

    const updatedSections = sections.filter(s => s.id !== selectedSection.id);
    setSections(updatedSections);
    saveItinerarySections(tripId, updatedSections);
    setDeleteDialogOpen(false);
    setSelectedSection(null);
    toast.success('Section deleted successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trip not found</h2>
          <Link href="/trips">
            <Button>Back to Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalBudget = sections.reduce((sum, s) => sum + parseFloat(s.budget || '0'), 0);
  const activeSection = filteredSections.find(s => getSectionStatus(s) === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/trips">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{trip.name}</h1>
                <p className="text-xs text-gray-500">Itinerary Timeline</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Globe className="w-4 h-4 text-slate-600" />
                <Label htmlFor="public-toggle" className="text-sm text-slate-700 cursor-pointer">
                  {trip.is_public ? 'Public' : 'Private'}
                </Label>
                <Switch
                  id="public-toggle"
                  checked={trip.is_public || false}
                  onCheckedChange={togglePublic}
                />
              </div>
              <Link href={`/itinerary?tripId=${tripId}`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Itinerary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-sm text-gray-500">Trip Dates</div>
                <div className="font-medium text-gray-900">
                  {trip.start_date ? format(parseISO(trip.start_date), 'MMM d') : 'Not set'} - {trip.end_date ? format(parseISO(trip.end_date), 'MMM d, yyyy') : 'Not set'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-sm text-gray-500">Total Budget</div>
                <div className="font-medium text-gray-900">${totalBudget.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sections</div>
                <div className="font-medium text-gray-900">{sections.length} planned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No sections found</p>
              <Link href={`/itinerary?tripId=${tripId}`}>
                <Button>Create First Section</Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              {filteredSections.map((section, index) => (
                <TimelineSection
                  key={section.id}
                  section={section}
                  index={index}
                  isLast={index === filteredSections.length - 1}
                  status={getSectionStatus(section)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>Update the section details</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={editForm.type || 'activity'}
                    onValueChange={(value: 'travel' | 'hotel' | 'activity' | 'food') => 
                      setEditForm({ ...editForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSection?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function TripTimelinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <TripTimelineContent />
    </Suspense>
  );
}

