'use client';

import { ItinerarySectionData } from '@/lib/tempStorage';
import { 
  Plane, 
  Hotel, 
  Utensils, 
  MapPin, 
  Calendar, 
  DollarSign,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Circle
} from 'lucide-react';
import { format, parseISO, isBefore, isAfter, isWithinInterval } from 'date-fns';

export type SectionStatus = 'upcoming' | 'active' | 'completed';

interface TimelineSectionProps {
  section: ItinerarySectionData;
  index: number;
  isLast: boolean;
  status: SectionStatus;
  onEdit: (section: ItinerarySectionData) => void;
  onDelete: (id: string) => void;
}

const typeIcons = {
  travel: Plane,
  hotel: Hotel,
  activity: MapPin,
  food: Utensils,
};

const typeColors = {
  travel: 'bg-blue-100 text-blue-600',
  hotel: 'bg-purple-100 text-purple-600',
  activity: 'bg-indigo-100 text-indigo-600',
  food: 'bg-orange-100 text-orange-600',
};

const statusColors = {
  upcoming: 'bg-gray-100 text-gray-600 border-gray-300',
  active: 'bg-indigo-100 text-indigo-600 border-indigo-400 ring-2 ring-indigo-200',
  completed: 'bg-green-100 text-green-600 border-green-300',
};

const statusIcons = {
  upcoming: Clock,
  active: Circle,
  completed: CheckCircle2,
};

export default function TimelineSection({
  section,
  index,
  isLast,
  status,
  onEdit,
  onDelete,
}: TimelineSectionProps) {
  const sectionType = section.type || 'activity';
  const IconComponent = typeIcons[sectionType] || MapPin;
  const StatusIcon = statusIcons[status];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative flex gap-6">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon Circle */}
      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${typeColors[sectionType]} flex items-center justify-center border-2 border-white shadow-sm`}>
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Content Card */}
      <div className={`flex-1 mb-8 bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
        status === 'active' ? 'border-indigo-300 shadow-md' : 'border-gray-100'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title || `Section ${index + 1}`}
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[status]} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              {section.description && (
                <p className="text-sm text-gray-600 mt-2">{section.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(section)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit section"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(section.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Start</div>
                <div>{formatDate(section.startDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">End</div>
                <div>{formatDate(section.endDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Budget</div>
                <div>${parseFloat(section.budget || '0').toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

