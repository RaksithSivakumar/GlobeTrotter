'use client';

interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
}

interface ItinerarySectionProps {
  section: ItinerarySection;
  index: number;
  onUpdate: (id: string, field: keyof ItinerarySection, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export default function ItinerarySection({
  section,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: ItinerarySectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Section {index + 1}
        </h3>
        {canRemove && (
          <button
            onClick={() => onRemove(section.id)}
            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
          placeholder="Enter section title"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Itinerary Description
        </label>
        <textarea
          value={section.description}
          onChange={(e) => onUpdate(section.id, 'description', e.target.value)}
          placeholder="Describe your itinerary for this section..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={section.startDate}
            onChange={(e) => onUpdate(section.id, 'startDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={section.endDate}
            onChange={(e) => onUpdate(section.id, 'endDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Budget
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={section.budget}
            onChange={(e) => onUpdate(section.id, 'budget', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}

