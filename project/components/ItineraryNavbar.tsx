'use client';

interface ItineraryNavbarProps {
  onSave: () => void;
}

export default function ItineraryNavbar({ onSave }: ItineraryNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold text-gray-900">
            🌍 Itinerary Planner
          </h1>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
          >
            Save Trip
          </button>
        </div>
      </div>
    </nav>
  );
}

