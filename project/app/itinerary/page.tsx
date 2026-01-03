'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ItineraryNavbar from '@/components/ItineraryNavbar';
import ItinerarySection from '@/components/ItinerarySection';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/lib/types';
import { 
  getTempTrip, 
  saveTempTrip, 
  initializeTempStorage,
  saveItinerarySections,
  getItinerarySections,
  type ItinerarySectionData
} from '@/lib/tempStorage';
import { toast } from 'sonner';

function ItineraryPlannerContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [sections, setSections] = useState<ItinerarySectionData[]>([
    {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: '',
      type: 'activity' as const,
    },
  ]);

  const loadTripData = useCallback(async () => {
    if (!tripId) return;
    
    setLoadingTrip(true);
    try {
      let tripData: Trip | null = null;
      
      // Check if it's a temporary trip (starts with 'temp-' or 'mock-')
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
        
        // Try to load saved sections first
        const savedSections = getItinerarySections(tripId);
        
        if (savedSections && savedSections.length > 0) {
          // Load saved sections
          setSections(savedSections);
        } else {
          // Pre-populate with trip data if no saved sections
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
      setLoadingTrip(false);
    }
  }, [tripId]);

  useEffect(() => {
    // Initialize temp storage
    initializeTempStorage();
    
    if (tripId) {
      loadTripData();
    } else {
      // Load draft sections if no tripId
      const draftSections = getItinerarySections('draft-itinerary');
      if (draftSections && draftSections.length > 0) {
        setSections(draftSections);
      }
    }
  }, [tripId, loadTripData]);

  // Auto-save sections to localStorage whenever they change
  useEffect(() => {
    const currentTripId = tripId || 'draft-itinerary';
    if (sections.length > 0) {
      // Debounce the save to avoid too many writes
      const timeoutId = setTimeout(() => {
        saveItinerarySections(currentTripId, sections);
      }, 500); // Save 500ms after last change

      return () => clearTimeout(timeoutId);
    }
  }, [sections, tripId]);

  const handleAddSection = () => {
    const newSection: ItinerarySectionData = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: '',
      type: 'activity',
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    
    // Save immediately
    const currentTripId = tripId || 'draft-itinerary';
    saveItinerarySections(currentTripId, newSections);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length > 1) {
      const newSections = sections.filter((section) => section.id !== id);
      setSections(newSections);
      
      // Save immediately
      const currentTripId = tripId || 'draft-itinerary';
      saveItinerarySections(currentTripId, newSections);
    }
  };

  const handleUpdateSection = (
    id: string,
    field: keyof ItinerarySectionData,
    value: string
  ) => {
    const newSections = sections.map((section) => {
      if (section.id === id) {
        // Type guard for the 'type' field
        if (field === 'type') {
          const typeValue = value as 'travel' | 'hotel' | 'activity' | 'food';
          return { ...section, [field]: typeValue };
        }
        return { ...section, [field]: value };
      }
      return section;
    });
    setSections(newSections);
    
    // Auto-save is handled by useEffect, but we can also save immediately for critical updates
    const currentTripId = tripId || 'draft-itinerary';
    saveItinerarySections(currentTripId, newSections);
  };

  const handleSave = async () => {
    try {
      if (tripId && trip) {
        const updatedTrip: Trip = {
          ...trip,
          name: sections[0]?.title || trip.name,
          description: sections[0]?.description || trip.description,
          start_date: sections[0]?.startDate || trip.start_date,
          end_date: sections[0]?.endDate || trip.end_date,
          total_budget: sections[0]?.budget ? parseFloat(sections[0].budget) : trip.total_budget,
          updated_at: new Date().toISOString(),
        };

        // Save sections
        saveItinerarySections(tripId, sections);
        
        // Check if it's a temporary trip
        if (tripId.startsWith('temp-') || tripId.startsWith('mock-')) {
          // Save to temporary storage
          saveTempTrip(updatedTrip);
          toast.success('Trip itinerary updated successfully! (Saved temporarily)');
        } else {
          // Update in Supabase
          const { error } = await supabase
            .from('trips')
            .update({
              name: updatedTrip.name,
              description: updatedTrip.description,
              start_date: updatedTrip.start_date,
              end_date: updatedTrip.end_date,
              total_budget: updatedTrip.total_budget,
              updated_at: updatedTrip.updated_at,
            })
            .eq('id', tripId);

          if (error) throw error;
          toast.success('Trip itinerary updated successfully!');
        }
      } else {
        // Save as new trip to temporary storage
        const newTripId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTrip: Trip = {
          id: newTripId,
          user_id: 'temp-user',
          name: sections[0]?.title || 'New Trip',
          description: sections[0]?.description || null,
          start_date: sections[0]?.startDate || new Date().toISOString(),
          end_date: sections[0]?.endDate || new Date().toISOString(),
          total_budget: sections[0]?.budget ? parseFloat(sections[0].budget) : 0,
          cover_photo_url: null,
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        saveTempTrip(newTrip);
        // Save sections for the new trip
        saveItinerarySections(newTripId, sections);
        toast.success('Itinerary saved! (Saved temporarily)');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error('Failed to save trip');
    }
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ItineraryNavbar onSave={handleSave} />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <ItinerarySection
                key={section.id}
                section={section}
                index={index}
                onUpdate={handleUpdateSection}
                onRemove={handleRemoveSection}
                canRemove={sections.length > 1}
              />
            ))}

            <button
              onClick={handleAddSection}
              className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl font-medium hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              + Add another Section
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ItineraryPlanner() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ItineraryPlannerContent />
    </Suspense>
  );
}

