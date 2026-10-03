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

// Components
export { UserAvatar, type UserAvatarProps, type UserAvatarSize } from './components/UserAvatar';
export { ProfileInfoForm, type ProfileInfoFormProps } from './components/ProfileInfoForm';
export { SecuritySettingsCard, type SecuritySettingsCardProps } from './components/SecuritySettingsCard';

// Pages
export { ProfilePage } from './pages/ProfilePage';
