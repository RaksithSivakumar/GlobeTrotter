/*
  # GlobalTrotters Travel Planning Schema

  ## Overview
  Complete database schema for the GlobalTrotters travel planning application,
  supporting multi-city itineraries, activities, budgets, and sharing.

  ## Tables Created

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `language` (text, default 'en')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. trips
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `cover_photo_url` (text, optional)
  - `is_public` (boolean, default false)
  - `total_budget` (numeric)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. cities (master catalog)
  - `id` (uuid, primary key)
  - `name` (text)
  - `country` (text)
  - `region` (text)
  - `cost_index` (numeric, 1-5 scale)
  - `popularity_score` (numeric)
  - `description` (text)
  - `image_url` (text)
  - `created_at` (timestamptz)

  ### 4. stops (cities in a trip)
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `city_id` (uuid, references cities)
  - `order_index` (integer)
  - `start_date` (date)
  - `end_date` (date)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 5. activity_templates (master catalog)
  - `id` (uuid, primary key)
  - `city_id` (uuid, references cities)
  - `name` (text)
  - `description` (text)
  - `category` (text: sightseeing, food, adventure, culture, shopping, nightlife)
  - `estimated_cost` (numeric)
  - `duration_hours` (numeric)
  - `image_url` (text)
  - `created_at` (timestamptz)

  ### 6. activities (planned activities in stops)
  - `id` (uuid, primary key)
  - `stop_id` (uuid, references stops)
  - `activity_template_id` (uuid, references activity_templates, optional)
  - `name` (text)
  - `description` (text)
  - `category` (text)
  - `cost` (numeric)
  - `duration_hours` (numeric)
  - `activity_date` (date)
  - `activity_time` (time)
  - `order_index` (integer)
  - `created_at` (timestamptz)

  ### 7. expenses (additional budget tracking)
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `stop_id` (uuid, references stops, optional)
  - `category` (text: transport, accommodation, food, activities, other)
  - `amount` (numeric)
  - `description` (text)
  - `expense_date` (date)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Public trips are readable by anyone
  - Master catalogs (cities, activity_templates) are readable by all authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cover_photo_url text,
  is_public boolean DEFAULT false,
  total_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create cities table (master catalog)
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  region text,
  cost_index numeric DEFAULT 3,
  popularity_score numeric DEFAULT 0,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- Create stops table
CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  city_id uuid REFERENCES cities(id) NOT NULL,
  order_index integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stops for their trips"
  ON stops FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert stops for their trips"
  ON stops FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stops for their trips"
  ON stops FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stops for their trips"
  ON stops FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create activity_templates table (master catalog)
CREATE TABLE IF NOT EXISTS activity_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  duration_hours numeric DEFAULT 2,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity templates"
  ON activity_templates FOR SELECT
  TO authenticated
  USING (true);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid REFERENCES stops(id) ON DELETE CASCADE NOT NULL,
  activity_template_id uuid REFERENCES activity_templates(id),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  cost numeric DEFAULT 0,
  duration_hours numeric DEFAULT 2,
  activity_date date NOT NULL,
  activity_time time,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for their trips"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = activities.stop_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert activities for their trips"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities for their trips"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = activities.stop_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities for their trips"
  ON activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stops
      JOIN trips ON trips.id = stops.trip_id
      WHERE stops.id = activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  stop_id uuid REFERENCES stops(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL,
  description text,
  expense_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses for their trips"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert expenses for their trips"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses for their trips"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses for their trips"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_stops_trip_id ON stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_stop_id ON activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_activity_templates_city_id ON activity_templates(city_id);

-- Insert sample cities data
INSERT INTO cities (name, country, region, cost_index, popularity_score, description, image_url) VALUES
  ('Paris', 'France', 'Europe', 4, 95, 'The City of Light, famous for art, culture, and romance', 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg'),
  ('Tokyo', 'Japan', 'Asia', 4, 90, 'A vibrant blend of traditional and modern culture', 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg'),
  ('New York', 'USA', 'North America', 5, 88, 'The city that never sleeps, hub of finance and culture', 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg'),
  ('Barcelona', 'Spain', 'Europe', 3, 85, 'Mediterranean charm with stunning architecture', 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg'),
  ('Bangkok', 'Thailand', 'Asia', 2, 82, 'Bustling street life and ornate temples', 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg'),
  ('London', 'UK', 'Europe', 5, 87, 'Historic capital with modern sophistication', 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg'),
  ('Dubai', 'UAE', 'Middle East', 4, 80, 'Modern luxury and desert adventures', 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg'),
  ('Rome', 'Italy', 'Europe', 3, 86, 'Ancient history meets Italian lifestyle', 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg'),
  ('Istanbul', 'Turkey', 'Europe/Asia', 2, 78, 'Where East meets West', 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg'),
  ('Amsterdam', 'Netherlands', 'Europe', 4, 75, 'Canals, culture, and vibrant nightlife', 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg'),
  ('Sydney', 'Australia', 'Oceania', 4, 79, 'Harbor city with stunning beaches', 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg'),
  ('Singapore', 'Singapore', 'Asia', 4, 77, 'Garden city with world-class dining', 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg')
ON CONFLICT DO NOTHING;

-- Insert sample activity templates
INSERT INTO activity_templates (city_id, name, description, category, estimated_cost, duration_hours, image_url)
SELECT 
  c.id,
  activities.activity_name,
  activities.activity_description,
  activities.activity_category,
  activities.activity_cost,
  activities.activity_duration,
  activities.activity_image
FROM cities c
CROSS JOIN LATERAL (
  VALUES
    ('City Landmark Visit', 'Visit the most iconic landmarks', 'sightseeing', 30, 3, 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg'),
    ('Local Food Tour', 'Taste authentic local cuisine', 'food', 80, 4, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'),
    ('Museum Visit', 'Explore art and history', 'culture', 25, 3, 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg'),
    ('City Walking Tour', 'Discover hidden gems on foot', 'sightseeing', 20, 2.5, 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg'),
    ('Shopping District', 'Browse local markets and shops', 'shopping', 50, 3, 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg'),
    ('Evening Entertainment', 'Experience local nightlife', 'nightlife', 65, 3, 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg')
) AS activities(activity_name, activity_description, activity_category, activity_cost, activity_duration, activity_image)
ON CONFLICT DO NOTHING;
