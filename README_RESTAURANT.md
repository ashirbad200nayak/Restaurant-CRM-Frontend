# Restaurant Ordering System - Frontend

A complete React frontend for a restaurant ordering system with real-time order tracking, veg/non-veg filtering, and admin management.

## Features

### Customer Features
- 🍽️ **Menu Browsing**: View menu with categories, chef's specials, and all-time favorites
- 🌱 **Veg/Non-Veg Filtering**: Filter menu items by dietary preference
- 🛒 **Shopping Cart**: Persistent cart with localStorage
- 📱 **QR Code Support**: Scan table QR codes to start ordering
- 🔔 **Real-time Updates**: Live order status updates via Socket.io
- ⭐ **Reviews**: Rate and review your dining experience

### Admin Features
- 🔐 **Secure Authentication**: Cookie-based JWT authentication
- 📊 **Order Management**: View, update, and delete orders
- ⏱️ **ETA Management**: Set estimated preparation times
- 🍔 **Menu Management**: CRUD operations for menu items
- 🔄 **Real-time Dashboard**: Live order updates

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks + localStorage
- **API Client**: Axios with cookie support
- **Real-time**: Socket.io-client
- **Routing**: React Router v6
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── VegIndicator.tsx    # Veg/Non-veg badge
│   ├── MenuItemCard.tsx    # Menu item display
│   └── CartDrawer.tsx      # Shopping cart
├── pages/
│   ├── Landing.tsx         # Table number entry
│   ├── Menu.tsx            # Menu browsing
│   ├── Checkout.tsx        # Order submission
│   ├── OrderTracking.tsx   # Real-time order status
│   ├── Review.tsx          # Post-order reviews
│   └── admin/
│       ├── Login.tsx       # Admin authentication
│       ├── Dashboard.tsx   # Order management
│       └── MenuManagement.tsx
├── hooks/
│   ├── useCart.ts          # Cart state management
│   └── useSocket.ts        # Socket.io connection
├── lib/
│   ├── api.ts              # Axios configuration
│   └── utils.ts            # Utility functions
└── index.css               # Design system tokens
```

## Authentication

The app supports **cookie-based authentication** with JWT fallback:

- **Primary**: HttpOnly cookies (secure, recommended)
- **Fallback**: Bearer token in Authorization header (development)

### Cookie Auth (Automatic)
```typescript
// Axios is pre-configured with credentials: 'include'
api.defaults.withCredentials = true;
```

### Token Fallback
```typescript
import { setAuthToken } from '@/lib/api';

// After login, if server returns token
setAuthToken(response.data.token);
```

## Design System

The app uses a **warm, food-focused design** with semantic color tokens:

### Colors (HSL)
- **Primary**: Warm orange/amber (`25 95% 53%`)
- **Veg**: Green (`142 76% 36%`)
- **Non-Veg**: Red (`0 84% 60%`)
- **Background**: Light cream (`35 20% 98%`)

### Usage
```tsx
// ✅ Use semantic tokens
<div className="bg-primary text-primary-foreground">

// ❌ Don't use direct colors
<div className="bg-orange-500 text-white">
```

## Socket.io Integration

### Customer Flow
```typescript
const { joinTable, on } = useSocket();

// Join table room
joinTable(tableNumber);

// Listen for updates
on('order_created', handleOrderCreated);
on('order_updated', handleOrderUpdated);
```

### Admin Flow
```typescript
// Subscribe to all order updates
on('admin_order_updated', handleAdminUpdate);
```

## Cart Management

Cart data is stored in `localStorage` per table:

```typescript
const cart = useCart(tableNumber);

// Add item
cart.addItem({ menuItemId, name, price, qty, notes, veg });

// Update quantity
cart.updateItem(menuItemId, { qty: 2 });

// Remove item
cart.removeItem(menuItemId);

// Clear cart
cart.clearCart();
```

## API Integration Examples

### Fetch Menu with Filters
```typescript
// All items
GET /api/v1/menu

// Veg only
GET /api/v1/menu?veg=true

// Search
GET /api/v1/menu?search=pizza

// Chef's specials
GET /api/v1/menu?isChefsSpecial=true
```

### Place Order
```typescript
POST /api/v1/orders
{
  "tableNumber": "12",
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "items": [
    {
      "menuItemId": "abc123",
      "name": "Margherita Pizza",
      "qty": 2,
      "price": 299,
      "notes": "Extra cheese",
      "veg": true
    }
  ]
}
```

### Update Order Status (Admin)
```typescript
PATCH /admin/orders/:orderId/status
{
  "status": "preparing",
  "estimatedReadyAt": "2025-10-31T14:30:00Z"
}
```

## Seeding Data

### 1. Create Admin User
```bash
POST /api/v1/admin/seed
{
  "username": "admin",
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

### 2. Seed Categories
```bash
POST /api/v1/admin/seed/categories
{
  "categories": [
    { "name": "Appetizers", "description": "Start your meal" },
    { "name": "Main Course", "description": "Hearty meals" }
  ]
}
```

### 3. Seed Menu Items
```bash
POST /api/v1/admin/menu/seed
{
  "items": [
    {
      "name": "Margherita Pizza",
      "description": "Classic cheese pizza",
      "price": 299,
      "categoryName": "Main Course",
      "imageUrl": "https://example.com/pizza.jpg",
      "veg": true,
      "available": true,
      "isChefsSpecial": false,
      "isAllTimeFavorite": true
    }
  ]
}
```

## Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## Testing Checklist

- [ ] Customer can enter table number and view menu
- [ ] Veg/Non-veg filter works correctly
- [ ] Items can be added to cart with notes
- [ ] Cart persists after page refresh
- [ ] Order submission creates order and redirects
- [ ] Order tracking shows real-time updates
- [ ] Admin can login and view orders
- [ ] Admin can change order status
- [ ] Socket.io reconnects after disconnect
- [ ] Mobile responsive design works

## Troubleshooting

### Socket.io Not Connecting
- Check `VITE_SOCKET_URL` in `.env`
- Ensure backend is running
- Check browser console for errors

### Cart Not Persisting
- Check localStorage is enabled
- Verify table number in URL
- Clear cache if corrupted

### Auth Cookies Not Working
- Use HTTPS in production
- Check `withCredentials: true` in axios
- Verify backend sends `Set-Cookie` header

### API Errors
- Check `VITE_API_BASE_URL` matches backend
- Verify CORS settings on backend
- Check network tab for response details

## License

MIT
