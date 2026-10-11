# Quick Fix for "Cannot read properties of undefined (reading 'length')" Error

## Problem

The admin login page is failing with a `TypeError: Cannot read properties of undefined (reading 'length')` error because the `NEXT_PUBLIC_API_URL` environment variable is not configured in Netlify.

## Solution

### Step 1: Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (dccforms)
3. Go to **Site settings** → **Environment variables**
4. Add the following environment variable:

```
Key: NEXT_PUBLIC_API_URL
Value: <YOUR_BACKEND_API_URL>
```

Replace `<YOUR_BACKEND_API_URL>` with your actual backend URL (e.g., `https://your-backend-domain.com`)

### Step 2: Trigger a New Deploy

After adding the environment variable:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

### Step 3: Test

Once deployed, try logging in at: https://dccforms.netlify.app/admin/login

## Changes Made

1. **Improved error handling** in the login page to catch token decode errors
2. **Added environment variable check** with user-friendly error message
3. **Enhanced ErrorBoundary** component with better UI and recovery options
4. **Added null checks** for token parsing to prevent crashes

## For Local Development

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5213
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key
```

## Additional Environment Variables Needed

For full functionality, also add:

```
NEXTAUTH_URL=https://dccforms.netlify.app
NEXTAUTH_SECRET=<generate using: openssl rand -base64 32>
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.
