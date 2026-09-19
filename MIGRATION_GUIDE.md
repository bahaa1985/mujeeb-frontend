# Migration Guide: Old Structure → New Architecture

## What Changed

### Old Structure
```
src/
├── App.tsx (with counter state)
├── upload_file/
│   └── UploadFile.tsx (hardcoded webhook)
└── ...
```

### New Structure
```
src/
├── App.tsx (now just wraps AuthProvider + Router)
├── api/ (API calls organized by feature)
├── app/ (router configuration)
├── components/ (reusable UI + layout)
├── context/ (auth state)
├── features/ (feature-specific components)
├── pages/ (page-level components)
├── types/ (TypeScript interfaces)
└── ...
```

## Key Improvements

### 1. API Organization
**Before:**
```typescript
// UploadFile.tsx - API call hardcoded
const res = await fetch('https://n8n.srv1133301.hstgr.cloud/...', {
  method: 'POST',
  body: formData
});
```

**After:**
```typescript
// features/inventory/UploadInventory.tsx - uses centralized API
import { inventoryAPI } from '../../api/inventoryAPI';

const response = await inventoryAPI.uploadInventory(file);
```

### 2. Authentication
**Before:**
```typescript
// No auth context - each component manages its own state
```

**After:**
```typescript
// Use AuthContext throughout the app
import { useAuth } from '../context/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

### 3. Routing
**Before:**
```typescript
// No routing - single App.tsx with all components
```

**After:**
```typescript
// React Router with protected routes
// app/router.tsx handles all routing
// ProtectedRoute ensures authentication
```

### 4. Component Reusability
**Before:**
```typescript
// Custom button HTML in UploadFile.tsx
<button onClick={uploadFile}>Upload</button>
```

**After:**
```typescript
// Reusable components
import { Button } from '../../components/ui/Button';
<Button variant="primary" onClick={handleUpload}>Upload</Button>
```

## Migration Checklist

- [x] Create feature-based folder structure
- [x] Set up centralized API layer (axios + API modules)
- [x] Create AuthContext for authentication
- [x] Set up React Router with protected routes
- [x] Create reusable UI components
- [x] Create layout components (Navbar, Sidebar, PageWrapper)
- [x] Create page components
- [x] Move UploadFile logic to UploadInventory component
- [x] Update App.tsx to use new architecture
- [x] Add Tailwind CSS for styling
- [x] Update package.json with new dependencies

## Next Steps for Your Team

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Update with your backend URL
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Implement backend endpoints** matching the API calls in:
   - `src/api/authAPI.ts` - POST /api/auth/login, /api/auth/me, /api/auth/logout
   - `src/api/messagesAPI.ts` - CRUD operations for messages
   - `src/api/inventoryAPI.ts` - POST /api/inventory/upload

5. **Test authentication flow:**
   - Navigate to `/login`
   - Submit login form
   - Should redirect to `/dashboard` on success
   - Should persist session via cookies

6. **Customize components** as needed:
   - Update colors in Tailwind config
   - Add branding to Navbar/Sidebar
   - Extend UI component variants

## Old Files

The old `src/upload_file/` folder can be safely deleted once you've migrated to the new `UploadInventory` component in `src/features/inventory/`.

## Comparison: UploadFile → UploadInventory

### Old (src/upload_file/UploadFile.tsx)
```typescript
- Hardcoded webhook URL
- Direct fetch API
- No error type safety
- No modal dialog
```

### New (src/features/inventory/UploadInventory.tsx)
```typescript
+ Configurable API endpoint (via axios)
+ Type-safe API methods
+ Modal dialog for UX
+ Integrated error handling
+ Status feedback
+ Support for CSV/Excel
```

## Backend Compatibility

Ensure your Express backend:

1. **Sets HTTP-only cookies:**
   ```javascript
   res.cookie('sessionId', token, {
     httpOnly: true,
     secure: true, // HTTPS in production
     sameSite: 'lax',
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   });
   ```

2. **Enables CORS with credentials:**
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

3. **Implements auth endpoints:**
   - POST /api/auth/login
   - GET /api/auth/me
   - POST /api/auth/logout

## Questions?

Refer to `ARCHITECTURE.md` for detailed documentation of the new structure.
