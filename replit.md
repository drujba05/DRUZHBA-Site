# DRUZHBA - Wholesale Footwear E-commerce Platform

## Overview

DRUZHBA is a wholesale e-commerce platform for selling EVA (ethylene-vinyl acetate) footwear and clothing, based in Bishkek, Kyrgyzstan (Dordoy market). The platform is designed specifically for B2B wholesale operations with a minimum order quantity of 6 pairs per product, with orders only accepted in multiples of 6.

Key features:
- Product catalog with manual inventory status management (no automated stock tracking)
- Shopping cart with wholesale order validation
- Admin panel for product management
- Telegram notifications for new orders
- Russian language interface targeting Kyrgyzstan market

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: 
  - Zustand for cart state (with localStorage persistence)
  - TanStack Query for server state and API caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables
- **Animations**: Framer Motion for page transitions
- **Fonts**: Inter (body) + Oswald (headings)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful JSON API under `/api/*` prefix
- **Build System**: 
  - Vite for frontend bundling
  - esbuild for server bundling (production)
  - Custom build script at `script/build.ts`

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client/server)
- **Migrations**: Drizzle Kit with `drizzle-kit push` for schema sync
- **Key Tables**:
  - `users`: Admin authentication
  - `products`: Product catalog with manual status management

### Business Logic Constraints
- Minimum order: 6 pairs per product
- Orders must be in multiples of 6
- No automated inventory tracking - status is manually set by admin
- Product statuses: "В наличии" (In Stock), "Нет в наличии" (Out of Stock), "Ожидается поступление" (Expected Arrival)
- Sizes stored as text ranges (e.g., "36-41")
- Colors stored as comma-separated text

### Authentication
- Simple password-based admin authentication
- Session stored in browser's sessionStorage
- Admin password verified via `/api/admin/login` endpoint

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Notifications
- **Telegram Bot API**: Order notifications sent to admin
  - Requires `TELEGRAM_BOT_TOKEN` environment variable
  - Messages sent to hardcoded chat ID: `5356415783`

### Third-Party Services
- **Google Fonts**: Inter and Oswald font families
- **Yandex Webmaster**: Site verification file present (`yandex_60fa98e9078fb2b5.html`)

### Development Tools
- **Vite Plugins**: 
  - `@replit/vite-plugin-runtime-error-modal` for error display
  - `@replit/vite-plugin-cartographer` for Replit integration (dev only)
  - Custom `vite-plugin-meta-images` for OpenGraph image handling

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `TELEGRAM_BOT_TOKEN`: For order notifications (optional but recommended)
- `ADMIN_PASSWORD`: For admin panel authentication (set via API)