/**
 * Auth Module TypeScript Definitions
 * 100% strictly aligned with `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md`
 */

export type UserRole = 'USER' | 'ADMIN';

export type AuthProvider = 'LOCAL' | 'GOOGLE';

export interface Address {
  city: string;
  street: string;
}

export interface RatingBreakdown {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
}

export interface UserRatingStats {
  averageRating: number;
  totalReviews: number;
  asSellerAverageRating: number;
  asSellerTotalReviews: number;
  asBuyerAverageRating: number;
  asBuyerTotalReviews: number;
  breakdown: RatingBreakdown;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  authProvider: AuthProvider;
  googleId?: string | null;
  role: UserRole;
  phoneNumber: string;
  dateOfBirth: string; // ISO 8601 DateTime string (e.g., "1995-06-15T00:00:00.000Z")
  address: Address;
  isEmailVerified: boolean;
  isBanned: boolean;
  ratingStats?: UserRatingStats | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// GraphQL Responses
// ----------------------------------------------------

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

// ----------------------------------------------------
// GraphQL Inputs
// ----------------------------------------------------

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
}

export interface GoogleLoginInput {
  token: string;
}

export interface GoogleRegisterInput {
  token: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
}

export interface UpdatePasswordInput {
  oldPassword: string;
  password: string;
}

// ----------------------------------------------------
// UI Form Data Types (Consumed by React Hook Form & Components)
// ----------------------------------------------------

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
  city: string;
  street: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ReactivateFormData {
  email: string;
}

// ----------------------------------------------------
// Backend Contract Error Codes
// ----------------------------------------------------

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_SOFT_DELETED'
  | 'ACCOUNT_BANNED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'PHONE_ALREADY_EXISTS'
  | 'INVALID_OR_EXPIRED_TOKEN'
  | 'GOOGLE_ACCOUNT_NO_PASSWORD'
  | 'USER_NOT_FOUND_REQUIRE_REGISTRATION'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_VERIFIED'
  | 'SAME_PASSWORD'
  | 'ACCOUNT_DISABLED';
