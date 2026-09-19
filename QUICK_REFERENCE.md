# Quick Reference Guide

## 🔑 Most Common Patterns

### 1. Using Authentication

**Get current user:**
```typescript
import { useAuth } from '@/context/AuthContext';

export const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <p>User: {user?.email}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};
```

### 2. Making API Calls

**Example 1: Get messages in a component**
```typescript
import { useState, useEffect } from 'react';
import { messagesAPI } from '@/api';

export const MyMessagesComponent = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await messagesAPI.getMessages();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  return loading ? <div>Loading...</div> : <div>{messages.length} messages</div>;
};
```

**Example 2: Login**
```typescript
import { useAuth } from '@/context/AuthContext';

export const LoginComponent = () => {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now authenticated, AuthContext will redirect
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={() => handleLogin('user@test.com', 'pass')}>Login</button>;
};
```

### 3. Creating API Modules

**Pattern for new API module: `src/api/dogsAPI.ts`**
```typescript
import api from './axios';

export interface Dog {
  id: string;
  name: string;
  breed: string;
}

export const dogsAPI = {
  getDogs: async () => {
    const response = await api.get<Dog[]>('/api/dogs');
    return response.data;
  },

  createDog: async (data: { name: string; breed: string }) => {
    const response = await api.post<Dog>('/api/dogs', data);
    return response.data;
  },

  deleteDog: async (id: string) => {
    await api.delete(`/api/dogs/${id}`);
  },
};
```

### 4. Creating Pages

**Simple page structure:**
```typescript
import { PageWrapper } from '@/components/layout';

export const DogsPage = () => {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dogs</h1>
          <p className="text-gray-600">Manage your dogs</p>
        </div>
        {/* Page content here */}
      </div>
    </PageWrapper>
  );
};
```

### 5. Creating Reusable Components

**UI Component with props:**
```typescript
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
};
```

### 6. Using UI Components

```typescript
import { Button, Input, Modal } from '@/components/ui';
import { useState } from 'react';

export const FormComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        title="Add Something"
        onClose={() => setIsOpen(false)}
        onConfirm={() => console.log('Confirmed')}
      >
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
        />
      </Modal>
    </>
  );
};
```

### 7. Styling with Tailwind

```typescript
export const StyledComponent = () => {
  return (
    <div className="bg-blue-600 text-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Title</h1>
      <p className="text-blue-100 mb-6">Description</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-700 rounded">Card 1</div>
        <div className="p-4 bg-blue-700 rounded">Card 2</div>
      </div>
    </div>
  );
};
```

**Common Tailwind utilities:**
- Spacing: `p-4` (padding), `m-4` (margin), `space-y-4` (vertical space)
- Colors: `bg-blue-600`, `text-gray-700`, `border-red-300`
- Sizing: `w-full`, `h-screen`, `max-w-md`
- Layout: `flex`, `grid`, `grid-cols-3`
- Effects: `shadow-lg`, `rounded-lg`, `hover:bg-gray-100`

## 📂 File Organization Patterns

### Adding a New Feature

**Step 1: Create folder structure**
```
src/features/dogs/
├── DogsList.tsx          # Main list component
├── DogItem.tsx           # Item component
└── CreateDogModal.tsx    # Form component  (optional)
```

**Step 2: Create API module**
```
src/api/dogsAPI.ts        # All API calls
```

**Step 3: Create page**
```
src/pages/Dogs.tsx        # Page component
```

**Step 4: Add route**
```typescript
// src/app/router.tsx
<Route
  path="/dogs"
  element={
    <ProtectedRoute>
      <DogsPage />
    </ProtectedRoute>
  }
/>
```

**Step 5: Add types** (if needed)
```
src/types/dog.ts          # TypeScript interfaces
```

## 🔗 Import Paths

**Always use explicit relative imports or path aliases:**

```typescript
// Good
import { useAuth } from '../context/AuthContext';
import { dogsAPI } from '../api';
import { Button } from '../components/ui/Button';

// Also good (if you setup alias in tsconfig)
import { useAuth } from '@/context/AuthContext';
import { dogsAPI } from '@/api';
```

## 🚨 Common Patterns to Avoid

❌ **Don't:**
```typescript
// Don't make direct fetch calls
const res = await fetch('http://localhost:5000/api/dogs');

// Don't store auth token in localStorage (or do, but not for HTTP-only cookies)
localStorage.setItem('token', token);

// Don't pass large objects through props (use Context instead)
<Component user={user} dogs={dogs} messages={messages} ... />

// Don't hardcode API URLs
const response = await fetch('http://localhost:5000/api/something');
```

✅ **Do:**
```typescript
// Use centralized API modules
const data = await dogsAPI.getDogs();

// Trust the HTTP-only cookie system
// No need to manually handle tokens

// Use Context for global state
const { user } = useAuth();

// Use environment variables or axios baseURL
const response = await api.get('/api/something');
```

## 📦 Import/Export Patterns

**API module exports:**
```typescript
// src/api/dogsAPI.ts
export interface Dog { ... }
export const dogsAPI = { ... };

// src/api/index.ts
export * from './dogsAPI';
export * from './authAPI';
export * from './messagesAPI';
```

**Usage:**
```typescript
import { dogsAPI, Dog } from '@/api';
```

## 🎯 Component Structure Template

```typescript
import React, { useState, useEffect } from 'react';
import { YourAPI } from '../../api';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface Props {
  id?: string;
}

/**
 * YourComponent description
 * - What it does
 * - When it's used
 */
export const YourComponent: React.FC<Props> = ({ id }) => {
  const { user } = useAuth();
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize component
  }, [id]);

  const handleAction = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Do something
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}
      <Button onClick={handleAction} isLoading={isLoading}>
        Action
      </Button>
    </div>
  );
};
```

## 🧪 Testing Example

```typescript
// When testing, you can mock the API:
import { vi } from 'vitest';
import * as dogsAPI from '../api/dogsAPI';

vi.mock('../api/dogsAPI', () => ({
  dogsAPI: {
    getDogs: vi.fn().mockResolvedValue([
      { id: '1', name: 'Buddy', breed: 'Golden Retriever' }
    ])
  }
}));
```

---

For more details, see `ARCHITECTURE.md`
