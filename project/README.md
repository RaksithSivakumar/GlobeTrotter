# GlobalTrotters - Travel Planning Application

A comprehensive travel planning application built with Next.js, TypeScript, and Supabase that allows users to create customized multi-city itineraries, manage budgets, and share their travel plans.

## Features

### Core Functionality
- **User Authentication** - Secure email/password authentication with Supabase Auth
- **Trip Management** - Create, edit, delete, and organize multiple trips
- **Multi-City Itineraries** - Plan complex journeys with multiple destinations
- **Activity Planning** - Add activities to each stop with costs and durations
- **Budget Tracking** - Monitor expenses and stay within budget
- **Public Sharing** - Make trips public and share with friends
- **City Explorer** - Browse and discover popular destinations worldwide

### Key Screens

1. **Authentication** - Sign in/sign up with email and password
2. **Dashboard** - Overview of trips, budget stats, and recommendations
3. **My Trips** - Grid view of all your planned adventures
4. **Create Trip** - Form to start a new trip with dates and budget
5. **Trip Detail** - View complete itinerary with timeline and budget breakdown
6. **Trip Editor** - Add cities, activities, and customize your journey
7. **Explore** - Search and filter cities by region and cost
8. **Profile** - Manage account information
9. **Settings** - Configure language, notifications, and privacy
10. **Public Trip View** - Share-friendly view of your itineraries

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Database Schema

The application uses a relational database with the following tables:

- **profiles** - User profiles linked to auth.users
- **trips** - Trip information with dates and budgets
- **cities** - Master catalog of destinations
- **stops** - Cities included in each trip
- **activity_templates** - Catalog of activities per city
- **activities** - Planned activities for each stop
- **expenses** - Additional expense tracking

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd globaltrotters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**

   - Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**

   The database schema has already been created. Supabase will automatically set up:
   - All tables (profiles, trips, cities, stops, activities, etc.)
   - Row Level Security policies
   - Sample city and activity data

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/tmp/cc-agent/62126151/project/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── trips/            # Trip management pages
│   │   ├── create/       # Create new trip
│   │   └── [id]/         # Trip detail and edit
│   ├── explore/          # City explorer
│   ├── profile/          # User profile
│   ├── settings/         # App settings
│   └── public/           # Public trip views
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── AuthForm.tsx      # Authentication component
│   └── Navbar.tsx        # Navigation bar
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility files
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Design Philosophy

The application follows modern design principles:

- **Clean & Professional** - Gradient-based color scheme (orange to cyan)
- **Responsive** - Works seamlessly on desktop, tablet, and mobile
- **Accessible** - Proper ARIA labels and keyboard navigation
- **Intuitive** - Clear visual hierarchy and user flows
- **Fast** - Optimized with Next.js SSR and client-side routing

## Key Features Explained

### Trip Planning Flow
1. Create a trip with name, dates, and budget
2. Add stops (cities) in your desired order
3. Add activities to each stop
4. View the complete itinerary with timeline
5. Track your budget and expenses
6. Share publicly or keep private

### Budget Management
- Set total trip budget
- Track activity costs automatically
- Add custom expenses
- View breakdown by category
- Monitor remaining budget

### Public Sharing
- Toggle trips to public
- Generate shareable URLs
- Read-only view for viewers
- Copy trip functionality for inspiration

## Development

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Security

- All database access protected by Row Level Security (RLS)
- Users can only access their own data
- Public trips are read-only for non-owners
- Authentication required for all write operations
- Environment variables for sensitive data

## Future Enhancements

- Mobile app version
- Collaborative trip planning
- Integration with booking platforms
- Weather information
- Currency conversion
- Travel insurance recommendations
- Packing list generator
- Photo gallery per trip
- Trip templates

## License

This project is for demonstration purposes.

## Support

For issues or questions, please open an issue on the repository.

---

Built with love for travelers around the world.
