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

// Components
export { UserAvatar, type UserAvatarProps, type UserAvatarSize } from './components/UserAvatar';
