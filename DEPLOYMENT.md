# Deployment Guide - Daystar Forms Portal

## Environment Variables

### Frontend (Netlify)

The following environment variables must be set in Netlify:

```env
NEXT_PUBLIC_API_URL=<YOUR_BACKEND_API_URL>
NEXTAUTH_URL=https://dccforms.netlify.app
NEXTAUTH_SECRET=<GENERATE_A_SECURE_SECRET>
```

#### How to Set Environment Variables in Netlify

1. Go to your site's dashboard on Netlify
2. Click on **Site settings** > **Environment variables**
3. Add each variable:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend API (e.g., `https://api.daystarforms.com`)
   - `NEXTAUTH_URL`: Your frontend URL (e.g., `https://dccforms.netlify.app`)
   - `NEXTAUTH_SECRET`: Generate using: `openssl rand -base64 32`

### Backend

The backend requires the following environment variables:

```env
PORT=5213
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_JWT_SECRET>
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET>
AWS_REGION=<YOUR_AWS_REGION>
AWS_S3_BUCKET=<YOUR_S3_BUCKET_NAME>
FRONTEND_URL=https://dccforms.netlify.app
```

## Troubleshooting

### "Cannot read properties of undefined (reading 'length')" Error

This error typically occurs when:

1. **Missing Environment Variable**: `NEXT_PUBLIC_API_URL` is not set in Netlify
   - **Solution**: Add the environment variable in Netlify dashboard
   - After adding, trigger a new deploy

2. **Backend API Not Responding**: The backend URL is unreachable
   - **Solution**: Verify backend is deployed and running
   - Check backend URL is correct and accessible

3. **Token Decode Error**: Invalid JWT token format
   - **Solution**: Ensure JWT_SECRET matches between frontend and backend
   - Clear browser localStorage and try logging in again

### Admin Login Issues

If you see "Configuration error: Backend API URL not set":

1. Check Netlify environment variables
2. Ensure `NEXT_PUBLIC_API_URL` is set correctly
3. Redeploy the site after adding variables

### Local Development

For local development, create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5213
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production
```

## Build Commands

### Frontend

```bash
cd frontend
pnpm install
pnpm run build
```

### Backend

```bash
cd backend
pnpm install
pnpm run build
```

## Deployment Checklist

- [ ] MongoDB database is set up and accessible
- [ ] AWS S3 bucket is created for file uploads
- [ ] Backend is deployed with all environment variables
- [ ] Frontend environment variables are set in Netlify
- [ ] Test login with admin credentials
- [ ] Verify file upload functionality
- [ ] Check form submissions work correctly

## Production URLs

- **Frontend**: https://dccforms.netlify.app
- **Backend**: _(Add your backend URL here)_
- **Admin Login**: https://dccforms.netlify.app/admin/login

## Security Notes

1. Never commit `.env` files to git
2. Use strong, unique secrets for production
3. Regularly rotate JWT secrets and API keys
4. Enable HTTPS for all endpoints
5. Set appropriate CORS policies on backend
