# PharmacyDB Frontend

A professional, feature-based React SaaS dashboard with Express.js backend integration using cookie-based authentication.

## 🏗️ Architecture

This project follows a **feature-based architecture** suitable for scalable SaaS applications:

- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v6 with protected routes
- **Authentication**: Cookie-based HTTP-only (Express compatible)
- **State Management**: React Context + Local state
- **API Client**: Axios with centralized configuration
- **Styling**: Tailwind CSS
- **Type Safety**: Full TypeScript support

## 📦 Quick Start

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

### Preview
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── api/              # Centralized API calls
├── app/              # Router configuration
├── components/       # Reusable UI & layout components
├── context/          # Auth state management
├── features/         # Feature-specific components
├── pages/            # Page-level components
├── types/            # TypeScript type definitions
└── styles/           # Global styles
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** | Installation & getting started |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Common patterns & code examples |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Detailed architecture guide |
| **[FILE_TREE.md](./FILE_TREE.md)** | Complete file structure |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** | Old → New structure mapping |
| **[CHECKLIST.md](./CHECKLIST.md)** | Setup checklist & next steps |

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Test Authentication
- Navigate to http://localhost:5173 → Redirects to `/login`
- Login page is at `/login` (public route)
- Dashboard, Messages, Inventory require authentication

## 🔑 Key Features

✨ **Feature-Based Organization** - Code organized by business features  
🔐 **Secure Authentication** - HTTP-only cookie support for Express backend  
🛣️ **Protected Routes** - Automatic auth checks on navigation  
🎨 **Reusable Components** - Pre-built UI components (Button, Input, Modal)  
📦 **Centralized API** - All API calls in one place  
🧠 **Type-Safe** - Full TypeScript support throughout  
🎯 **Modern Stack** - React 19, Vite, Tailwind CSS  

## 💻 Usage Examples

### Use Authentication
```typescript
import { useAuth } from './context/AuthContext';

export const MyComponent = () => {
  const { user, login, logout } = useAuth();
  return <button onClick={logout}>Logout {user?.email}</button>;
};
```

### Make API Calls
```typescript
import { messagesAPI } from './api';

const messages = await messagesAPI.getMessages();
await messagesAPI.createMessage({ title: 'Hello', content: '...' });
```

### Use UI Components
```typescript
import { Button, Input, Modal } from './components/ui';

<Button variant="primary" onClick={handleClick}>Click Me</Button>
<Input label="Email" type="email" />
<Modal isOpen={isOpen} title="Dialog">Content</Modal>
```

### Create Protected Pages
```typescript
import { PageWrapper } from './components/layout';

export const MyPage = () => (
  <PageWrapper>
    <h1>Protected Page</h1>
    {/* Your content */}
  </PageWrapper>
);
```

## 🔌 API Integration

The frontend is configured to connect to `http://localhost:5000` (Express backend).

### Required Endpoints

Your backend should implement:

**Authentication**
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

**Messages**
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create message
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

**Inventory**
- `POST /api/inventory/upload` - Upload inventory file
- `GET /api/inventory` - Get inventory list

### CORS Configuration
Your backend must enable CORS with credentials:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### HTTP-Only Cookies
Set cookies on login response:
```javascript
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: true,  // in production
  sameSite: 'lax'
});
```

## ⚡ Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🛠️ Configuration

### Tailwind CSS
Customize theme in `tailwind.config.ts`:
```typescript
export default {
  theme: {
    extend: {
      colors: { ... },
      fontFamily: { ... }
    }
  }
}
```

### Environment Variables
Create `.env` file from `.env.example`:
```
VITE_API_BASE_URL=http://localhost:5000
```

## 📖 For More Information

- See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for common code patterns
- See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed architecture documentation
- See **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** for complete setup guide

## 🧪 Testing

```bash
# Build and check for errors
npm run build

# Run linter
npm run lint
```

## 📄 License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
