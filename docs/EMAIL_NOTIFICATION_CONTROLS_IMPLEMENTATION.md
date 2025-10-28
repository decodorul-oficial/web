# Email Notification Controls Implementation

## Overview

This document describes the implementation of email notification controls for saved searches, allowing users to enable/disable email notifications for their saved searches with proper subscription-based access control.

## Features Implemented

### 1. Bell Icon Controls
- **Location**: Both saved searches modal (on `/stiri` page) and dedicated saved searches page (`/profile/saved-searches`)
- **Functionality**: Toggle email notifications on/off for individual saved searches
- **Visual States**:
  - Active: Filled bell icon with brand color
  - Inactive: Outlined bell icon in gray
  - Loading: Spinning loader icon
  - Disabled: Grayed out with tooltip

### 2. Notification Usage Counter
- **Location**: Top of saved searches list in both modal and page
- **Display**: "Notificări active: X / Y" format
- **Visibility**: Only shown for users with premium access

### 3. Access Control & Feature Gating
- **Free Users**: Bell icons are disabled with tooltip explaining premium feature
- **Premium Users**: Full functionality with limit enforcement
- **Limit Reached**: Disabled state with tooltip showing limit reached

### 4. Toast Notifications
- **Success**: Confirmation when notifications are enabled/disabled
- **Error**: Generic error message for failed operations
- **Limit**: Warning when user tries to exceed notification limit

## Technical Implementation

### New Components

#### NotificationBell.tsx
```typescript
interface NotificationBellProps {
  searchId: string;
  searchName: string;
  isEnabled: boolean;
  onToggle?: () => void;
  className?: string;
}
```

**Features**:
- Handles all user states (auth, subscription, limits)
- Provides appropriate tooltips for disabled states
- Shows loading state during API calls
- Integrates with existing toast system

#### NotificationCounter.tsx
```typescript
interface NotificationCounterProps {
  className?: string;
}
```

**Features**:
- Displays current usage vs limit
- Only visible for premium users
- Automatically updates when notifications are toggled

### Updated Components

#### SavedSearchesList.tsx
- Added notification bell to action buttons
- Added notification counter to header
- Integrated with existing refetch mechanism

### New API Integration

#### GraphQL Queries & Mutations
```graphql
# Get email notification info
query GetEmailNotificationInfo {
  getEmailNotificationInfo {
    currentCount
    limit
    canEnableMore
  }
}

# Toggle email notifications
mutation ToggleEmailNotifications($id: ID!, $enabled: Boolean!) {
  toggleEmailNotifications(id: $id, enabled: $enabled) {
    id
    name
    emailNotificationsEnabled
  }
}
```

#### Service Layer
- `SavedSearchesService.getEmailNotificationInfo()`
- `SavedSearchesService.toggleEmailNotifications(id, enabled)`

#### React Hooks
- `useEmailNotificationInfo()` - Fetches and manages notification info
- `useToggleEmailNotifications()` - Handles toggle operations

### Type Definitions

#### Updated SavedSearch Interface
```typescript
export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  searchParams: SearchParams;
  isFavorite: boolean;
  emailNotificationsEnabled?: boolean; // New field
  createdAt: string;
  updatedAt: string;
}
```

#### New Interfaces
```typescript
export interface EmailNotificationInfo {
  currentCount: number;
  limit: number;
  canEnableMore: boolean;
}

export interface ToggleEmailNotificationInput {
  id: string;
  enabled: boolean;
}
```

## User Experience

### User Stories Implemented

1. **Pro/Enterprise Users**: Can see bell icons and toggle notifications with single click
2. **Usage Awareness**: Current notification usage displayed at top of list
3. **Free Users**: See disabled icons with informative tooltips about premium feature

### Scenarios Handled

1. **Unauthenticated/Free Users**: Disabled bell with tooltip about premium feature
2. **Limit Reached**: Disabled state with tooltip showing limit reached
3. **Successful Toggle**: Success toast with search name
4. **API Errors**: Error toast with generic message
5. **Loading States**: Spinner during API calls

## Design System Integration

### Visual Consistency
- Uses existing brand colors (`brand-info`, `brand-highlight`)
- Matches existing icon style and sizing
- Consistent with existing button hover states
- Integrates with existing tooltip system

### Toast Integration
- Uses existing `react-hot-toast` system
- Matches existing toast styling and positioning
- Consistent with existing success/error patterns

## Files Modified/Created

### New Files
- `src/components/saved-searches/NotificationBell.tsx`
- `src/components/saved-searches/NotificationCounter.tsx`
- `docs/EMAIL_NOTIFICATION_CONTROLS_IMPLEMENTATION.md`

### Modified Files
- `src/features/saved-searches/types.ts` - Added email notification types
- `src/features/saved-searches/graphql/queries.ts` - Added GraphQL queries/mutations
- `src/features/saved-searches/services/savedSearchesService.ts` - Added service methods
- `src/features/saved-searches/hooks/useSavedSearches.ts` - Added React hooks
- `src/components/saved-searches/SavedSearchesList.tsx` - Integrated bell and counter
- `src/components/saved-searches/index.ts` - Exported new components

## Backend Requirements

The implementation assumes the following backend API endpoints exist:

1. **GET** `/api/graphql` - `getEmailNotificationInfo` query
2. **POST** `/api/graphql` - `toggleEmailNotifications` mutation

These endpoints should:
- Return user's current notification count and limit
- Handle subscription-based access control
- Update saved search notification status
- Return updated search data

## Testing Considerations

### Manual Testing Scenarios
1. Test with free user account
2. Test with premium user account
3. Test limit enforcement
4. Test API error handling
5. Test loading states
6. Test tooltip functionality

### Integration Points
- Saved searches modal on `/stiri` page
- Saved searches page at `/profile/saved-searches`
- Authentication system
- Subscription system
- Toast notification system

## Future Enhancements

1. **Bulk Operations**: Allow enabling/disabling multiple notifications at once
2. **Notification Settings**: More granular control over notification frequency
3. **Email Templates**: Customizable email templates for notifications
4. **Analytics**: Track notification usage and engagement
5. **Mobile Optimization**: Ensure touch-friendly interaction on mobile devices

