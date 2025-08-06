# PetAdopt Frontend

A beautiful, responsive frontend for the PetAdopt platform built with Next.js 15, Tailwind CSS, and shadcn/ui.

## Features

- 🐾 **Pet Catalog**: Browse available pets with beautiful cards
- 🔍 **Search Functionality**: Search pets by name or description
- 📱 **Responsive Design**: Works perfectly on mobile and desktop
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🖼️ **Image Support**: Display pet images with fallback handling
- 📊 **Statistics Dashboard**: View adoption statistics
- 🔗 **API Integration**: Seamlessly connects to the backend API

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:3001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (pet catalog)
│   └── pets/[id]/         # Pet detail pages
├── components/
│   └── ui/               # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── api.ts            # API service functions
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## API Integration

The frontend communicates with the backend API through the `lib/api.ts` service:

- **GET /pets**: Fetch all pets with pagination and filters
- **GET /pets/:id**: Get detailed information about a specific pet
- **POST /pets**: Create new pets (admin only)
- **PUT /pets/:id**: Update pet information (admin only)
- **DELETE /pets/:id**: Delete pets (admin only)

## Features

### Pet Catalog
- Grid layout with responsive design
- Pet cards with images, status, and key information
- Search functionality
- Loading states and error handling

### Pet Details
- Detailed pet information page
- Large image display
- Complete pet information (age, gender, size, etc.)
- Medical information (vaccination, neutering status)
- Shelter contact information

### Statistics Dashboard
- Available pets count
- Recently adopted pets
- Shelter information

## Design System

The frontend uses a consistent design system:

- **Colors**: Blue theme with gradients
- **Typography**: Clean, readable fonts
- **Components**: Reusable shadcn/ui components
- **Spacing**: Consistent Tailwind spacing scale
- **Responsive**: Mobile-first design approach

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper error handling
4. Test on both mobile and desktop
5. Update documentation as needed

## Deployment

The frontend can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

```bash
npm run build
```

The built files will be in the `.next` directory.
