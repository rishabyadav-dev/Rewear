# Clothing Swap Marketplace

A modern Next.js application for swapping clothing items between users. Built with TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

## Features

- 🛍️ **Item Listings**: Create and browse clothing items for swap
- 💰 **Points System**: Swap items using points or direct trades
- 👥 **User Profiles**: User ratings, reviews, and profiles
- 🔍 **Advanced Search**: Filter by category, condition, size, and more
- 💬 **Messaging**: Communicate with other users about trades
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Modern UI**: Built with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js v5
- **Real-time**: Socket.io (planned)

## Database Schema

The application uses Prisma with PostgreSQL and includes the following models:

### Core Models
- **User**: User profiles with ratings, points, and preferences
- **Listing**: Clothing items with details, images, and swap options
- **Category**: Product categories (Men's, Women's, Kids', etc.)
- **Transaction**: Swap transactions between users
- **Message**: Communication between users
- **Review**: User reviews and ratings

### Supporting Models
- **ListingImage**: Multiple images per listing
- **Tag**: Searchable tags for listings
- **Favorite**: User favorites/bookmarks

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clothing-swap-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/clothing_swap?schema=public"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database (for development)
   npm run db:push
   
   # Or run migrations (for production)
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## API Endpoints

### Listings
- `GET /api/listings` - Get all listings with filters
- `POST /api/listings` - Create a new listing
- `GET /api/listings/[id]` - Get a specific listing
- `PUT /api/listings/[id]` - Update a listing
- `DELETE /api/listings/[id]` - Delete a listing

### Categories
- `GET /api/categories` - Get all categories

### Users
- `GET /api/users` - Get all users
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user profile

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create a transaction
- `PUT /api/transactions/[id]` - Update transaction status

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── list-item/         # Create listing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seed
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
└── public/               # Static assets
```

## Database Schema Details

### User Model
- Basic profile information (name, email, avatar)
- Location and bio
- Rating system and points balance
- Active/inactive status

### Listing Model
- Item details (title, description, condition, size)
- Points value for swaps
- Swap type (points or direct)
- Multiple images and tags
- View and like counts

### Transaction Model
- Tracks swap transactions between users
- Status tracking (pending, accepted, completed, etc.)
- Points exchange for point-based swaps
- Message history

### Category Model
- Product categories with descriptions
- Icon and color for UI display
- Active/inactive status

## Development

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma`
2. **API Routes**: Add new routes in `app/api/`
3. **Components**: Create reusable components in `components/`
4. **Types**: Update types in `lib/types.ts`
5. **Hooks**: Add custom hooks in `hooks/`

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use shadcn/ui components when possible
- Write meaningful commit messages

## Deployment

### Environment Variables

Set up the following environment variables for production:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Migration

For production deployments:

1. Run migrations: `npm run db:migrate`
2. Seed data if needed: `npm run db:seed`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on the project repository. 