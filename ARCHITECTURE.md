# PharmacyDB Frontend Architecture

This frontend application follows a **feature-based architecture** designed for a SaaS dashboard with Express.js backend integration using cookie-based authentication.

## Project Structure

```
src/
├── api/                    # Centralized API calls with axios
│   ├── axios.ts           # Axios instance with baseURL and credentials
│   ├── authAPI.ts         # Authentication API calls
│   ├── messagesAPI.ts     # Messages API calls
│   ├── inventoryAPI.ts    # Inventory upload/management API calls
│   └── index.ts           # Re-exports for convenient imports
│
├── app/
│   └── router.tsx         # React Router configuration with protected routes
│
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── layout/            # Layout components (Navbar, Sidebar, etc.)
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── PageWrapper.tsx
│
├── context/               # React Context for state management
│   └── AuthContext.tsx    # Authentication state and user info
│
├── features/              # Feature-specific components and logic
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── messages/
│   │   ├── MessagesList.tsx
│   │   └── MessageItem.tsx
│   ├── inventory/
│   │   └── UploadInventory.tsx
│   └── dashboard/
│       └── DashboardStats.tsx
│
├── hooks/                 # Custom React hooks
│   └── useAsync.ts       # Hook for async operations
│
├── pages/                 # Page-level components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Messages.tsx
│   ├── Inventory.tsx
│   └── NotFound.tsx
│
├── styles/               # Global styles
│   └── globals.css       # Tailwind CSS imports
│
├── types/                # TypeScript type definitions
│   ├── user.ts
│   └── message.ts
│
├── App.tsx              # Main app component
├── main.tsx             # React entry point
└── index.html           # HTML entry point
```

## Key Features

### 1. Centralized API Layer
All API calls are organized in the `api/` folder with axios configured for:
- Base URL: `http://localhost:5000`
- HTTP-only cookie authentication: `withCredentials: true`
- Automatic error handling and 401 redirect to login

**Example Usage:**
```typescript
import { authAPI, messagesAPI } from '@/api';

// Login
const response = await authAPI.login({ email, password });

// Get messages
const messages = await messagesAPI.getMessages();
```

### 2. Authentication Context
Located in `context/AuthContext.tsx`, provides:
- Current user state
- Login/logout methods
- Auth status checking on app mount
- Automatic redirect on 401 errors

**Usage:**
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### 3. Protected Routes
The router automatically protects authenticated routes and redirects unauthenticated users to `/login`.

```typescript
// In app/router.tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

### 4. Feature-Based Organization
Each feature (auth, messages, inventory) is self-contained with:
- Feature-specific components
- Feature-specific API calls
- Isolated state management

### 5. Reusable UI Components
Pre-built components in `components/ui/`:
- `Button` - Button with variants (primary, secondary, danger)
- `Input` - Form input with label and error handling
- `Modal` - Modal dialog component

### 6. Styling with Tailwind CSS
All components use Tailwind CSS for consistent, utility-first styling.

## API Examples

### Authentication
```typescript
// Login
const { user } = await authAPI.login({ 
  email: 'user@example.com', 
  password: 'password' 
});

// Get current user
const user = await authAPI.getCurrentUser();

// Logout
await authAPI.logout();
```

### Messages
```typescript
// Get all messages
const messages = await messagesAPI.getMessages();

// Create message
const newMessage = await messagesAPI.createMessage({
  title: 'Hello',
  content: 'This is a message'
});

// Delete message
await messagesAPI.deleteMessage(messageId);
```

### Inventory
```typescript
// Upload inventory file
const result = await inventoryAPI.uploadInventory(file);

// Get inventory with pagination
const inventory = await inventoryAPI.getInventory({
  page: 1,
  limit: 10,
  search: 'aspirin'
});

// Delete inventory item
await inventoryAPI.deleteInventory(itemId);
```

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm lint
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:5000
```

Update `src/api/axios.ts` if using env variables:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
});
```

## Best Practices

1. **API Calls**: Always import from `src/api/` folder, never make direct axios calls
2. **Components**: Keep component logic focused; move business logic to custom hooks or API layers
3. **Types**: Define all interfaces in `src/types/` folder
4. **State**: Use AuthContext for auth state; use React hooks for local component state
5. **Error Handling**: Axios interceptor handles 401 errors; catch errors in API calls for specific handling
6. **Styling**: Use Tailwind CSS utilities; avoid inline styles

## Adding New Features

1. Create feature folder: `src/features/featureName/`
2. Create API module: `src/api/featureNameAPI.ts`
3. Create feature components: `src/features/featureName/*.tsx`
4. Create page component: `src/pages/FeatureName.tsx`
5. Add route in `src/app/router.tsx`
6. Define types in `src/types/` if needed

## Notes

- The project uses React 19.2.0 with TypeScript
- Vite is used as the build tool for fast development
- ESLint is configured for code quality
- Tailwind CSS is configured for styling
- React Router v6 is used for routing
- Cookie-based authentication is set up; ensure backend sends `Set-Cookie` headers
