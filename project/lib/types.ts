export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_photo_url: string | null;
  is_public: boolean;
  total_budget: number;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string | null;
  cost_index: number;
  popularity_score: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Stop {
  id: string;
  trip_id: string;
  city_id: string;
  order_index: number;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
  city?: City;
}

export interface ActivityTemplate {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  category: string;
  estimated_cost: number;
  duration_hours: number;
  image_url: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  stop_id: string;
  activity_template_id: string | null;
  name: string;
  description: string | null;
  category: string;
  cost: number;
  duration_hours: number;
  activity_date: string;
  activity_time: string | null;
  order_index: number;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  stop_id: string | null;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activities' | 'other';
export type ActivityCategory = 'sightseeing' | 'food' | 'adventure' | 'culture' | 'shopping' | 'nightlife';
