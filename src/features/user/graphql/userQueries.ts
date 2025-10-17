import { gql } from 'graphql-request';

// Mutation for updating user profile
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      displayName
      avatarUrl
      subscriptionTier
    }
  }
`;

// Mutation for updating user preferences
export const UPDATE_USER_PREFERENCES = gql`
  mutation UpdateUserPreferences($input: UpdateUserPreferencesInput!) {
    updateUserPreferences(input: $input) {
      preferredCategories
      notificationSettings
      createdAt
      updatedAt
    }
  }
`;

// Query for getting current user profile using 'me' endpoint
export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      email
      profile {
        id
        subscriptionTier
        displayName
        avatarUrl
        isNewsletterSubscribed
        isAdmin
        trialStatus {
          isTrial
          hasTrial
          trialStart
          trialEnd
          tierId
          daysRemaining
          expired
        }
        preferences {
          preferredCategories
          notificationSettings
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
    }
  }
`;

// Query for getting user preferences
export const GET_USER_PREFERENCES = gql`
  query GetUserPreferences {
    getUserPreferences {
      preferredCategories
      notificationSettings
      createdAt
      updatedAt
    }
  }
`;

// Query for getting enhanced profile with subscription details
export const GET_MY_ENHANCED_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      email
      profile {
        id
        subscriptionTier
        displayName
        avatarUrl
        isNewsletterSubscribed
        isAdmin
        trialStatus {
          isTrial
          hasTrial
          trialStart
          trialEnd
          tierId
          daysRemaining
          expired
        }
        preferences {
          preferredCategories
          notificationSettings
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        
        activeSubscription {
          id
          status
          currentPeriodStart
          currentPeriodEnd
          tier {
            name
            displayName
            price
            features
          }
        }
        
        subscriptionUsage {
          requestsUsed
          requestsLimit
          requestsRemaining
        }
        
        paymentMethods {
          last4
          brand
          isDefault
        }
        
        subscriptionHistory {
          status
          createdAt
          tier {
            displayName
          }
        }
      }
    }
  }
`;

// Mutation for changing user password
export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;
