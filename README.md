# Aiko Admin Dashboard

Modern, lightweight, and mobile-friendly admin dashboard for the Aiko delivery platform.

## Features

✨ **Modern Stack**
- React 18 with TypeScript
- TanStack Query for efficient data fetching
- Vite for fast development and builds
- Tailwind CSS for styling
- Dark/Light mode support

🔐 **Security & Performance**
- Firebase Cloud Messaging for push notifications
- Centralized API client with interceptors
- Environment-based configuration
- Lightweight bundle size
- Mobile-responsive design

📱 **Mobile Friendly**
- Responsive layouts (mobile-first approach)
- Touch-friendly UI components
- Optimized for all screen sizes

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
├── pages/              # Page components
├── hooks/              # Custom React hooks
│   ├── useApiQueries.ts    # TanStack Query hooks
│   └── usePushNotifications.ts
├── context/            # React context providers
├── lib/                # Utility libraries
│   ├── api-client.ts   # Axios instance
│   └── firebase.ts     # Firebase setup
├── config/             # Configuration files
└── App.tsx
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

#### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Push Notifications
VITE_FIREBASE_VAPID_KEY=your_vapid_public_key

# App Configuration
VITE_APP_NAME=Aiko Admin
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

### 3. Firebase Setup

#### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Add Web app to project
4. Copy the config values to `.env`

#### Enable Firebase Messaging

1. In Firebase Console, go to **Cloud Messaging**
2. Generate Web Push Certificate (Public Key)
3. Copy the public key to `VITE_FIREBASE_VAPID_KEY`

#### Service Worker Setup

The app uses Firebase Cloud Messaging Service Worker located at `public/firebase-messaging-sw.js`.

**Important**: Before deploying, update the Firebase config in the service worker file with actual values or use environment variables.

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for Production

```bash
npm run build
```

### 6. Preview Production Build

```bash
npm run preview
```

## API Integration

### Using Custom Hooks

All API calls are centralized in custom hooks. Components should only import and use these hooks:

```typescript
import { useDashboardQuery, useUsersQuery } from '@/hooks/useApiQueries';

function Dashboard() {
  const { data, isLoading, isError } = useDashboardQuery();
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <EmptyState message="Failed to load" />;
  
  return <div>{/* ... */}</div>;
}
```

### Adding New API Endpoints

1. Add endpoint to `src/config/index.ts`:
```typescript
export const API_ENDPOINTS = {
  NEW_FEATURE: {
    LIST: '/new-feature',
    GET: (id: string) => `/new-feature/${id}`,
  },
};
```

2. Create custom hook in `src/hooks/useApiQueries.ts`:
```typescript
export const useNewFeatureQuery = () => {
  return useQuery({
    queryKey: queryKeys.newFeature(),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.NEW_FEATURE.LIST);
      return response.data.data;
    },
  });
};
```

## Push Notifications

### Request User Permission

Push notifications are automatically set up when the app loads via the `usePushNotifications` hook. The hook:

1. Checks browser support
2. Requests notification permission
3. Gets FCM token from Firebase
4. Saves token to backend
5. Listens for incoming messages

### Handle Notifications

Incoming notifications are handled automatically by:

1. **App in foreground**: Shows browser notification + stores in state
2. **App in background**: Service Worker handles notification

Access recent notifications:

```typescript
const { notifications } = usePushNotifications();
```

## Mobile Optimization

### Responsive Design Classes

- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` - Responsive grids
- `text-sm md:text-base lg:text-lg` - Responsive typography
- `p-4 md:p-6` - Responsive padding
- `hidden md:block` - Show on medium+ screens

### Mobile-First Approach

All components are designed mobile-first, with enhancements for larger screens.

## Theme System

Switch between light and dark modes:

```typescript
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## Color Palette

### Aiko Brand Colors

- **Green**: `text-aiko-green-500`, `bg-aiko-green-500`
- **Dark**: `text-aiko-dark-900`, `bg-aiko-dark-900`

### Dark Mode

Use dark: prefix:
- `dark:bg-aiko-dark-900`
- `dark:text-white`

## Performance Tips

1. **Lazy Load Pages**: Use React.lazy() for page components
2. **Image Optimization**: Use Next.js Image or similar for responsive images
3. **Code Splitting**: Vite automatically splits code by route
4. **Query Optimization**: Adjust `staleTime` in queries as needed
5. **Memoization**: Use React.memo() for expensive components

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Push Notifications Not Working

1. Check browser console for errors
2. Verify Firebase credentials in `.env`
3. Ensure Service Worker is registered: `public/firebase-messaging-sw.js`
4. Check browser notification permissions
5. Verify VAPID key is correct

### API Calls Failing

1. Verify `VITE_API_BASE_URL` is correct
2. Check network tab in DevTools
3. Verify auth token is in localStorage
4. Check API server logs

### Build Errors

1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear TypeScript cache: `npm run build` with `--force`
3. Check Node version: Should be v16+

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add custom hooks for data fetching
4. Keep components lightweight and focused
5. Test on mobile devices

## License

Proprietary - All rights reserved by Aiko

## Support

For issues or questions, contact the development team.
