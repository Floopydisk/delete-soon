# Authentication System Documentation

This document explains the authentication system used in the Daystar Forms application.

## Overview

The application uses a hybrid authentication approach combining:

1. **NextAuth.js** - For modern, secure session management
2. **Legacy Token Authentication** - For backward compatibility

## Key Components

### 1. Authentication Hooks

- **`useSafeSession`** - A wrapper around NextAuth's `useSession` that works both inside and outside the SessionProvider
- **`useIsInSessionProvider`** - Detects if the component is within a SessionProvider context
- **`useAuth`** - Provides login, logout, and token access methods that work with both systems

### 2. Provider Components

- **`AuthProvider`** - Wraps the application in a NextAuth SessionProvider with proper client-side mounting

### 3. API Routes

- **`/api/auth/[...nextauth]`** - NextAuth.js API route for authentication
- **`/api/auth/check`** - Token verification endpoint for legacy tokens

### 4. Authentication Flow

Login:

1. User submits credentials
2. NextAuth attempts authentication first
3. If successful, also authenticates with legacy system for backward compatibility
4. If NextAuth fails, falls back to legacy authentication

Session Access:

1. Components use `useSafeSession` to access the current session
2. If inside a SessionProvider, returns NextAuth session
3. If outside a SessionProvider, returns a compatible session object from localStorage

## Environment Variables

```
# NextAuth configuration (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5213
```

## Integration Points

### Client Components

```tsx
import { useSafeSession } from "@/hooks/use-safe-session";

function MyComponent() {
  const { data: session, status } = useSafeSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Accessing Auth Token for API Calls

```tsx
import { useAuth } from "@/hooks/use-auth";

function DataFetcher() {
  const { getAuthToken } = useAuth();

  const fetchData = async () => {
    const token = getAuthToken();
    const response = await fetch("/api/data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Handle response
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Security Considerations

- The token is stored in both HTTP-only cookies (for NextAuth) and localStorage (for legacy support)
- The middleware protects routes based on authentication status
- Server-side validation occurs for all authenticated requests

## Future Improvements

- Complete migration to NextAuth, removing the legacy token system
- Add additional authentication providers (Google, Facebook, etc.)
- Implement RBAC (Role-Based Access Control) for more granular permissions
