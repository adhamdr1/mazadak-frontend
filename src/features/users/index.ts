/**
 * Users Feature Module — Public API
 */

// Types
export * from './types/users.types';

// Schemas
export * from './schemas/updateProfile.schema';

// Services
export { usersService } from './services/users.service';

// Hooks
export { usePublicProfile, type UsePublicProfileOptions } from './hooks/usePublicProfile';
export { useUserAuctions, type UseUserAuctionsOptions } from './hooks/useUserAuctions';
export { useUpdateProfile } from './hooks/useUpdateProfile';
export { useUserReputationSubscription, type UseUserReputationSubscriptionOptions } from './hooks/useUserReputationSubscription';

// Components
export { UserAvatar, type UserAvatarProps, type UserAvatarSize } from './components/UserAvatar';
export { ProfileInfoForm, type ProfileInfoFormProps } from './components/ProfileInfoForm';
export { SecuritySettingsCard, type SecuritySettingsCardProps } from './components/SecuritySettingsCard';
export { PublicProfileHeader, type PublicProfileHeaderProps } from './components/PublicProfileHeader';
export { UserAuctionsList, type UserAuctionsListProps } from './components/UserAuctionsList';
export { UserReviewsTab, type UserReviewsTabProps } from './components/UserReviewsTab';

// Pages
export { ProfilePage } from './pages/ProfilePage';
export { PublicUserPage } from './pages/PublicUserPage';
