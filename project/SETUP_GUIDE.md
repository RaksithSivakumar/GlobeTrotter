# GlobalTrotters Setup Guide

## Quick Start

Your GlobalTrotters travel planning application is ready! Follow these steps to get it running:

### 1. Configure Supabase

The database schema has already been created in Supabase. Now you just need to connect your app:

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project or use an existing one
3. Navigate to **Settings** > **API**
4. Copy your **Project URL** and **anon/public key**

### 2. Update Environment Variables

Open `.env.local` and replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 3. Install Dependencies (if not already done)

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## What's Included

Your application now has:

### Complete Feature Set
- ✅ User Authentication (Sign up/Sign in)
- ✅ Dashboard with trip overview and stats
- ✅ Trip creation and management
- ✅ Multi-city itinerary builder
- ✅ Activity planning for each destination
- ✅ Budget tracking and expense management
- ✅ City explorer with search and filters
- ✅ Public trip sharing
- ✅ User profile management
- ✅ Settings and preferences

### Database Schema
All tables created with Row Level Security:
- `profiles` - User accounts
- `trips` - Trip information
- `cities` - Destination catalog (pre-populated with 12 cities)
- `stops` - Cities in each trip
- `activities` - Planned activities
- `activity_templates` - Activity suggestions per city
- `expenses` - Budget tracking

### Beautiful UI
- Modern gradient design (orange to cyan)
- Fully responsive (mobile, tablet, desktop)
- Professional components from shadcn/ui
- Smooth animations and transitions
- Accessible and intuitive

## First Steps After Setup

1. **Create an Account**: Sign up with email and password
2. **Explore Cities**: Browse the pre-populated destinations
3. **Plan a Trip**: Create your first trip with dates and budget
4. **Add Stops**: Select cities for your itinerary
5. **Add Activities**: Choose from suggested activities or create custom ones
6. **Share**: Make your trip public and share the link!

## Features in Detail

### Authentication
- Secure email/password authentication
- Automatic profile creation
- Session management
- Protected routes

### Trip Management
- Create unlimited trips
- Set start/end dates
- Define budgets
- Add cover photos
- Toggle public/private

### Itinerary Builder
- Add multiple cities (stops)
- Order cities in sequence
- Set dates for each stop
- Add detailed notes

### Activity Planning
- Browse activity templates per city
- Add activities with costs and durations
- Schedule by date and time
- Categorize (sightseeing, food, adventure, etc.)

### Budget Tracking
- Automatic cost calculation from activities
- Add custom expenses
- Category-based breakdown
- Visual budget overview
- Track remaining budget

### City Explorer
- Search by name or country
- Filter by region
- Filter by cost index
- View popularity scores
- Rich city information

### Public Sharing
- Toggle trips to public
- Shareable URLs
- Read-only view for non-owners
- "Copy Trip" feature for inspiration

## Technical Stack

- **Frontend**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Icons**: Lucide React

## Troubleshooting

### Build Warnings
The application may show some pre-rendering warnings during build. These are expected for authenticated pages and won't affect functionality.

### Can't Sign In/Up
Make sure your Supabase environment variables are correct in `.env.local`.

### No Cities Showing
The database migration should have added sample cities. If not, they'll be added when you first sign in.

### Styling Issues
Clear your browser cache and restart the dev server with `npm run dev`.

## Production Deployment

When ready to deploy:

1. Set environment variables in your hosting platform
2. Run `npm run build` to create production build
3. Deploy the `.next` folder
4. Ensure Supabase URL is accessible from your domain

### Recommended Hosts
- Vercel (optimal for Next.js)
- Netlify
- Railway
- Render

## Support & Documentation

- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Tailwind Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)

## Next Steps

Consider adding:
- Email notifications for upcoming trips
- Weather information per city
- Currency conversion
- Integration with booking platforms
- Photo uploads for trips
- Collaborative trip planning
- Mobile app version

---

Happy travels! 🌍✈️
